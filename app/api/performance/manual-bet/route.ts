import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { computeStakeUnits } from "@/lib/staking";

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeMarket(value: unknown): string {
  const raw = cleanText(value);
  const key = raw.toLowerCase().replace(/[\s_-]+/g, " ");
  if (key === "top10" || key === "top 10") return "Top 10";
  if (key === "top20" || key === "top 20") return "Top 20";
  if (key === "makecut" || key === "make cut") return "Make Cut";
  if (key === "misscut" || key === "miss cut") return "Miss Cut";
  if (key.includes("matchup") && key.includes("3")) return "Matchup 3-Ball";
  if (key.includes("matchup") && key.includes("2")) return "Matchup 2-Ball";
  return raw;
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();

    const weekId = Number(body.weekId);
    if (!Number.isInteger(weekId)) {
      return NextResponse.json({ ok: false, error: "Choose an event/week." }, { status: 400 });
    }

    const week = await prisma.week.findUnique({ where: { id: weekId } });
    if (!week) return NextResponse.json({ ok: false, error: "Week not found." }, { status: 404 });

    const market = normalizeMarket(body.market);
    const playerName = cleanText(body.playerName);
    const book = cleanText(body.book);
    const opponents = cleanText(body.opponents) || null;
    const odds = toNumber(body.oddsDec);
    const stake = toNumber(body.stakeUnits);
    const pModelRaw = toNumber(body.pModel);
    const pModel = pModelRaw !== null && pModelRaw > 1 ? pModelRaw / 100 : pModelRaw;
    const dgIdText = cleanText(body.dgId);
    const dgId = dgIdText ? Number(dgIdText) : null;

    if (!market) return NextResponse.json({ ok: false, error: "Enter a market." }, { status: 400 });
    if (!playerName) return NextResponse.json({ ok: false, error: "Enter a player." }, { status: 400 });
    if (!odds || odds <= 1) return NextResponse.json({ ok: false, error: "Odds must be greater than 1.00." }, { status: 400 });
    if (!stake || stake <= 0) return NextResponse.json({ ok: false, error: "Stake must be greater than 0." }, { status: 400 });
    if (dgId !== null && !Number.isInteger(dgId)) return NextResponse.json({ ok: false, error: "DG ID must be a whole number." }, { status: 400 });
    if (pModel !== null && (pModel <= 0 || pModel >= 1)) {
      return NextResponse.json({ ok: false, error: "Model probability must be between 0 and 1, or enter it as a percent like 22." }, { status: 400 });
    }

    const metrics = pModel !== null ? computeStakeUnits(pModel, odds) : null;
    const now = new Date();
    const uniqueKey = [
      "manual",
      week.tour,
      week.eventId,
      market,
      dgIdText,
      playerName,
      opponents || "",
      book,
      odds,
      stake,
      now.getTime(),
    ].join("|");

    const result = await prisma.$transaction(async (tx) => {
      const bet = await tx.bet.create({
        data: {
          weekId: week.id,
          placedAtUtc: now.toISOString(),
          betType: market,
          tour: week.tour,
          playerName,
          dgId,
          marketBookBest: book || null,
          marketOddsBestDec: odds,
          stakeUnits: stake,
          opponents,
          pModel,
          edgeProb: metrics?.edge ?? null,
          evPerUnit: metrics?.evPerUnit ?? null,
          kellyFull: metrics?.kellyFull ?? null,
          kellyFrac: metrics?.kellyFrac ?? null,
        },
      });

      await tx.betslipItem.create({
        data: {
          uniqueKey,
          tour: week.tour,
          eventId: week.eventId,
          eventName: week.eventName,
          eventYear: week.eventYear,
          market,
          playerName,
          dgId: dgIdText || null,
          opponents,
          marketBookBest: book || null,
          marketOddsBestDec: odds,
          oddsEnteredDec: odds,
          pModel,
          edgeProb: metrics?.edge ?? null,
          evPerUnit: metrics?.evPerUnit ?? null,
          kellyFull: metrics?.kellyFull ?? null,
          kellyFrac: metrics?.kellyFrac ?? null,
          stakeUnits: stake,
          stakeUnitsEntered: stake,
          status: "PLACED",
          archivedAt: now,
        },
      });

      return bet;
    });

    return NextResponse.json({ ok: true, betId: result.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to add manual bet." }, { status: 500 });
  }
}
