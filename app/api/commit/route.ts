import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../../../lib/prisma";

function parseCsv(csv: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    const next = csv[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const headers = (rows.shift() ?? []).map((h) => h.trim());
  const dataRows = rows.map((r) => r.map((c) => c.trim()));
  return { headers, rows: dataRows };
}

const MODEL_DIR = path.join(process.cwd(), "golf-model");
const PYTHON = path.join(MODEL_DIR, "venv", "bin", "python");

function runPython(script: string) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(PYTHON, [script], { cwd: MODEL_DIR });
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `Failed: ${script}`));
    });
  });
}

async function readJson<T>(filePath: string): Promise<T> {
  const txt = await fs.readFile(filePath, "utf8");
  return JSON.parse(txt) as T;
}

async function readText(filePath: string) {
  return fs.readFile(filePath, "utf8");
}

function toNumber(x: string | undefined): number | null {
  if (x === undefined) return null;
  const t = String(x).trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export async function POST() {
  try {
    // Run pipeline to ensure latest files exist
    await runPython("model_v1_current_event.py");
    await runPython("farmers_top20_value_screen.py");
    await runPython("farmers_make_cut_value_screen.py");
    await runPython("farmers_miss_cut_value_screen.py");
    await runPython("build_betslip_all_markets.py");

    // Read stable event meta
    const metaPath = path.join(MODEL_DIR, "public", "event_meta.json");
    const meta = await readJson<{ eventId: string; eventName: string; eventYear: number }>(metaPath);

    if (!meta?.eventId) throw new Error("event_meta.json missing eventId");
    if (!meta?.eventName) throw new Error("event_meta.json missing eventName");
    if (!meta?.eventYear) throw new Error("event_meta.json missing eventYear");

    // Read betslip
    const betslipCsv = await readText(path.join(MODEL_DIR, "betslip_all_markets.csv"));
    const table = parseCsv(betslipCsv);

    const idx: Record<string, number> = {};
    table.headers.forEach((h, i) => (idx[h] = i));

    const label = `${meta.eventYear} ${meta.eventName}`;

    // Upsert Week by eventId (unique) and overwrite bets
    const week = await prisma.week.upsert({
      where: { eventId: meta.eventId },
      create: {
        eventId: meta.eventId,
        eventName: meta.eventName,
        eventYear: meta.eventYear,
        label,
      },
      update: {
        eventName: meta.eventName,
        eventYear: meta.eventYear,
        label,
      },
      select: { id: true, label: true, eventId: true },
    });

    await prisma.bet.deleteMany({ where: { weekId: week.id } });

    await prisma.bet.createMany({
      data: table.rows.map((r) => ({
        weekId: week.id,
        placedAtUtc: r[idx["placed_at_utc"]] ?? null,
        betType: r[idx["bet_type"]] ?? "",
        playerName: r[idx["player_name"]] ?? "",
        dgId: toNumber(r[idx["dg_id"]]) ?? null,
        marketBookBest: r[idx["market_book_best"]] ?? null,
        marketOddsBestDec: toNumber(r[idx["market_odds_best_dec"]]) ?? null,
        stakeUnits: toNumber(r[idx["stake_units"]]) ?? null,
        pModel: toNumber(r[idx["p_model"]]) ?? null,
        edgeProb: toNumber(r[idx["edge_prob"]]) ?? null,
        evPerUnit: toNumber(r[idx["ev_per_unit"]]) ?? null,
        kellyFull: toNumber(r[idx["kelly_full"]]) ?? null,
        kellyFrac: toNumber(r[idx["kelly_frac"]]) ?? null,
        resultWinFlag: toNumber(r[idx["result_win_flag"]]) ?? null,
        returnUnits: toNumber(r[idx["return_units"]]) ?? null,
      })),
    });

    const betCount = await prisma.bet.count({ where: { weekId: week.id } });

    return NextResponse.json({
      ok: true,
      label: week.label,
      betCount,
      eventId: week.eventId,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
