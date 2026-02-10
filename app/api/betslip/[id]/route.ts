import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { computeStakeUnits, BANKROLL_UNITS, MAX_BET_FRAC } from "@/lib/staking";

async function recalcPending(eventId: string) {
  const prisma = getPrisma();
  const pending = await prisma.betslipItem.findMany({
    where: { eventId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  const recalced = pending.map((b) => {
    const oddsDec = b.oddsEnteredDec ?? b.marketOddsBestDec ?? 0;
    const p = b.pModel ?? 0;
    const { edge, evPerUnit, kellyFull, kellyFrac, stakeRaw } = computeStakeUnits(p, oddsDec);
    return {
      id: b.id,
      edgeProb: edge,
      evPerUnit,
      kellyFull,
      kellyFrac,
      stakeUnits: stakeRaw,
    };
  });

  for (const r of recalced) {
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
