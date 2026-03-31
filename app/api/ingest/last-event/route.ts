import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function requireToken(req: NextRequest) {
  const token = process.env.INGEST_TOKEN || "";
  const auth = req.headers.get("authorization") || "";
  if (!token || auth !== `Bearer ${token}`) return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!requireToken(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const tour = (url.searchParams.get("tour") || "pga").toLowerCase();
    const prisma = getPrisma();
    const latest = await prisma.eventSnapshot.findFirst({
      where: { tour },
      orderBy: { capturedAt: "desc" },
    });
    if (!latest) {
      return NextResponse.json({ ok: false, error: "No snapshots found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      event: {
        tour: latest.tour,
        eventId: latest.eventId,
        eventName: latest.eventName,
        eventYear: latest.eventYear,
        capturedAt: latest.capturedAt,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 500 });
  }
}
