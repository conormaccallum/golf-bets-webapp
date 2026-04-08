import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";
const ARCHIVE_TOKEN = process.env.ARCHIVE_TOKEN || "";
const ALLOW_MANUAL_ARCHIVE = process.env.ALLOW_MANUAL_ARCHIVE === "true";
const DEFAULT_TOUR = "pga";

function normalizeTour(input: string | null) {
  const t = (input || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
  return "pga";
}

function betSignature(input: {
  betType: string;
  playerName: string;
  dgId: number | null;
  marketBookBest: string | null;
  marketOddsBestDec: number | null;
  stakeUnits: number | null;
}) {
  return [
    input.betType,
    input.playerName,
    input.dgId ?? "",
    input.marketBookBest ?? "",
    input.marketOddsBestDec ?? "",
    input.stakeUnits ?? "",
  ].join("|");
}

async function fetchFromOutputs(tour: string, name: string): Promise<Response> {
  const primary = `${OUTPUT_BASE}/${tour}/${name}?t=${Date.now()}`;
  const fallback = `${OUTPUT_BASE}/${name}?t=${Date.now()}`;
  const res = await fetch(primary, { cache: "no-store" });
  if (res.ok || res.status !== 404) return res;
  const res2 = await fetch(fallback, { cache: "no-store" });
  return res2.ok ? res2 : res;
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const manual = req.headers.get("x-archive-manual") === "true";
  const clearAfter = req.headers.get("x-archive-clear") === "true";
  const authed = ARCHIVE_TOKEN && auth === `Bearer ${ARCHIVE_TOKEN}`;
  if (!authed && !(ALLOW_MANUAL_ARCHIVE && manual)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const tour = normalizeTour(url.searchParams.get("tour") || DEFAULT_TOUR);
    let placed = await prisma.betslipItem.findMany({
      where: { tour, status: "PLACED", archivedAt: null },
      orderBy: [{ eventYear: "desc" }, { eventName: "asc" }, { createdAt: "asc" }],
    });

    // Manual archive acts as a repair path too: rebuild weeks from existing placed bets
    // even if those rows were already marked archived by an earlier broken run.
    if (placed.length === 0 && manual) {
      placed = await prisma.betslipItem.findMany({
        where: { tour, status: "PLACED" },
        orderBy: [{ eventYear: "desc" }, { eventName: "asc" }, { createdAt: "asc" }],
      });
    }

    if (placed.length === 0) {
      return NextResponse.json({ ok: true, archived: 0 });
    }

    const groups = new Map<string, typeof placed>();
    for (const b of placed) {
      const key = `${b.eventId}|${b.eventYear}|${b.eventName}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(b);
    }

    for (const group of groups.values()) {
      const sample = group[0];
      const label = `${sample.eventName} ${sample.eventYear}`;
      const week = await prisma.week.upsert({
        where: { eventId_tour: { eventId: sample.eventId, tour } },
        update: { label, eventName: sample.eventName, eventYear: sample.eventYear },
        create: {
          label,
          eventId: sample.eventId,
          eventName: sample.eventName,
          eventYear: sample.eventYear,
          tour,
        },
      });

      const existingBets = await prisma.bet.findMany({ where: { weekId: week.id } });
      const existingBySig = new Map(
        existingBets.map((b) => [
          betSignature({
            betType: b.betType,
            playerName: b.playerName,
            dgId: b.dgId,
            marketBookBest: b.marketBookBest,
            marketOddsBestDec: b.marketOddsBestDec,
            stakeUnits: b.stakeUnits,
          }),
          b,
        ])
      );

      for (const b of group) {
        const dgIdNum =
          b.dgId !== null && b.dgId !== undefined && b.dgId !== ""
            ? Number(b.dgId)
            : null;
        const betData = {
          weekId: week.id,
          betType: b.market,
          tour,
          playerName: b.playerName,
          dgId: Number.isFinite(dgIdNum as number) ? (dgIdNum as number) : null,
          marketBookBest: b.marketBookBest ?? "",
          marketOddsBestDec: b.oddsEnteredDec ?? b.marketOddsBestDec ?? 0,
          stakeUnits: b.stakeUnits ?? 0,
          pModel: b.pModel ?? 0,
          edgeProb: b.edgeProb ?? 0,
          evPerUnit: b.evPerUnit ?? 0,
          kellyFull: b.kellyFull ?? 0,
          kellyFrac: b.kellyFrac ?? 0,
        };
        const sig = betSignature({
          betType: betData.betType,
          playerName: betData.playerName,
          dgId: betData.dgId,
          marketBookBest: betData.marketBookBest,
          marketOddsBestDec: betData.marketOddsBestDec,
          stakeUnits: betData.stakeUnits,
        });
        const existing = existingBySig.get(sig);
        if (existing) {
          await prisma.bet.update({
            where: { id: existing.id },
            data: {
              marketBookBest: betData.marketBookBest,
              marketOddsBestDec: betData.marketOddsBestDec,
              stakeUnits: betData.stakeUnits,
              pModel: betData.pModel,
              edgeProb: betData.edgeProb,
              evPerUnit: betData.evPerUnit,
              kellyFull: betData.kellyFull,
              kellyFrac: betData.kellyFrac,
            },
          });
          continue;
        }
        await prisma.bet.create({ data: betData });
      }
    }

    if (clearAfter) {
      await prisma.betslipItem.deleteMany({ where: { tour, status: "PLACED", archivedAt: null } });
    } else if (!manual) {
      await prisma.betslipItem.updateMany({
        where: { tour, status: "PLACED", archivedAt: null },
        data: { archivedAt: new Date() },
      });
    } else {
      await prisma.betslipItem.updateMany({
        where: { tour, status: "PLACED", archivedAt: null },
        data: { archivedAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true, archived: placed.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
