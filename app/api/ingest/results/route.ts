import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function requireToken(req: NextRequest) {
  const token = process.env.INGEST_TOKEN || "";
  const auth = req.headers.get("authorization") || "";
  if (!token || auth !== `Bearer ${token}`) return false;
  return true;
}

type ResultsEvent = {
  tour: string;
  eventId: string;
  eventYear: number;
};

type SgRow = {
  dgId: number;
  playerName: string;
  sgOtt?: number | null;
  sgApp?: number | null;
  sgArg?: number | null;
  sgPutt?: number | null;
  sgTotal?: number | null;
  rounds?: number | null;
};

type ResultRow = {
  dgId: number;
  playerName: string;
  finishPos?: number | null;
  earnings?: number | null;
};

export async function POST(req: NextRequest) {
  if (!requireToken(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body?.event as ResultsEvent | undefined;
    const sgRows = (body?.sg as SgRow[]) || [];
    const results = (body?.results as ResultRow[]) || [];

    if (!event?.tour || !event?.eventId || !event?.eventYear) {
      return NextResponse.json({ ok: false, error: "Missing event fields" }, { status: 400 });
    }

    const prisma = getPrisma();

    if (sgRows.length > 0) {
      await prisma.eventSg.deleteMany({
        where: { tour: event.tour, eventId: event.eventId, eventYear: event.eventYear },
      });
      await prisma.eventSg.createMany({
        data: sgRows.map((r) => ({
          tour: event.tour,
          eventId: event.eventId,
          eventYear: event.eventYear,
          dgId: r.dgId,
          playerName: r.playerName,
          sgOtt: r.sgOtt ?? null,
          sgApp: r.sgApp ?? null,
          sgArg: r.sgArg ?? null,
          sgPutt: r.sgPutt ?? null,
          sgTotal: r.sgTotal ?? null,
          rounds: r.rounds ?? null,
        })),
      });
    }

    if (results.length > 0) {
      await prisma.eventResult.deleteMany({
        where: { tour: event.tour, eventId: event.eventId, eventYear: event.eventYear },
      });
      await prisma.eventResult.createMany({
        data: results.map((r) => ({
          tour: event.tour,
          eventId: event.eventId,
          eventYear: event.eventYear,
          dgId: r.dgId,
          playerName: r.playerName,
          finishPos: r.finishPos ?? null,
          earnings: r.earnings ?? null,
        })),
      });
    }

    return NextResponse.json({ ok: true, sgCount: sgRows.length, resultsCount: results.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 500 });
  }
}
