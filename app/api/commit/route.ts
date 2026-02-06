import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma";

type TableData = { headers: string[]; rows: string[][] };

function parseCsv(text: string): TableData {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (!lines.length) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        const next = line[i + 1];
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (ch === "," && !inQuotes) {
        out.push(cur.trim());
        cur = "";
        continue;
      }

      cur += ch;
    }

    out.push(cur.trim());

    return out.map((v) => {
      if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
        return v.slice(1, -1);
      }
      return v;
    });
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

function toFloat(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toInt(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function fetchTextFromBase(base: string, name: string): Promise<string> {
  const url = `${base}/${name}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${name} (${res.status})`);
  return res.text();
}

async function fetchJsonFromBase<T>(base: string, name: string): Promise<T> {
  const url = `${base}/${name}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${name} (${res.status})`);
  return res.json();
}

export async function POST() {
  try {
    const base = process.env.OUTPUT_BASE_URL;
    if (!base) {
      return NextResponse.json(
        { ok: false, error: "OUTPUT_BASE_URL not set" },
        { status: 500 }
      );
    }

    const meta = await fetchJsonFromBase<any>(base, "event_meta.json");
    const eventId = String(meta?.eventId ?? "").trim();
    const eventName = String(meta?.eventName ?? "").trim();
    const eventYear = Number(meta?.eventYear ?? 0);

    if (!eventId || !eventName || !Number.isFinite(eventYear)) {
      return NextResponse.json(
        { ok: false, error: "event_meta.json missing eventId/eventName/eventYear" },
        { status: 400 }
      );
    }

    const betslipCsv = await fetchTextFromBase(base, "latest_betslip.csv");
    const table = parseCsv(betslipCsv);

    if (!table.headers.length) {
      return NextResponse.json(
        { ok: false, error: "latest_betslip.csv appears empty" },
        { status: 400 }
      );
    }

    const idx: Record<string, number> = {};
    table.headers.forEach((h, i) => (idx[h] = i));

    const requiredCols = ["bet_type", "player_name"];
    for (const c of requiredCols) {
      if (!(c in idx)) {
        return NextResponse.json(
          { ok: false, error: `latest_betslip.csv missing column: ${c}` },
          { status: 400 }
        );
      }
    }

    const bets = table.rows
      .map((r) => {
        const betType = r[idx["bet_type"]] ?? "";
        const playerName = r[idx["player_name"]] ?? "";
        if (!betType || !playerName) return null;

        return {
          placedAtUtc: (r[idx["placed_at_utc"]] ?? "") || null,
          betType,
          playerName,
          dgId: toInt(r[idx["dg_id"]]),
          marketBookBest: (r[idx["market_book_best"]] ?? "") || null,
          marketOddsBestDec: toFloat(r[idx["market_odds_best_dec"]]),
          stakeUnits: toFloat(r[idx["stake_units"]]),
          pModel: toFloat(r[idx["p_model"]]),
          edgeProb: toFloat(r[idx["edge_prob"]]),
          evPerUnit: toFloat(r[idx["ev_per_unit"]]),
          kellyFull: toFloat(r[idx["kelly_full"]]),
          kellyFrac: toFloat(r[idx["kelly_frac"]]),
          resultWinFlag: toInt(r[idx["result_win_flag"]]),
          returnUnits: toFloat(r[idx["return_units"]]),
        };
      })
      .filter(Boolean) as Array<{
      placedAtUtc: string | null;
      betType: string;
      playerName: string;
      dgId: number | null;
      marketBookBest: string | null;
      marketOddsBestDec: number | null;
      stakeUnits: number | null;
      pModel: number | null;
      edgeProb: number | null;
      evPerUnit: number | null;
      kellyFull: number | null;
      kellyFrac: number | null;
      resultWinFlag: number | null;
      returnUnits: number | null;
    }>;

    if (!bets.length) {
      return NextResponse.json(
        { ok: false, error: "No valid bets found in latest_betslip.csv" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const existing = await prisma.week.findUnique({ where: { eventId } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Week already committed for eventId ${eventId}` },
        { status: 409 }
      );
    }

    const label = `${eventName} ${eventYear}`;

    await prisma.week.create({
      data: {
        label,
        eventName,
        eventYear,
        eventId,
        bets: {
          create: bets,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      label,
      betCount: bets.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

