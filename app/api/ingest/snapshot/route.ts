import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function requireToken(req: NextRequest) {
  const token = process.env.INGEST_TOKEN || "";
  const auth = req.headers.get("authorization") || "";
  if (!token || auth !== `Bearer ${token}`) return false;
  return true;
}

type SnapshotEvent = {
  tour: string;
  eventId: string;
  eventName: string;
  eventYear: number;
  capturedAt: string;
};

type OddsRow = {
  market: string;
  book: string;
  dgId?: number | null;
  playerName?: string | null;
  oddsDec?: number | null;
  marketProb?: number | null;
  opponents?: string | null;
  groupId?: string | null;
};

export async function POST(req: NextRequest) {
  if (!requireToken(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body?.event as SnapshotEvent | undefined;
    const odds = (body?.odds as OddsRow[]) || [];
    if (!event?.tour || !event?.eventId || !event?.eventName || !event?.eventYear || !event?.capturedAt) {
      return NextResponse.json({ ok: false, error: "Missing event fields" }, { status: 400 });
    }

    const capturedAt = new Date(event.capturedAt);
    if (Number.isNaN(capturedAt.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid capturedAt" }, { status: 400 });
    }

    const prisma = getPrisma();

    await prisma.eventSnapshot.create({
      data: {
        tour: event.tour,
        eventId: event.eventId,
        eventName: event.eventName,
        eventYear: event.eventYear,
        capturedAt,
      },
    });

    if (odds.length > 0) {
      const rows = odds.map((o) => ({
        tour: event.tour,
        eventId: event.eventId,
        eventYear: event.eventYear,
        market: o.market,
        book: o.book,
        dgId: o.dgId ?? null,
        playerName: o.playerName ?? null,
        oddsDec: o.oddsDec ?? null,
        marketProb: o.marketProb ?? (o.oddsDec ? 1 / o.oddsDec : null),
        opponents: o.opponents ?? null,
        groupId: o.groupId ?? null,
        capturedAt,
      }));
      await prisma.oddsSnapshot.createMany({ data: rows });
    }

    return NextResponse.json({ ok: true, oddsCount: odds.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 500 });
  }
}
