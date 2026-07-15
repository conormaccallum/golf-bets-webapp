import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { parseCsv, rowsToObjects, toNumber } from "@/lib/csv";
import {
  computeStakeUnits,
  BANKROLL_UNITS,
  MIN_EDGE,
  MIN_EV_PER_UNIT,
  MAX_BET_FRAC,
  stakeMultiplierForMarket,
  qualifiesMarketBet,
  marketCriteria,
} from "@/lib/staking";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";
const DEFAULT_TOUR = "pga";

function normalizeTour(input: string | null | undefined) {
  const t = (input || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
  return "pga";
}

async function fetchFromOutputs(tour: string, name: string): Promise<Response> {
  const primary = `${OUTPUT_BASE}/${tour}/${name}?t=${Date.now()}`;
  const fallback = `${OUTPUT_BASE}/${name}?t=${Date.now()}`;
  const res = await fetch(primary, { cache: "no-store" });
  if (res.ok || res.status !== 404) return res;
  const res2 = await fetch(fallback, { cache: "no-store" });
  return res2.ok ? res2 : res;
}

function normalizeMarketName(name: string) {
  if (name === "win") return "Win";
  if (name === "top5") return "Top 5";
  if (name === "top10") return "Top 10";
  if (name === "top20") return "Top 20";
  if (name === "makeCut") return "Make Cut";
  if (name === "missCut") return "Miss Cut";
  if (name === "matchup2") return "Matchup 2-Ball";
  if (name === "matchup3") return "Matchup 3-Ball";
  return name;
}

async function getMeta(tour: string) {
  const res = await fetchFromOutputs(tour, "event_meta.json");
  if (!res.ok) throw new Error("event_meta.json not found");
  const meta = await res.json();
  const metaTour = meta?.tour ? normalizeTour(meta.tour) : tour;
  if (metaTour !== tour) throw new Error(`event_meta.json is for ${metaTour}, not ${tour}`);
  return meta;
}

function makeUniqueKey(input: {
  tour: string;
  eventId: string;
  market: string;
  dgId: string | null;
  playerName: string;
  opponents?: string | null;
}) {
  return [input.tour, input.eventId, input.market, input.dgId || "", input.playerName, input.opponents || ""].join("|");
}

function playerKey(dgId: string | null, playerName: string) {
  return dgId ? `dg:${dgId}` : `name:${playerName}`;
}

function splitOpponents(opponents: string | null) {
  if (!opponents) return [];
  return opponents
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function applyPlayerCap<T extends { id: string; stakeUnits: number }>(
  recalced: Array<T>,
  pending: Array<{
    id: string;
    dgId: string | null;
    playerName: string;
    market: string;
    opponents: string | null;
  }>,
  placed: Array<{
    dgId: string | null;
    playerName: string;
    market: string;
    opponents: string | null;
    stakeUnits: number | null;
  }>
) {
  const cap = BANKROLL_UNITS * 0.15;
  const sumByPlayerPending = new Map<string, number>();
  const sumByPlayerPlaced = new Map<string, number>();
  const sumByOpponentPending = new Map<string, number>();
  const sumByOpponentPlaced = new Map<string, number>();

  for (const r of recalced) {
    const p = pending.find((x) => x.id === r.id);
    if (!p) continue;
    const key = playerKey(p.dgId, p.playerName);
    sumByPlayerPending.set(key, (sumByPlayerPending.get(key) || 0) + r.stakeUnits);

    const market = (p.market || "").toLowerCase();
    if (market.includes("matchup")) {
      for (const opp of splitOpponents(p.opponents)) {
        const ok = playerKey(null, opp);
        sumByOpponentPending.set(ok, (sumByOpponentPending.get(ok) || 0) + r.stakeUnits);
      }
    }
    if (market.includes("miss cut")) {
      const ok = playerKey(p.dgId, p.playerName);
      sumByOpponentPending.set(ok, (sumByOpponentPending.get(ok) || 0) + r.stakeUnits);
    }
  }

  for (const p of placed) {
    const key = playerKey(p.dgId, p.playerName);
    const stake = Number(p.stakeUnits) || 0;
    sumByPlayerPlaced.set(key, (sumByPlayerPlaced.get(key) || 0) + stake);

    const market = (p.market || "").toLowerCase();
    if (market.includes("matchup")) {
      for (const opp of splitOpponents(p.opponents)) {
        const ok = playerKey(null, opp);
        sumByOpponentPlaced.set(ok, (sumByOpponentPlaced.get(ok) || 0) + stake);
      }
    }
    if (market.includes("miss cut")) {
      const ok = playerKey(p.dgId, p.playerName);
      sumByOpponentPlaced.set(ok, (sumByOpponentPlaced.get(ok) || 0) + stake);
    }
  }

  const factorByPlayer = new Map<string, number>();
  for (const [k, sum] of sumByPlayerPending) {
    const used = sumByPlayerPlaced.get(k) || 0;
    const remaining = cap - used;
    const f = sum > 0 ? Math.min(1, Math.max(0, remaining / sum)) : 1;
    factorByPlayer.set(k, f);
  }

  const factorByOpponent = new Map<string, number>();
  for (const [k, sum] of sumByOpponentPending) {
    const used = sumByOpponentPlaced.get(k) || 0;
    const remaining = cap - used;
    const f = sum > 0 ? Math.min(1, Math.max(0, remaining / sum)) : 1;
    factorByOpponent.set(k, f);
  }
  return recalced.map((r) => {
    const p = pending.find((x) => x.id === r.id);
    if (!p) return r;
    const key = playerKey(p.dgId, p.playerName);
    const fPlayer = factorByPlayer.get(key) ?? 1;
    let fOpp = 1;
    const market = (p.market || "").toLowerCase();
    if (market.includes("matchup")) {
      const opps = splitOpponents(p.opponents);
      if (opps.length > 0) {
        fOpp = Math.min(
          ...opps.map((o) => factorByOpponent.get(playerKey(null, o)) ?? 1)
        );
      }
    }
    if (market.includes("miss cut")) {
      fOpp = factorByOpponent.get(key) ?? 1;
    }
    const f = Math.min(fPlayer, fOpp);
    return { ...r, stakeUnits: r.stakeUnits * f };
  });
}

async function recalcPending(tour: string, eventId: string) {
  const prisma = getPrisma();
  const pending = await prisma.betslipItem.findMany({
    where: { tour, eventId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  const placed = await prisma.betslipItem.findMany({
    where: { tour, eventId, status: "PLACED" },
    orderBy: { createdAt: "asc" },
  });

  const recalced = pending.map((b) => {
    const oddsDec = b.oddsEnteredDec ?? b.marketOddsBestDec ?? 0;
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

  const withPlayerCap = applyPlayerCap(
    recalced,
    pending.map((p) => ({
      id: p.id,
      dgId: p.dgId,
      playerName: p.playerName,
      market: p.market,
      opponents: p.opponents,
    })),
    placed.map((p) => ({
      dgId: p.dgId,
      playerName: p.playerName,
      market: p.market,
      opponents: p.opponents,
      stakeUnits: p.stakeUnits,
    }))
  );

  for (const r of withPlayerCap) {
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

async function buildRecommendedBetslipMap(tour: string, eventId: string) {
  const res = await fetchFromOutputs(tour, "latest_betslip.csv");
  const map = new Map<
    string,
    {
      marketOddsBestDec: number | null;
      marketBookBest: string | null;
      pModel: number | null;
      edgeProb: number | null;
      evPerUnit: number | null;
      kellyFull: number | null;
      kellyFrac: number | null;
      stakeUnits: number | null;
      opponents: string | null;
      playerName: string;
      dgId: string | null;
      market: string;
    }
  >();

  if (!res.ok) return map;
  const csv = await res.text();
  const { headers, rows } = parseCsv(csv);
  if (headers.length === 0 || rows.length === 0) return map;

  const objs = rowsToObjects(headers, rows);
  for (const r of objs) {
    const market = normalizeMarketName(String(r.bet_type || r.market || ""));
    const marketLower = market.toLowerCase();
    // Matchups are research/watchlist only for now; never auto-seed them.
    if (!market || marketLower.includes("matchup")) continue;

    const playerName = r.player_name || r.player || "";
    if (!playerName) continue;

    const dgId = r.dg_id ? String(r.dg_id) : null;
    const opponents = r.opponents || null;
    const oddsDec = toNumber(r.market_odds_best_dec);
    const evPerUnit = toNumber(r.ev_per_unit);
    if (!qualifiesMarketBet(market, evPerUnit, oddsDec)) continue;

    const uniqueKey = makeUniqueKey({
      tour,
      eventId,
      market,
      dgId,
      playerName,
      opponents,
    });

    map.set(uniqueKey, {
      marketOddsBestDec: oddsDec,
      marketBookBest: r.market_book_best || null,
      pModel: toNumber(r.p_model),
      edgeProb: toNumber(r.edge_prob),
      evPerUnit,
      kellyFull: toNumber(r.kelly_full),
      kellyFrac: toNumber(r.kelly_frac),
      stakeUnits: toNumber(r.stake_units),
      opponents,
      playerName,
      dgId,
      market,
    });
  }

  return map;
}

async function syncPendingFromOutputs(tourInput?: string) {
  const prisma = getPrisma();
  const tours = tourInput ? [normalizeTour(tourInput)] : ["pga", "dp"];

  for (const tour of tours) {
    let meta: any;
    try {
      meta = await getMeta(tour);
    } catch {
      continue;
    }
    if (!meta?.eventId) continue;

    const eventId = String(meta.eventId);
    const recommendations = await buildRecommendedBetslipMap(tour, eventId);
    const recommendedKeys = new Set(recommendations.keys());

    // Refresh Model Bets should make pending recommendations mirror the final
    // model betslip. PLACED rows are never touched here.
    await prisma.betslipItem.deleteMany({
      where: {
        tour,
        eventId,
        status: "PENDING",
        archivedAt: null,
        uniqueKey: { notIn: [...recommendedKeys] },
      },
    });

    const existing = await prisma.betslipItem.findMany({
      where: { tour, eventId },
      orderBy: { createdAt: "asc" },
    });
    const existingKeys = new Set(existing.map((b) => b.uniqueKey));

    for (const [uniqueKey, rec] of recommendations.entries()) {
      if (existingKeys.has(uniqueKey)) continue;
      if (!rec.marketOddsBestDec || !rec.marketBookBest || !rec.pModel) continue;

      const { edge, evPerUnit, kellyFull, kellyFrac, stakeRaw } = computeStakeUnits(
        rec.pModel,
        rec.marketOddsBestDec
      );
      const stakeMult = stakeMultiplierForMarket(rec.market);
      const cap = BANKROLL_UNITS * MAX_BET_FRAC;
      let stake = rec.stakeUnits ?? stakeRaw * stakeMult;
      if (stake > cap) stake = cap;

      await prisma.betslipItem.create({
        data: {
          uniqueKey,
          tour,
          eventId,
          eventName: meta.eventName,
          eventYear: meta.eventYear,
          market: rec.market,
          playerName: rec.playerName,
          dgId: rec.dgId,
          opponents: rec.opponents,
          marketBookBest: rec.marketBookBest,
          marketOddsBestDec: rec.marketOddsBestDec,
          oddsEnteredDec: rec.marketOddsBestDec,
          pModel: rec.pModel,
          edgeProb: rec.edgeProb ?? edge,
          evPerUnit: rec.evPerUnit ?? evPerUnit,
          kellyFull: rec.kellyFull ?? kellyFull,
          kellyFrac: rec.kellyFrac ?? kellyFrac,
          stakeUnits: Number.isFinite(stake) ? stake : 0,
          status: "PENDING",
        },
      });
      existingKeys.add(uniqueKey);
    }

    const pending = await prisma.betslipItem.findMany({
      where: { tour, eventId, status: "PENDING", archivedAt: null },
      orderBy: { createdAt: "asc" },
    });

    for (const b of pending) {
      const rec = recommendations.get(b.uniqueKey);
      if (!rec) continue;

      const marketOddsBestDec = rec.marketOddsBestDec ?? (b.marketOddsBestDec ?? b.oddsEnteredDec ?? null);
      const marketBookBest = rec.marketBookBest ?? b.marketBookBest ?? null;
      const pModel = rec.pModel ?? b.pModel ?? null;

      const oddsForStake = b.oddsEnteredDec ?? marketOddsBestDec ?? 0;
      const pForStake = pModel ?? 0;
      const { edge, evPerUnit, kellyFull, kellyFrac, stakeRaw } = computeStakeUnits(pForStake, oddsForStake);
      const stakeMult = stakeMultiplierForMarket(b.market);
      const cap = BANKROLL_UNITS * MAX_BET_FRAC;
      let stake = b.stakeUnitsEntered ?? rec.stakeUnits ?? stakeRaw * stakeMult;
      if (stake > cap) stake = cap;

      await prisma.betslipItem.update({
        where: { id: b.id },
        data: {
          marketOddsBestDec,
          marketBookBest,
          pModel,
          edgeProb: rec.edgeProb ?? edge,
          evPerUnit: rec.evPerUnit ?? evPerUnit,
          kellyFull: rec.kellyFull ?? kellyFull,
          kellyFrac: rec.kellyFrac ?? kellyFrac,
          stakeUnits: Number.isFinite(stake) ? stake : 0,
        },
      });
    }

    await recalcPending(tour, eventId);
  }
}

export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const sync = url.searchParams.get("sync") === "1";
    const tour = normalizeTour(url.searchParams.get("tour") || DEFAULT_TOUR);
    if (sync) {
      await syncPendingFromOutputs(tour);
    }
    const meta = await getMeta(tour);
    const items = await prisma.betslipItem.findMany({
      where: { tour, eventId: String(meta.eventId), archivedAt: null },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({
      ok: true,
      meta,
      eventMeta: meta,
      tour,
      items,
      bankrollUnits: BANKROLL_UNITS,
      minEdge: MIN_EDGE,
      minEvPerUnit: MIN_EV_PER_UNIT,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const tour = normalizeTour(body.tour || DEFAULT_TOUR);
    const meta = await getMeta(tour);
    const dgId = body.dgId !== undefined && body.dgId !== null && body.dgId !== ""
      ? String(body.dgId)
      : null;
    const uniqueKey = makeUniqueKey({
      tour,
      eventId: meta.eventId,
      market: body.market,
      dgId,
      playerName: body.playerName,
      opponents: body.opponents || null,
    });

    const marketOddsBestDec = toNumber(body.marketOddsBestDec);
    const pModel = toNumber(body.pModel);
    const evPerUnit = pModel !== null && marketOddsBestDec !== null && marketOddsBestDec > 1
      ? pModel * (marketOddsBestDec - 1) - (1 - pModel)
      : null;
    if (!qualifiesMarketBet(body.market, evPerUnit, marketOddsBestDec)) {
      const criteria = marketCriteria(body.market);
      return NextResponse.json(
        {
          ok: false,
          error: criteria
            ? `Bet does not meet model criteria: EV/unit must be >= ${criteria.minEv} and odds must be <= ${criteria.oddsCap}.`
            : "Bet market is not part of the active model criteria.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.betslipItem.findUnique({ where: { uniqueKey } });
    if (existing) {
      const alreadyPlaced = existing.status === "PLACED" || existing.archivedAt !== null;
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          duplicateStatus: alreadyPlaced ? "PLACED" : "PENDING",
          error: alreadyPlaced
            ? "Potential duplicate: this exact bet has already been marked placed for this event."
            : "That bet is already in the active betslip.",
        },
        { status: 409 }
      );
    }

    await prisma.betslipItem.create({
      data: {
        uniqueKey,
        tour,
        eventId: String(meta.eventId),
        eventName: meta.eventName,
        eventYear: meta.eventYear,
        market: body.market,
        playerName: body.playerName,
        dgId,
        opponents: body.opponents || null,
        marketBookBest: body.marketBookBest || null,
        marketOddsBestDec,
        oddsEnteredDec: marketOddsBestDec,
        pModel,
        status: "PENDING",
      },
    });

    await recalcPending(tour, String(meta.eventId));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
