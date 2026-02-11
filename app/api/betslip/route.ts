import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { parseCsv, rowsToObjects, toNumber } from "@/lib/csv";
import {
  computeStakeUnits,
  BANKROLL_UNITS,
  MIN_EDGE,
  MAX_BET_FRAC,
  stakeMultiplierForMarket,
} from "@/lib/staking";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";

function pickUrl(name: string) {
  return `${OUTPUT_BASE}/${name}`;
}

function normalizeMarketName(name: string) {
  if (name === "top20") return "Top 20";
  if (name === "makeCut") return "Make Cut";
  if (name === "missCut") return "Miss Cut";
  if (name === "matchup2") return "Matchup 2-Ball";
  if (name === "matchup3") return "Matchup 3-Ball";
  return name;
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
    const stakeMult = stakeMultiplierForMarket(b.market);
    return {
      id: b.id,
      edgeProb: edge,
      evPerUnit,
      kellyFull,
      kellyFrac,
      stakeUnits: stakeRaw * stakeMult,
    };
  });

  for (const r of recalced) {
    const cap = BANKROLL_UNITS * MAX_BET_FRAC;
    let stake = r.stakeUnits;
    if (stake > cap) stake = cap;
    await prisma.betslipItem.update({
      where: { id: r.id },
      data: {
        edgeProb: r.edgeProb,
        evPerUnit: r.evPerUnit,
        kellyFull: r.kellyFull,
        kellyFrac: r.kellyFrac,
        stakeUnits: Number.isFinite(stake) ? stake : 0,
      },
    });
  }
}

async function buildOutputMap(eventId: string) {
  const markets = [
    { key: "top20", file: "latest_value_top20.csv" },
    { key: "makeCut", file: "latest_value_make_cut.csv" },
    { key: "missCut", file: "latest_value_miss_cut.csv" },
    { key: "matchup2", file: "latest_value_matchups_2ball.csv" },
    { key: "matchup3", file: "latest_value_matchups_3ball.csv" },
  ];
  const map = new Map<
    string,
    {
      marketOddsBestDec: number | null;
      marketBookBest: string | null;
      pModel: number | null;
      edgeProb: number | null;
      opponents: string | null;
    }
  >();

  for (const m of markets) {
    const res = await fetch(pickUrl(m.file), { cache: "no-store" });
    if (!res.ok) continue;
    const csv = await res.text();
    const { headers, rows } = parseCsv(csv);
    if (headers.length === 0 || rows.length === 0) continue;
    const objs = rowsToObjects(headers, rows);

    for (const r of objs) {
      const playerName =
        r.player_name ||
        r.player ||
        r.p1_player_name ||
        r.p2_player_name ||
        r.p3_player_name ||
        "";
      if (!playerName) continue;
      const opponents = r.opponents || r.p2_player_name || r.p3_player_name || "";
      const dgIdRaw = r.dg_id || r.p1_dg_id || r.p2_dg_id || r.p3_dg_id || "";
      const dgId = dgIdRaw ? String(dgIdRaw) : null;
      const market = normalizeMarketName(m.key);
      const uniqueKey = makeUniqueKey({
        eventId,
        market,
        dgId,
        playerName,
        opponents,
      });

      const marketOddsBestDec =
        toNumber(r.market_odds_best_dec) ?? toNumber(r.market_odds) ?? toNumber(r.odds);
      const marketBookBest = r.market_book_best || r.market_book || r.book || null;
      const pModel =
        toNumber(r.p_model) ??
        toNumber(r.top20_prob_anchored_dh) ??
        toNumber(r.top20_prob_anchored) ??
        toNumber(r.top20_prob_model) ??
        toNumber(r.p_make_cut_model) ??
        toNumber(r.p_miss_cut_model) ??
        null;
      const edgeProb = toNumber(r.edge_prob);

      map.set(uniqueKey, {
        marketOddsBestDec,
        marketBookBest,
        pModel,
        edgeProb,
        opponents: opponents || null,
      });
    }
  }

  return map;
}

async function syncPendingFromOutputs(eventId: string) {
  const prisma = getPrisma();
  const outputs = await buildOutputMap(eventId);
  const pending = await prisma.betslipItem.findMany({
    where: { eventId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  for (const b of pending) {
    const fromOut = outputs.get(b.uniqueKey);
    if (!fromOut) continue;

    const marketOddsBestDec =
      fromOut.marketOddsBestDec ?? (b.marketOddsBestDec ?? b.oddsEnteredDec ?? null);
    const marketBookBest = fromOut.marketBookBest ?? b.marketBookBest ?? null;
    const pModel = fromOut.pModel ?? b.pModel ?? null;

    const oddsForStake = b.oddsEnteredDec ?? marketOddsBestDec ?? 0;
    const pForStake = pModel ?? 0;
    const { edge, evPerUnit, kellyFull, kellyFrac, stakeRaw } = computeStakeUnits(pForStake, oddsForStake);
    const stakeMult = stakeMultiplierForMarket(b.market);
    const cap = BANKROLL_UNITS * MAX_BET_FRAC;
    let stake = stakeRaw * stakeMult;
    if (stake > cap) stake = cap;

    await prisma.betslipItem.update({
      where: { id: b.id },
      data: {
        marketOddsBestDec,
        marketBookBest,
        pModel,
        edgeProb: edge,
        evPerUnit,
        kellyFull,
        kellyFrac,
        stakeUnits: Number.isFinite(stake) ? stake : 0,
      },
    });
  }
}

export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const meta = await getMeta();
    const url = new URL(req.url);
    const sync = url.searchParams.get("sync") === "1";
    if (sync) {
      await syncPendingFromOutputs(meta.eventId);
    }
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
