import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { buildLiveLookup, fetchLiveRows, isTournamentLikelyFinal, statusForBet } from "@/lib/live-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";

function closeEnough(a: number | null, b: number | null) {
  if (a === null || b === null) return true;
  return Math.abs(Number(a) - Number(b)) < 0.0001;
}

function normalizeTour(input: string | null | undefined) {
  const t = (input || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
  return "pga";
}

function normalizeName(name: string | null | undefined) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z, ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parsePosition(pos: unknown): number | null {
  if (pos === null || pos === undefined) return null;
  const match = String(pos).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function finishTarget(marketRaw: string | null | undefined) {
  const market = (marketRaw || "").toLowerCase();
  if (market.includes("top 5") || market.includes("top5")) return 5;
  if (market.includes("top 10") || market.includes("top10")) return 10;
  if (market.includes("top 20") || market.includes("top20")) return 20;
  return null;
}

function findMatchingSlip(slips: any[], bet: any) {
  return slips.find((s) => {
    const sameMarket = (s.market || "").trim().toLowerCase() === (bet.betType || "").trim().toLowerCase();
    const samePlayer = (s.playerName || "").trim().toLowerCase() === (bet.playerName || "").trim().toLowerCase();
    const sameDg = s.dgId && bet.dgId != null ? String(s.dgId) === String(bet.dgId) : true;
    const sameBook = s.marketBookBest && bet.marketBookBest
      ? String(s.marketBookBest).toLowerCase() === String(bet.marketBookBest).toLowerCase()
      : true;
    const slipOdds = s.oddsEnteredDec ?? s.marketOddsBestDec;
    const sameOdds = closeEnough(slipOdds, bet.marketOddsBestDec);
    return sameMarket && samePlayer && sameDg && sameBook && sameOdds;
  }) ?? null;
}

function calcReturnUnits(outcome: "win" | "loss" | "push", stakeRaw: unknown, oddsRaw: unknown) {
  const stake = Number(stakeRaw) || 0;
  const odds = Number(oddsRaw) || 0;
  if (outcome === "push") return 0;
  if (outcome === "loss") return -stake;
  if (!stake || !odds) return null;
  return stake * (odds - 1);
}

function outcomeFromStatus(statusRaw: string, allowCurrent = false): "win" | "loss" | "push" | null {
  const status = (statusRaw || "").toLowerCase();
  if (status === "won") return "win";
  if (status === "lost") return "loss";
  if (status === "push") return "push";

  if (!allowCurrent) return null;
  if (status.includes("currently winning")) return "win";
  if (status.includes("currently losing")) return "loss";
  if (status.includes("currently tied")) return "push";
  return null;
}

function finalFinishReturnUnits(input: {
  market: string | null | undefined;
  playerRow: any | null;
  rows: any[];
  stake: unknown;
  odds: unknown;
}) {
  const target = finishTarget(input.market);
  if (!target || !input.playerRow) return null;

  const stake = Number(input.stake) || 0;
  const odds = Number(input.odds) || 0;
  if (!stake || !odds) return null;

  const pos = parsePosition(input.playerRow.current_pos);
  if (pos === null || pos > target) return -stake;

  const tieCount = input.rows.filter((row) => parsePosition(row?.current_pos) === pos).length || 1;
  const paidPlacesRemaining = Math.max(0, target - pos + 1);
  const paidFraction = Math.min(1, paidPlacesRemaining / tieCount);

  // Dead-heat rule: paid fraction of stake wins at decimal odds; the rest loses.
  return stake * (paidFraction * odds - 1);
}

async function getCurrentMeta(tour: string) {
  if (!OUTPUT_BASE) return null;
  try {
    const res = await fetch(`${OUTPUT_BASE}/${tour}/event_meta.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const meta = await res.json();
    return normalizeTour(meta?.tour) === tour ? meta : null;
  } catch {
    return null;
  }
}

async function settleWeek(week: any, opts: { forceFinal?: boolean; requireCurrentMeta?: boolean; currentMeta?: any | null; finalOnly?: boolean } = {}) {
  const tour = normalizeTour(week.tour);

  if (opts.requireCurrentMeta && opts.currentMeta?.eventId && String(opts.currentMeta.eventId) !== String(week.eventId)) {
    return { weekId: week.id, eventName: week.eventName, tour, settled: 0, skipped: 0, final: false, message: "Skipped: not current output event." };
  }

  const unsettled = (week.bets || []).filter((b: any) => b.resultWinFlag === null || b.resultWinFlag === undefined);
  if (!unsettled.length) {
    return { weekId: week.id, eventName: week.eventName, tour, settled: 0, skipped: 0, final: Boolean(week.isFinal), message: "No unsettled bets." };
  }

  const live = await fetchLiveRows(tour);
  if (live.error) {
    throw new Error(live.error);
  }

  const leaderboardFinal = isTournamentLikelyFinal(live.rows);
  const finalForSettlement = Boolean(opts.forceFinal || week.isFinal || leaderboardFinal);
  if (opts.finalOnly && !finalForSettlement) {
    return { weekId: week.id, eventName: week.eventName, tour, settled: 0, skipped: unsettled.length, final: false, message: "Skipped: tournament not final yet." };
  }

  const lookup = buildLiveLookup(live.rows);
  const placedItems = await getPrisma().betslipItem.findMany({
    where: { tour, eventId: week.eventId, status: "PLACED" },
    orderBy: { createdAt: "asc" },
  });

  let settled = 0;
  let skipped = 0;
  const updates: Array<Promise<any>> = [];

  for (const bet of unsettled) {
    const slip = findMatchingSlip(placedItems, bet);
    const playerRow = bet.dgId != null
      ? lookup.byDgId.get(String(bet.dgId)) ?? null
      : lookup.byName.get(normalizeName(bet.playerName)) ?? null;

    const liveStatus = statusForBet(
      {
        market: bet.betType,
        playerName: bet.playerName,
        dgId: bet.dgId,
        opponents: slip?.opponents ?? null,
      },
      lookup,
      live.info?.last_update ?? null
    );

    const outcome = outcomeFromStatus(liveStatus.status, finalForSettlement);
    if (!outcome) {
      skipped += 1;
      continue;
    }

    let returnUnits = finalForSettlement && outcome === "win"
      ? finalFinishReturnUnits({ market: bet.betType, playerRow, rows: live.rows, stake: bet.stakeUnits, odds: bet.marketOddsBestDec })
      : null;
    if (returnUnits === null) {
      returnUnits = calcReturnUnits(outcome, bet.stakeUnits, bet.marketOddsBestDec);
    }
    if (returnUnits === null) {
      skipped += 1;
      continue;
    }

    updates.push(getPrisma().bet.update({
      where: { id: bet.id },
      data: {
        resultWinFlag: outcome === "loss" ? 0 : 1,
        returnUnits,
      },
    }));
    settled += 1;
  }

  if (leaderboardFinal && !week.isFinal) {
    updates.push(getPrisma().week.update({ where: { id: week.id }, data: { isFinal: true } }));
  }

  if (updates.length) await Promise.all(updates);

  return {
    weekId: week.id,
    eventName: week.eventName,
    tour,
    settled,
    skipped,
    final: finalForSettlement,
    message: `Auto-settled ${settled} bet${settled === 1 ? "" : "s"}; skipped ${skipped}.`,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const weekId = Number(body?.weekId);
    if (!Number.isFinite(weekId)) {
      return NextResponse.json({ ok: false, error: "Invalid weekId" }, { status: 400 });
    }

    const week = await getPrisma().week.findUnique({ where: { id: weekId }, include: { bets: true } });
    if (!week) return NextResponse.json({ ok: false, error: "Week not found" }, { status: 404 });

    const result = await settleWeek(week, { forceFinal: Boolean(body?.forceFinal) });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const forceFinal = url.searchParams.get("forceFinal") === "1";
    const requestedTour = url.searchParams.get("tour");
    const tourFilter = requestedTour ? normalizeTour(requestedTour) : null;

    const prisma = getPrisma();
    const weeks = await prisma.week.findMany({
      where: {
        ...(tourFilter ? { tour: tourFilter } : {}),
        bets: { some: { resultWinFlag: null } },
      },
      include: { bets: true },
      orderBy: { createdAt: "desc" },
    });

    const metaByTour = new Map<string, any | null>();
    const results = [];
    for (const week of weeks) {
      const tour = normalizeTour(week.tour);
      if (!metaByTour.has(tour)) metaByTour.set(tour, await getCurrentMeta(tour));
      results.push(await settleWeek(week, {
        forceFinal,
        requireCurrentMeta: !forceFinal,
        currentMeta: metaByTour.get(tour),
        finalOnly: !forceFinal,
      }));
    }

    return NextResponse.json({
      ok: true,
      checkedWeeks: weeks.length,
      settled: results.reduce((acc, r) => acc + r.settled, 0),
      skipped: results.reduce((acc, r) => acc + r.skipped, 0),
      results,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
