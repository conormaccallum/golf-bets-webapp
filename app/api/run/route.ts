import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

// If your CSV has quoted fields with commas, we must parse correctly.
// This parser handles quotes and commas inside quotes.
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
      // handle CRLF
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      continue;
    }

    cell += ch;
  }

  // last cell
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
const metaPath = path.join(MODEL_DIR, "public", "event_meta.json");
const eventMeta = JSON.parse(await fs.readFile(metaPath, "utf8"));

// ----- REFRESH LOCK (no refresh after Thursday) -----
function isAfterThursdayLock(): boolean {
  // Current UTC time
  const now = new Date();

  // Find most recent Monday 00:00 UTC
  const day = now.getUTCDay(); // Sun=0, Mon=1,...Thu=4
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - diffToMonday,
    0, 0, 0
  ));

  // Thursday = Monday + 3 days
  const thursday = new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000);

  return now >= thursday;
}



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

async function readText(filePath: string) {
  return fs.readFile(filePath, "utf8");
}

export async function POST() {
  try {
    // ✅ LOCK CHECK MUST BE INSIDE POST (before running anything)
    if (isAfterThursdayLock()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Refresh disabled after event start (Thursday).",
        },
        { status: 403 }
      );
    }

    // Run your pipeline
    await runPython("model_v1_current_event.py");
    await runPython("farmers_top20_value_screen.py");
    await runPython("farmers_make_cut_value_screen.py");
    await runPython("farmers_miss_cut_value_screen.py");
    await runPython("build_betslip_all_markets.py");

    // Read outputs (raw)
    const betslipCsv = await readText(path.join(MODEL_DIR, "betslip_all_markets.csv"));
    const top20Csv = await readText(path.join(MODEL_DIR, "farmers_top20_value_screen.csv"));
    const makeCutCsv = await readText(path.join(MODEL_DIR, "farmers_make_cut_value_screen.csv"));
    const missCutCsv = await readText(path.join(MODEL_DIR, "farmers_miss_cut_value_screen.csv"));

    // Parse into table arrays (headers + rows)
    const betslipTable = parseCsv(betslipCsv);
    const top20Table = parseCsv(top20Csv);
    const makeCutTable = parseCsv(makeCutCsv);
    const missCutTable = parseCsv(missCutCsv);

    return NextResponse.json({
      ok: true,
      ranAt: new Date().toISOString(),
      raw: { betslipCsv, top20Csv, makeCutCsv, missCutCsv },
      tables: {
        betslip: betslipTable,
        top20: top20Table,
        makeCut: makeCutTable,
        missCut: missCutTable,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
