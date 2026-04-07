import { NextResponse } from "next/server";

type TableData = { headers: string[]; rows: string[][] };
const DEFAULT_TOUR = "pga";

function normalizeTour(input: string | null) {
  const t = (input || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
  return "pga";
}

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

async function fetchTextFromOutputs(baseRaw: string, tour: string, name: string): Promise<string> {
  const primary = `${baseRaw}/${tour}/${name}?t=${Date.now()}`;
  const fallback = `${baseRaw}/${name}?t=${Date.now()}`;
  let res = await fetch(primary, { cache: "no-store" });
  if (!res.ok && res.status === 404) {
    res = await fetch(fallback, { cache: "no-store" });
  }
  if (!res.ok) throw new Error(`Failed to fetch ${name} (${res.status})`);
  return res.text();
}

async function fetchJsonFromOutputs<T>(baseRaw: string, tour: string, name: string): Promise<T> {
  const primary = `${baseRaw}/${tour}/${name}?t=${Date.now()}`;
  const fallback = `${baseRaw}/${name}?t=${Date.now()}`;
  let res = await fetch(primary, { cache: "no-store" });
  if (!res.ok && res.status === 404) {
    res = await fetch(fallback, { cache: "no-store" });
  }
  if (!res.ok) throw new Error(`Failed to fetch ${name} (${res.status})`);
  return res.json();
}

export async function POST(req: Request) {
  try {
    const baseRaw = process.env.OUTPUT_BASE_URL;
    if (!baseRaw) {
      return NextResponse.json(
        { ok: false, error: "OUTPUT_BASE_URL not set" },
        { status: 500 }
      );
    }
    const url = new URL(req.url);
    const tour = normalizeTour(url.searchParams.get("tour") || DEFAULT_TOUR);
    
    const eventMeta = await fetchJsonFromOutputs<any>(baseRaw, tour, "event_meta.json");

    const betslipCsv = await fetchTextFromOutputs(baseRaw, tour, "latest_betslip.csv");
    const winCsv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_win.csv");
    const top5Csv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_top5.csv");
    const top10Csv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_top10.csv");
    const top20Csv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_top20.csv");
    const makeCutCsv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_make_cut.csv");
    const missCutCsv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_miss_cut.csv");
    const matchup2Csv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_matchups_2ball.csv");
    const matchup3Csv = await fetchTextFromOutputs(baseRaw, tour, "latest_value_matchups_3ball.csv");

    return NextResponse.json({
      ok: true,
      tour,
      meta: eventMeta,
      raw: { betslipCsv, winCsv, top5Csv, top10Csv, top20Csv, makeCutCsv, missCutCsv, matchup2Csv, matchup3Csv },
      tables: {
        betslip: parseCsv(betslipCsv),
        win: parseCsv(winCsv),
        top5: parseCsv(top5Csv),
        top10: parseCsv(top10Csv),
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
