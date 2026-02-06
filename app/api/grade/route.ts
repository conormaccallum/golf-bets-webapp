import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type FinishRow = {
  dgId: number;
  finishPos: number | null; // 1,2,3,... (18 for T18)
  madeCut: boolean | null;  // true/false/null
};

function normBetType(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Dead heat fraction for "Top N" markets.
 * Example: Top 20, player finishes T18 with 6 tied at 18:
 * paid places remaining = 20 - 18 + 1 = 3
 * fraction = 3/6
 */
function deadHeatFractionTopN(finishPos: number, tieCountAtPos: number, topN: number): number {
  const paidPlacesRemaining = topN - finishPos + 1;
  if (paidPlacesRemaining <= 0) return 0;
  if (tieCountAtPos <= 0) return 0;
  return Math.min(1, paidPlacesRemaining / tieCountAtPos);
}

function calcReturnUnits(
  betType: string,
  stakeUnits: number | null | undefined,
  oddsDec: number | null | undefined,
  finishPos: number | null,
  madeCut: boolean | null,
  tieCountsByFinishPos: Map<number, number>
): { winFlag: 1 | 0; returnUnits: number | null } | null {
  if (stakeUnits === null || stakeUnits === undefined) return null;

  const stake = Number(stakeUnits);
  if (!Number.isFinite(stake) || stake <= 0) return null;

  const odds = oddsDec === null || oddsDec === undefined ? null : Number(oddsDec);
  const bt = normBetType(betType);

  // Helper for simple win/loss markets (no dead heat)
  const settleSimple = (won: boolean): { winFlag: 1 | 0; returnUnits: number | null } => {
    if (!won) return { winFlag: 0, returnUnits: -stake };

    // Win: profit = stake * (odds - 1)
    if (odds === null || !Number.isFinite(odds)) {
      // If odds missing, still mark win but can't compute returns
      return { winFlag: 1, returnUnits: null };
    }
    return { winFlag: 1, returnUnits: stake * (odds - 1) };
  };

  // ---- TOP 20 (dead heat applies) ----
  if (bt.includes("top20") || bt.includes("top_20")) {
    if (finishPos === null || !Number.isFinite(finishPos)) {
      return { winFlag: 0, returnUnits: -stake };
    }

    const pos = Number(finishPos);
    if (pos > 20) {
      return { winFlag: 0, returnUnits: -stake };
    }

    // Player finished inside the paid places (<=20): apply dead heat
    const tieCount = tieCountsByFinishPos.get(pos) ?? 1;
    const frac = deadHeatFractionTopN(pos, tieCount, 20);

    if (odds === null || !Number.isFinite(odds)) {
      return { winFlag: 1, returnUnits: null };
    }

    const profit = stake * (odds - 1) * frac;
    return { winFlag: 1, returnUnits: profit };
  }

  // ---- MAKE CUT (no dead heat) ----
  if (bt.includes("make_cut") || bt.includes("makecut")) {
    if (madeCut === null) return null;
    return settleSimple(madeCut === true);
  }

  // ---- MISS CUT (no dead heat) ----
  if (bt.includes("miss_cut") || bt.includes("misscut")) {
    if (madeCut === null) return null;
    return settleSimple(madeCut === false);
  }

  // Unknown market type: do nothing
  return null;
}

/**
 * DataGolf endpoint:
 * https://feeds.datagolf.com/historical-event-data/events?tour=pga&event_id=...&year=...&file_format=json&key=...
 */
async function fetchEventFinishes(eventId: string, year: number, apiKey: string): Promise<FinishRow[]> {
  const url =
    `https://feeds.datagolf.com/historical-event-data/events` +
    `?tour=pga&event_id=${encodeURIComponent(eventId)}` +
    `&year=${encodeURIComponent(String(year))}` +
    `&file_format=json&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`DataGolf fetch failed (HTTP ${res.status}) for eventId=${eventId} year=${year}`);
  }

  const json: any = await res.json();

  // Normalize defensively (shape can vary)
  const candidates: any[] = [];
  if (Array.isArray(json)) candidates.push(...json);
  if (Array.isArray(json?.data)) candidates.push(...json.data);
  if (Array.isArray(json?.results)) candidates.push(...json.results);
  if (Array.isArray(json?.players)) candidates.push(...json.players);

  const out: FinishRow[] = [];
  for (const r of candidates) {
    const dgIdRaw = r?.dg_id ?? r?.dgId ?? r?.player_dg_id ?? r?.player_id ?? r?.playerId;
    const dgId = Number(dgIdRaw);
    if (!Number.isFinite(dgId)) continue;

    const finishRaw = r?.finish_position ?? r?.finishPos ?? r?.finish ?? r?.position ?? r?.pos;
    let finishPos: number | null = null;
    if (finishRaw !== undefined && finishRaw !== null && finishRaw !== "") {
      const n = Number(finishRaw);
      finishPos = Number.isFinite(n) ? n : null;
    }

    let madeCut: boolean | null = null;
    if (r?.made_cut !== undefined && r?.made_cut !== null) madeCut = Boolean(r.made_cut);
    else if (r?.madeCut !== undefined && r?.madeCut !== null) madeCut = Boolean(r.madeCut);
    else if (r?.missed_cut !== undefined && r?.missed_cut !== null) madeCut = !Boolean(r.missed_cut);

    out.push({ dgId, finishPos, madeCut });
  }

  return out;
}

export async function POST() {
  try {
    const apiKey = process.env.DATAGOLF_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing DATAGOLF_API_KEY in webapp/.env.local" },
        { status: 500 }
      );
    }

    const weeks = await prisma.week.findMany({
      orderBy: { createdAt: "desc" },
      include: { bets: true },
    });

    let updated = 0;

    for (const week of weeks) {
      const unsettled = week.bets.filter(
        (b) => b.resultWinFlag === null || b.resultWinFlag === undefined
      );
      if (unsettled.length === 0) continue;

      const finishes = await fetchEventFinishes(week.eventId, week.eventYear, apiKey);

      const byDgId = new Map<number, FinishRow>();
      const tieCounts = new Map<number, number>();

      for (const row of finishes) {
        byDgId.set(row.dgId, row);
        if (row.finishPos !== null) {
          tieCounts.set(row.finishPos, (tieCounts.get(row.finishPos) ?? 0) + 1);
        }
      }

      for (const bet of unsettled) {
        if (!bet.dgId) continue;

        const row = byDgId.get(bet.dgId);
        if (!row) continue;

        const settled = calcReturnUnits(
          bet.betType,
          bet.stakeUnits,
          bet.marketOddsBestDec,
          row.finishPos,
          row.madeCut,
          tieCounts
        );

        if (!settled) continue;

        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            resultWinFlag: settled.winFlag,
            returnUnits: settled.returnUnits,
          },
        });

        updated += 1;
      }
    }

    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
