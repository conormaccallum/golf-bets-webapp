import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { computeStakeUnits, BANKROLL_UNITS, MIN_EDGE, MAX_BET_FRAC } from "@/lib/staking";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";

function pickUrl(name: string) {
  return `${OUTPUT_BASE}/${name}`;
}

async function getMeta() {
  const res = await fetch(pickUrl("event_meta.json"), { cache: "no-store" });
  if (!res.ok) throw new Error("event_meta.json not found");
  return res.json();
}

function makeUniqueKey(input: {
  eventId: string;
  market: string;
  dgId: string | null;
  playerName: string;
  opponents?: string | null;
}) {
  return [input.eventId, input.market, input.dgId || "", input.playerName, input.opponents || ""].join("|");
}

async function recalcPending(eventId: string) {
  const prisma = getPrisma();
  const pending = await prisma.betslipItem.findMany({
    where: { eventId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  const recalced = pending.map((b) => {
    const oddsDec = b.marketOddsBestDec ?? b.oddsEnteredDec ?? 0;
    const p = b.pModel ?? 0;
    const { edge, evPerUnit, kellyFull, kellyFrac, stakeRaw } = computeStakeUnits(p, oddsDec);
    return {
      id: b.id,
      edgeProb: edge,
      evPerUnit,
      kellyFull,
      kellyFrac,
      stakeUnits: stakeRaw,
    };
  });

  const sumStake = recalced.reduce((acc, r) => acc + r.stakeUnits, 0);
  const scale = sumStake > 0 ? BANKROLL_UNITS / sumStake : 0;

  for (const r of recalced) {
    let scaled = r.stakeUnits * scale;
    const cap = BANKROLL_UNITS * MAX_BET_FRAC;
    if (scaled > cap) scaled = cap;
    await prisma.betslipItem.update({
      where: { id: r.id },
      data: {
        edgeProb: r.edgeProb,
        evPerUnit: r.evPerUnit,
        kellyFull: r.kellyFull,
        kellyFrac: r.kellyFrac,
        stakeUnits: Number.isFinite(scaled) ? scaled : 0,
      },
    });
  }
}

export async function GET() {
  try {
    const prisma = getPrisma();
    const meta = await getMeta();
    const items = await prisma.betslipItem.findMany({
      where: { eventId: meta.eventId },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({
      ok: true,
      meta,
      eventMeta: meta,
      items,
      bankrollUnits: BANKROLL_UNITS,
      minEdge: MIN_EDGE,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const meta = await getMeta();
    const body = await req.json();
    const dgId = body.dgId !== undefined && body.dgId !== null && body.dgId !== ""
      ? String(body.dgId)
      : null;
    const uniqueKey = makeUniqueKey({
      eventId: meta.eventId,
      market: body.market,
      dgId,
      playerName: body.playerName,
      opponents: body.opponents || null,
    });

    await prisma.betslipItem.upsert({
      where: { uniqueKey },
      update: {},
      create: {
        uniqueKey,
        eventId: meta.eventId,
        eventName: meta.eventName,
        eventYear: meta.eventYear,
        market: body.market,
        playerName: body.playerName,
        dgId,
        opponents: body.opponents || null,
        marketBookBest: body.marketBookBest || null,
        marketOddsBestDec: body.marketOddsBestDec || null,
        oddsEnteredDec: body.marketOddsBestDec || null,
        pModel: body.pModel ?? null,
        status: "PENDING",
      },
    });

    await recalcPending(meta.eventId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
