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

type FeatureRow = {
  dgId: number;
  playerName: string;
  skillPred?: number | null;
  customPred?: number | null;
  pMakeCutDg?: number | null;
  pMakeCutModel?: number | null;
  top20ProbModel?: number | null;
  top20ProbAnchored?: number | null;
  top20ProbDh?: number | null;
  top20ProbAnchoredDh?: number | null;
  sgApp?: number | null;
  sgOtt?: number | null;
  sgArg?: number | null;
  sgPutt?: number | null;
  sgTotal?: number | null;
  drivingAcc?: number | null;
  drivingDist?: number | null;
  totalFitAdjustment?: number | null;
  totalCourseHistoryAdjustment?: number | null;
  timingAdjustment?: number | null;
  stdDeviation?: number | null;
};

export async function POST(req: NextRequest) {
  if (!requireToken(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body?.event as SnapshotEvent | undefined;
    const odds = (body?.odds as OddsRow[]) || [];
    const features = (body?.features as FeatureRow[]) || [];
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

    if (features.length > 0) {
      const rows = features.map((f) => ({
        tour: event.tour,
        eventId: event.eventId,
        eventYear: event.eventYear,
        dgId: f.dgId,
        playerName: f.playerName,
        skillPred: f.skillPred ?? null,
        customPred: f.customPred ?? null,
        pMakeCutDg: f.pMakeCutDg ?? null,
        pMakeCutModel: f.pMakeCutModel ?? null,
        top20ProbModel: f.top20ProbModel ?? null,
        top20ProbAnchored: f.top20ProbAnchored ?? null,
        top20ProbDh: f.top20ProbDh ?? null,
        top20ProbAnchoredDh: f.top20ProbAnchoredDh ?? null,
        sgApp: f.sgApp ?? null,
        sgOtt: f.sgOtt ?? null,
        sgArg: f.sgArg ?? null,
        sgPutt: f.sgPutt ?? null,
        sgTotal: f.sgTotal ?? null,
        drivingAcc: f.drivingAcc ?? null,
        drivingDist: f.drivingDist ?? null,
        totalFitAdjustment: f.totalFitAdjustment ?? null,
        totalCourseHistoryAdjustment: f.totalCourseHistoryAdjustment ?? null,
        timingAdjustment: f.timingAdjustment ?? null,
        stdDeviation: f.stdDeviation ?? null,
        capturedAt,
      }));
      await prisma.preEventPlayerSnapshot.createMany({ data: rows });
    }

    return NextResponse.json({ ok: true, oddsCount: odds.length, featureCount: features.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 500 });
  }
}
