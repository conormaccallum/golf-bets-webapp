import { NextResponse } from "next/server";

type TableData = { headers: string[]; rows: string[][] };

function parseCsv(text: string): TableData {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return { headers: [], rows: [] };

  // Basic CSV splitting. If your CSVs have quoted commas, tell me and we’ll swap this.
  const split = (line: string) => line.split(",").map(s => s.trim());

  const headers = split(lines[0]);
  const rows = lines.slice(1).map(split);
  return { headers, rows };
}

async function fetchText(path: string): Promise<string> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${path} (${res.status})`);
  return res.text();
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${path} (${res.status})`);
  return res.json();
}

export async function POST() {
  try {
    const eventMeta = await fetchJson<any>("/api/data/event_meta.json");

    const betslipCsv = await fetchText("/api/data/latest_betslip.csv");
    const top20Csv = await fetchText("/api/data/latest_value_top20.csv");
    const makeCutCsv = await fetchText("/api/data/latest_value_makecut.csv");
    const missCutCsv = await fetchText("/api/data/latest_value_misscut.csv");

    return NextResponse.json({
      ok: true,
      meta: eventMeta,
      raw: { betslipCsv, top20Csv, makeCutCsv, missCutCsv },
      tables: {
        betslip: parseCsv(betslipCsv),
        top20: parseCsv(top20Csv),
        makeCut: parseCsv(makeCutCsv),
        missCut: parseCsv(missCutCsv),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
