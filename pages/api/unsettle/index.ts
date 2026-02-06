import type { NextApiRequest, NextApiResponse } from "next";
import { getPrisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const betId = Number(req.body?.betId);
    if (!Number.isFinite(betId)) return res.status(400).json({ ok: false, error: "Invalid betId" });

    const prisma = getPrisma();

    const bet = await prisma.bet.findUnique({ where: { id: betId } });
    if (!bet) return res.status(404).json({ ok: false, error: "Bet not found" });

    await prisma.bet.update({
      where: { id: betId },
      data: { resultWinFlag: null, returnUnits: null },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? "Unknown error" });
  }
}
