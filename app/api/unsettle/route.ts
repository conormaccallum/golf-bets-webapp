export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const betId = Number(body.betId);

    if (!Number.isFinite(betId)) {
      return NextResponse.json({ ok: false, error: "Invalid betId" }, { status: 400 });
    }

    const bet = await prisma.bet.findUnique({ where: { id: betId } });
    if (!bet) {
      return NextResponse.json({ ok: false, error: "Bet not found" }, { status: 404 });
    }

    await prisma.bet.update({
      where: { id: betId },
      data: {
        resultWinFlag: null,
        returnUnits: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
