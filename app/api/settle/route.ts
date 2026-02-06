export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

function calcReturnUnits(
  betType: string,
  stake: number,
  odds: number | null,
  isWin: boolean,
  deadHeatFrac: number | null
): number | null {
  if (!isWin) return -stake;

  if (odds === null) return null;

  const profit = stake * (odds - 1);

  // Only apply dead heat for Top20
  const bt = betType.toLowerCase();
  if ((bt.includes("top 20") || bt.includes("top20")) && deadHeatFrac !== null) {
    return profit * deadHeatFrac;
  }

  return profit;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const betId = Number(body.betId);
    const isWin = Boolean(body.isWin);
    const deadHeatFrac = body.deadHeatFrac === null ? null : Number(body.deadHeatFrac);

    const bet = await prisma.bet.findUnique({ where: { id: betId } });
    if (!bet) {
      return NextResponse.json({ ok: false, error: "Bet not found" }, { status: 404 });
    }

    const stake = Number(bet.stakeUnits ?? 0);
    const odds = bet.marketOddsBestDec ?? null;

    const ret = calcReturnUnits(
      bet.betType,
      stake,
      odds,
      isWin,
      deadHeatFrac
    );

    await prisma.bet.update({
      where: { id: betId },
      data: {
        resultWinFlag: isWin ? 1 : 0,
        returnUnits: ret,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
