import { NextResponse } from "next/server";

type TableData = { headers: string[]; rows: string[][] };

function parseCsv(text: string): TableData {
  const lines = text.split(/\r?\n/).filter(l => l.length > 0);
  if (!lines.length) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        // Handle escaped quotes ("")
        const next = line[i + 1];
        if (inQuotes && next === '"') {
          cur += '"';
          i++; // skip the escaped quote
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

    // Remove surrounding quotes if present
    return out.map(v => {
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

async function fetchTextFromBase(base: string, name: string): Promise<string> {
  const url = `${base}/${name}?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${name} (${res.status})`);
  return res.text();
}

async function fetchJsonFromBase<T>(base: string, name: string): Promise<T> {
  const url = `${base}/${name}?t=${Date.now()}`;
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
    const makeCutCsv = await fetchTextFromBase(base, "latest_value_make_cut.csv");
    const missCutCsv = await fetchTextFromBase(base, "latest_value_miss_cut.csv");
    const matchup2Csv = await fetchTextFromBase(base, "latest_value_matchups_2ball.csv");
    const matchup3Csv = await fetchTextFromBase(base, "latest_value_matchups_3ball.csv");

    return NextResponse.json({
      ok: true,
      meta: eventMeta,
      raw: { betslipCsv, top20Csv, makeCutCsv, missCutCsv, matchup2Csv, matchup3Csv },
      tables: {
        betslip: parseCsv(betslipCsv),
        top20: parseCsv(top20Csv),
        makeCut: parseCsv(makeCutCsv),
        missCut: parseCsv(missCutCsv),
        matchup2: parseCsv(matchup2Csv),
        matchup3: parseCsv(matchup3Csv),
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
