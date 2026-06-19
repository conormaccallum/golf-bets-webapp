import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { buildLiveLookup, fetchLiveRows, statusForBet } from "@/lib/live-status";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";

function normalizeTour(input: string | null | undefined) {
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
  if (!res.ok) return null;
  return res.json();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tour = normalizeTour(searchParams.get("tour"));
    const meta = await getMeta(tour);
    const eventId = meta?.eventId ? String(meta.eventId) : searchParams.get("eventId") || "";
    const prisma = getPrisma();

    const placed = eventId
      ? await prisma.betslipItem.findMany({
          where: { tour, eventId, status: "PLACED", archivedAt: null },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const live = await fetchLiveRows(tour);
    const lookup = buildLiveLookup(live.rows);
    const lastUpdate = live.info?.last_update ?? null;

    return NextResponse.json({
      ok: !live.error,
      error: live.error,
      tour,
      meta,
      info: live.info,
      statuses: placed.map((b) => ({
        id: b.id,
        ...statusForBet(
          { market: b.market, playerName: b.playerName, dgId: b.dgId, opponents: b.opponents },
          lookup,
          lastUpdate
        ),
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
