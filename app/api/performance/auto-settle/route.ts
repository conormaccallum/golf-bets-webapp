import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { buildLiveLookup, fetchLiveRows, statusForBet } from "@/lib/live-status";

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const weekId = Number(body?.weekId);
    if (!Number.isFinite(weekId)) {
      return NextResponse.json({ ok: false, error: "Invalid weekId" }, { status: 400 });
    }

    const prisma = getPrisma();
    const week = await prisma.week.findUnique({ where: { id: weekId }, include: { bets: true } });
    if (!week) return NextResponse.json({ ok: false, error: "Week not found" }, { status: 404 });

    const unsettled = week.bets.filter((b) => b.resultWinFlag === null || b.resultWinFlag === undefined);
    if (!unsettled.length) {
      return NextResponse.json({ ok: true, settled: 0, skipped: 0, message: "No unsettled bets." });
    }

    const live = await fetchLiveRows(week.tour || "pga");
    if (live.error) {
      return NextResponse.json({ ok: false, error: live.error }, { status: 502 });
    }

    const lookup = buildLiveLookup(live.rows);
    const placedItems = await prisma.betslipItem.findMany({
      where: { tour: week.tour || "pga", eventId: week.eventId, status: "PLACED" },
      orderBy: { createdAt: "asc" },
    });

    let settled = 0;
    let skipped = 0;
    const updates: Array<Promise<any>> = [];

    for (const bet of unsettled) {
      const slip = findMatchingSlip(placedItems, bet);
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
      const outcome = outcomeFromStatus(liveStatus.status, Boolean(week.isFinal));
      if (!outcome) {
        skipped += 1;
        continue;
      }

      const returnUnits = calcReturnUnits(outcome, bet.stakeUnits, bet.marketOddsBestDec);
      if (returnUnits === null) {
        skipped += 1;
        continue;
      }

      updates.push(prisma.bet.update({
        where: { id: bet.id },
        data: {
          resultWinFlag: outcome === "loss" ? 0 : 1,
          returnUnits,
        },
      }));
      settled += 1;
    }

    if (updates.length) await Promise.all(updates);

    return NextResponse.json({
      ok: true,
      settled,
      skipped,
      message: `Auto-settled ${settled} bet${settled === 1 ? "" : "s"}; skipped ${skipped}.`,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
