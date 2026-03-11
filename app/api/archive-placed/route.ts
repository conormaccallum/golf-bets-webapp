import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";
const ARCHIVE_TOKEN = process.env.ARCHIVE_TOKEN || "";
const ALLOW_MANUAL_ARCHIVE = process.env.ALLOW_MANUAL_ARCHIVE === "true";
const DEFAULT_TOUR = "pga";

function normalizeTour(input: string | null) {
  const t = (input || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
  return "pga";
}

async function fetchFromOutputs(tour: string, name: string): Promise<Response> {
  const primary = `${OUTPUT_BASE}/${tour}/${name}?t=${Date.now()}`;
  const fallback = `${OUTPUT_BASE}/${name}?t=${Date.now()}`;
  const res = await fetch(primary, { cache: "no-store" });
  if (res.ok || res.status !== 404) return res;
  const res2 = await fetch(fallback, { cache: "no-store" });
  return res2.ok ? res2 : res;
}

async function getMeta(tour: string) {
  const res = await fetchFromOutputs(tour, "event_meta.json");
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
    const url = new URL(req.url);
    const tour = normalizeTour(url.searchParams.get("tour") || DEFAULT_TOUR);
    const meta = await getMeta(tour);
    const placed = await prisma.betslipItem.findMany({
      where: { tour, eventId: meta.eventId, status: "PLACED", archivedAt: null },
    });

    if (placed.length === 0) {
      return NextResponse.json({ ok: true, archived: 0 });
    }

    const label = `${meta.eventName} ${meta.eventYear}`;
    const week = await prisma.week.upsert({
      where: { eventId_tour: { eventId: meta.eventId, tour } },
      update: { label, eventName: meta.eventName, eventYear: meta.eventYear },
      create: {
        label,
        eventId: meta.eventId,
        eventName: meta.eventName,
        eventYear: meta.eventYear,
        tour,
      },
    });

    // Overwrite the week's bets with the current placed betslip
    await prisma.bet.deleteMany({ where: { weekId: week.id } });

    for (const b of placed) {
      const dgIdNum =
        b.dgId !== null && b.dgId !== undefined && b.dgId !== ""
          ? Number(b.dgId)
          : null;
      await prisma.bet.create({
        data: {
          weekId: week.id,
          betType: b.market,
          tour,
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
      await prisma.betslipItem.deleteMany({ where: { tour, eventId: meta.eventId } });
    } else {
      await prisma.betslipItem.updateMany({
        where: { tour, eventId: meta.eventId, status: "PLACED", archivedAt: null },
        data: { archivedAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true, archived: placed.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
