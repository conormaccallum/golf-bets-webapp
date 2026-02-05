import { NextResponse } from "next/server";

type TableData = { headers: string[]; rows: string[][] };

function parseCsv(text: string): TableData {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return { headers: [], rows: [] };
  const split = (line: string) => line.split(",").map(s => s.trim());
  const headers = split(lines[0]);
  const rows = lines.slice(1).map(split);
  return { headers, rows };
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

    const eventMeta = await fetchJsonFromBase<any>(base, "event_meta.json");

    const betslipCsv = await fetchTextFromBase(base, "latest_betslip.csv");
    const top20Csv = await fetchTextFromBase(base, "latest_value_top20.csv");
    const makeCutCsv = await fetchTextFromBase(base, "latest_value_makecut.csv");
    const missCutCsv = await fetchTextFromBase(base, "latest_value_misscut.csv");

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
