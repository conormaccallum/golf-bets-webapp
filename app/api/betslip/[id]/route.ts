import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  computeStakeUnits,
  BANKROLL_UNITS,
  MAX_BET_FRAC,
  stakeMultiplierForMarket,
} from "@/lib/staking";

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

async function recalcPending(eventId: string) {
  const prisma = getPrisma();
  const pending = await prisma.betslipItem.findMany({
    where: { eventId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  const placed = await prisma.betslipItem.findMany({
    where: { eventId, status: "PLACED" },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const body = await req.json();
    const item = await prisma.betslipItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

    await prisma.betslipItem.update({
      where: { id },
      data: {
        oddsEnteredDec: body.oddsEnteredDec ?? item.oddsEnteredDec,
        marketBookBest: body.marketBookBest ?? item.marketBookBest,
        status: body.status ?? item.status,
        archivedAt: null,
      },
    });

    await recalcPending(item.eventId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const item = await prisma.betslipItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ ok: true });
    await prisma.betslipItem.delete({ where: { id } });
    await recalcPending(item.eventId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
