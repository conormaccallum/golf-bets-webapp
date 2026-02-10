import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";
const ARCHIVE_TOKEN = process.env.ARCHIVE_TOKEN || "";
const ALLOW_MANUAL_ARCHIVE = process.env.ALLOW_MANUAL_ARCHIVE === "true";

function pickUrl(name: string) {
  return `${OUTPUT_BASE}/${name}`;
}

async function getMeta() {
  const res = await fetch(pickUrl("event_meta.json"), { cache: "no-store" });
  if (!res.ok) throw new Error("event_meta.json not found");
  return res.json();
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const manual = req.headers.get("x-archive-manual") === "true";
  const clearAfter = req.headers.get("x-archive-clear") === "true";
  const authed = ARCHIVE_TOKEN && auth === `Bearer ${ARCHIVE_TOKEN}`;
  if (!authed && !(ALLOW_MANUAL_ARCHIVE && manual)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const meta = await getMeta();
    const placed = await prisma.betslipItem.findMany({
      where: { eventId: meta.eventId, status: "PLACED", archivedAt: null },
    });

    if (placed.length === 0) {
      return NextResponse.json({ ok: true, archived: 0 });
    }

    const label = `${meta.eventName} ${meta.eventYear}`;
    const week = await prisma.week.upsert({
      where: { eventId: meta.eventId },
      update: { label, eventName: meta.eventName, eventYear: meta.eventYear },
      create: {
        label,
        eventId: meta.eventId,
        eventName: meta.eventName,
        eventYear: meta.eventYear,
      },
    });

    for (const b of placed) {
      const dgIdNum =
        b.dgId !== null && b.dgId !== undefined && b.dgId !== ""
          ? Number(b.dgId)
          : null;
      await prisma.bet.create({
        data: {
          weekId: week.id,
          betType: b.market,
          playerName: b.playerName,
          dgId: Number.isFinite(dgIdNum as number) ? (dgIdNum as number) : null,
          marketBookBest: b.marketBookBest ?? "",
          marketOddsBestDec: b.oddsEnteredDec ?? b.marketOddsBestDec ?? 0,
          stakeUnits: b.stakeUnits ?? 0,
          pModel: b.pModel ?? 0,
          edgeProb: b.edgeProb ?? 0,
          evPerUnit: b.evPerUnit ?? 0,
          kellyFull: b.kellyFull ?? 0,
          kellyFrac: b.kellyFrac ?? 0,
        },
      });
    }

    if (clearAfter) {
      await prisma.betslipItem.deleteMany({ where: { eventId: meta.eventId } });
    } else {
      await prisma.betslipItem.updateMany({
        where: { eventId: meta.eventId, status: "PLACED", archivedAt: null },
        data: { archivedAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true, archived: placed.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
