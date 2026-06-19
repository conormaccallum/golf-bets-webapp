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
    const won = settled.filter((b) => b.resultWinFlag === 1).length;
    const lost = settled.filter((b) => b.resultWinFlag === 0).length;
    const pnl = allBets.reduce((acc, b) => acc + (Number(b.returnUnits) || 0), 0);
    const staked = allBets.reduce((acc, b) => acc + (Number(b.stakeUnits) || 0), 0);
    const best = allBets
      .filter((b) => b.returnUnits !== null && b.returnUnits !== undefined)
      .sort((a, b) => (Number(b.returnUnits) || 0) - (Number(a.returnUnits) || 0))[0] || null;

    const placedItems = eventId
      ? await prisma.betslipItem.findMany({
          where: { tour, eventId, status: "PLACED", archivedAt: null },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const live = await fetchLiveRows(tour);
    const liveLookup = buildLiveLookup(live.rows);
    const liveLastUpdate = live.info?.last_update ?? null;

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
      weeklyPlaced: placedItems.map((b) => {
        const liveStatus = statusForBet(
          { market: b.market, playerName: b.playerName, dgId: b.dgId, opponents: b.opponents },
          liveLookup,
          liveLastUpdate
        );
        return {
          id: b.id,
          market: b.market,
          playerName: b.playerName,
          opponents: b.opponents,
          book: b.marketBookBest,
          odds: b.oddsEnteredDec ?? b.marketOddsBestDec,
          stake: b.stakeUnitsEntered ?? b.stakeUnits,
          pModel: b.pModel,
          evPerUnit: b.evPerUnit,
          liveStatus: liveStatus.status,
          liveDetail: liveStatus.detail,
          liveProb: liveStatus.liveProb,
          currentPos: liveStatus.currentPos,
          currentScore: liveStatus.currentScore,
          thru: liveStatus.thru,
          round: liveStatus.round,
        };
      }),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
