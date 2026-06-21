import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { buildLiveLookup, fetchLiveRows, statusForBet } from "@/lib/live-status";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";


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

async function getMeta(tour: string) {
  const res = await fetchFromOutputs(tour, "event_meta.json");
  if (!res.ok) return null;
  return res.json();
}

function betSignature(input: {
  market: string | null;
  playerName: string | null;
  dgId: string | number | null;
  odds: number | null;
  stake: number | null;
}) {
  return [
    (input.market || "").trim().toLowerCase(),
    (input.playerName || "").trim().toLowerCase(),
    input.dgId ?? "",
    input.odds ?? "",
    input.stake ?? "",
  ].join("|");
}

function settledStatus(resultWinFlag: number | null, returnUnits: number | null, liveStatus: string) {
  if (resultWinFlag === 1) {
    if (returnUnits !== null && Number(returnUnits) === 0) return "Settled: Push";
    return returnUnits !== null && returnUnits < 0 ? "Settled: DHR" : "Settled: Win";
  }
  if (resultWinFlag === 0) return "Settled: Loss";
  return liveStatus;
}

function closeEnough(a: number | null, b: number | null) {
  if (a === null || b === null) return true;
  return Math.abs(Number(a) - Number(b)) < 0.0001;
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

function projectedReturnUnits(input: {
  liveStatus: string;
  stake: number | null;
  odds: number | null;
  returnUnits: number | null;
}) {
  const status = (input.liveStatus || "").toLowerCase();
  if (status.includes("settled")) return Number(input.returnUnits) || 0;
  if (status === "push") return 0;
  const stake = Number(input.stake) || 0;
  const odds = Number(input.odds) || 0;
  if (!stake || !odds) return null;
  if (status === "won" || status.includes("winning") || status.includes("likely winning")) return stake * (odds - 1);
  if (status === "lost" || status.includes("losing") || status.includes("likely losing")) return -stake;
  return null;
}

function projectedOutcome(liveStatus: string) {
  const status = (liveStatus || "").toLowerCase();
  if (status === "won" || status.includes("winning") || status.includes("settled: win") || status.includes("likely winning")) return "win";
  if (status === "lost" || status.includes("losing") || status.includes("settled: loss") || status.includes("likely losing")) return "loss";
  if (status === "push" || status.includes("settled: push")) return "push";
  return "pending";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tour = normalizeTour(searchParams.get("tour"));
    const prisma = getPrisma();
    const now = new Date();
    const ytdYear = now.getUTCFullYear();
    const meta = await getMeta(tour);
    const eventId = meta?.eventId ? String(meta.eventId) : "";

    const weeks = await prisma.week.findMany({
      where: { tour, eventYear: ytdYear },
      include: { bets: true },
      orderBy: { createdAt: "desc" },
    });

    const allBets = weeks.flatMap((w) => w.bets.map((b) => ({ ...b, week: w })));
    const settled = allBets.filter((b) => b.resultWinFlag !== null);
    const won = settled.filter((b) => b.resultWinFlag === 1 && Number(b.returnUnits) !== 0).length;
    const lost = settled.filter((b) => b.resultWinFlag === 0).length;
    const pnl = allBets.reduce((acc, b) => acc + (Number(b.returnUnits) || 0), 0);
    const staked = allBets.reduce((acc, b) => acc + (Number(b.stakeUnits) || 0), 0);
    const best = allBets
      .filter((b) => b.returnUnits !== null && b.returnUnits !== undefined)
      .sort((a, b) => (Number(b.returnUnits) || 0) - (Number(a.returnUnits) || 0))[0] || null;

    const placedItems = eventId
      ? await prisma.betslipItem.findMany({
          // Include archived rows too: once a bet is committed to Performance,
          // archive-placed marks it archived, but it is still a placed bet for the event.
          where: { tour, eventId, status: "PLACED" },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const currentWeek = eventId
      ? weeks.find((w) => String(w.eventId) === eventId && w.tour === tour)
      : null;
    const performanceBets = currentWeek?.bets ?? [];

    const betslipBySignature = new Map(
      placedItems.map((b) => [
        betSignature({
          market: b.market,
          playerName: b.playerName,
          dgId: b.dgId,
          odds: b.oddsEnteredDec ?? b.marketOddsBestDec,
          stake: b.stakeUnitsEntered ?? b.stakeUnits,
        }),
        b,
      ])
    );

    const weeklyRows: any[] = [];
    const usedBetslipIds = new Set<string>();

    for (const b of performanceBets) {
      const sig = betSignature({
        market: b.betType,
        playerName: b.playerName,
        dgId: b.dgId,
        odds: b.marketOddsBestDec,
        stake: b.stakeUnits,
      });
      const slip = betslipBySignature.get(sig) ?? findMatchingSlip(placedItems, b);
      if (slip) usedBetslipIds.add(slip.id);
      weeklyRows.push({
        id: `performance-${b.id}`,
        source: "performance",
        market: b.betType,
        playerName: b.playerName,
        dgId: b.dgId,
        opponents: slip?.opponents ?? null,
        book: b.marketBookBest,
        odds: b.marketOddsBestDec,
        stake: b.stakeUnits,
        pModel: b.pModel,
        evPerUnit: b.evPerUnit,
        resultWinFlag: b.resultWinFlag,
        returnUnits: b.returnUnits,
      });
    }

    for (const b of placedItems) {
      if (usedBetslipIds.has(b.id)) continue;
      weeklyRows.push({
        id: `betslip-${b.id}`,
        source: "betslip",
        market: b.market,
        playerName: b.playerName,
        dgId: b.dgId,
        opponents: b.opponents,
        book: b.marketBookBest,
        odds: b.oddsEnteredDec ?? b.marketOddsBestDec,
        stake: b.stakeUnitsEntered ?? b.stakeUnits,
        pModel: b.pModel,
        evPerUnit: b.evPerUnit,
        resultWinFlag: null,
        returnUnits: null,
      });
    }

    const live = await fetchLiveRows(tour);
    const liveLookup = buildLiveLookup(live.rows);
    const liveLastUpdate = live.info?.last_update ?? null;

    const weeklyPlaced = weeklyRows.map((b) => {
      const liveStatus = statusForBet(
        { market: b.market, playerName: b.playerName, dgId: b.dgId, opponents: b.opponents },
        liveLookup,
        liveLastUpdate
      );
      const status = settledStatus(b.resultWinFlag, b.returnUnits, liveStatus.status);
      const projectedReturn = projectedReturnUnits({
        liveStatus: status,
        stake: b.stake,
        odds: b.odds,
        returnUnits: b.returnUnits,
      });
      const projected = projectedOutcome(status);
      return {
        id: b.id,
        source: b.source,
        market: b.market,
        playerName: b.playerName,
        opponents: b.opponents,
        book: b.book,
        odds: b.odds,
        stake: b.stake,
        pModel: b.pModel,
        evPerUnit: b.evPerUnit,
        resultWinFlag: b.resultWinFlag,
        returnUnits: b.returnUnits,
        liveStatus: status,
        liveDetail: b.resultWinFlag !== null ? `Return ${Number(b.returnUnits || 0).toFixed(2)}u` : liveStatus.detail,
        liveProb: liveStatus.liveProb,
        currentPos: liveStatus.currentPos,
        currentScore: liveStatus.currentScore,
        thru: liveStatus.thru,
        round: liveStatus.round,
        projectedReturnUnits: projectedReturn,
        projectedOutcome: projected,
      };
    });

    const liveProjectionSettled = weeklyPlaced.filter((b) => b.projectedReturnUnits !== null);
    const liveProjection = {
      countedBets: liveProjectionSettled.length,
      pendingBets: weeklyPlaced.length - liveProjectionSettled.length,
      wins: weeklyPlaced.filter((b) => b.projectedOutcome === "win").length,
      losses: weeklyPlaced.filter((b) => b.projectedOutcome === "loss").length,
      pnlUnits: liveProjectionSettled.reduce((acc, b) => acc + (Number(b.projectedReturnUnits) || 0), 0),
    };

    return NextResponse.json({
      ok: true,
      tour,
      meta,
      ytd: {
        year: ytdYear,
        pnlUnits: pnl,
        stakedUnits: staked,
        roi: staked > 0 ? pnl / staked : null,
        betsPlaced: allBets.length,
        betsSettled: settled.length,
        betsWon: won,
        betsLost: lost,
        bestBet: best
          ? {
              market: best.betType,
              playerName: best.playerName,
              odds: best.marketOddsBestDec,
              stake: best.stakeUnits,
              returnUnits: best.returnUnits,
              eventName: best.week.eventName,
              eventYear: best.week.eventYear,
            }
          : null,
      },
      liveError: live.error ?? null,
      liveLastUpdate,
      liveProjection,
      weeklyPlaced,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
