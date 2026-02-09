import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";
const ARCHIVE_TOKEN = process.env.ARCHIVE_TOKEN || "";

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
  if (!ARCHIVE_TOKEN || auth !== `Bearer ${ARCHIVE_TOKEN}`) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const prisma = getPrisma();
    const meta = await getMeta();
    const placed = await prisma.betslipItem.findMany({
      where: { eventId: meta.eventId, status: "PLACED" },
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
      await prisma.bet.create({
        data: {
          weekId: week.id,
          betType: b.market,
          playerName: b.playerName,
          dgId: b.dgId ?? undefined,
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

    await prisma.betslipItem.deleteMany({ where: { eventId: meta.eventId, status: "PLACED" } });

    return NextResponse.json({ ok: true, archived: placed.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
