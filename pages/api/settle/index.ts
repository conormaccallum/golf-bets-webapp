import type { NextApiRequest, NextApiResponse } from "next";
import { getPrisma } from "../../../lib/prisma";

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

  const bt = betType.toLowerCase();
  if ((bt.includes("top 20") || bt.includes("top20")) && deadHeatFrac !== null) {
    return profit * deadHeatFrac;
  }
  return profit;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const betId = Number(req.body?.betId);
    const isWin = Boolean(req.body?.isWin);
    const deadHeatFrac = req.body?.deadHeatFrac === null ? null : Number(req.body?.deadHeatFrac);

    if (!Number.isFinite(betId)) return res.status(400).json({ ok: false, error: "Invalid betId" });

    const prisma = getPrisma();

    const bet = await prisma.bet.findUnique({ where: { id: betId } });
    if (!bet) return res.status(404).json({ ok: false, error: "Bet not found" });

    const stake = Number(bet.stakeUnits ?? 0);
    const odds = bet.marketOddsBestDec ?? null;

    const ret = calcReturnUnits(bet.betType, stake, odds, isWin, deadHeatFrac);

    await prisma.bet.update({
      where: { id: betId },
      data: {
        resultWinFlag: isWin ? 1 : 0,
        returnUnits: ret,
      },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? "Unknown error" });
  }
}
