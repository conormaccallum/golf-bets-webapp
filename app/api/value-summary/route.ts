import { NextResponse } from "next/server";
import { parseCsv, rowsToObjects, toNumber } from "@/lib/csv";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";

function pickUrl(name: string) {
  return `${OUTPUT_BASE}/${name}`;
}

function normalizeMarketName(name: string) {
  if (name === "top20") return "Top 20";
  if (name === "makeCut") return "Make Cut";
  if (name === "missCut") return "Miss Cut";
  if (name === "matchup2") return "Matchup 2-Ball";
  if (name === "matchup3") return "Matchup 3-Ball";
  return name;
}

export async function GET() {
  try {
    const metaRes = await fetch(pickUrl("event_meta.json"), { cache: "no-store" });
    if (!metaRes.ok) {
      return NextResponse.json({ error: "event_meta.json not found" }, { status: 500 });
    }
    const meta = await metaRes.json();
    let lastUpdated: string | null = null;
    try {
      const lmMeta = metaRes.headers.get("last-modified");
      if (lmMeta) lastUpdated = lmMeta;
      if (!lastUpdated) {
        const res2 = await fetch(pickUrl("latest_betslip.csv"), { cache: "no-store" });
        const lm2 = res2.headers.get("last-modified");
        if (lm2) lastUpdated = lm2;
      }
    } catch {
      // ignore
    }

    const markets = [
      { key: "top20", file: "latest_value_top20.csv" },
      { key: "makeCut", file: "latest_value_make_cut.csv" },
      { key: "missCut", file: "latest_value_miss_cut.csv" },
      { key: "matchup2", file: "latest_value_matchups_2ball.csv" },
      { key: "matchup3", file: "latest_value_matchups_3ball.csv" },
    ];

    const all: any[] = [];

    for (const m of markets) {
      const res = await fetch(pickUrl(m.file), { cache: "no-store" });
      if (!res.ok) continue;
      const csv = await res.text();
      const { headers, rows } = parseCsv(csv);
      if (headers.length === 0 || rows.length === 0) continue;
      const objs = rowsToObjects(headers, rows);

      for (const r of objs) {
        const edge = toNumber(r.edge_prob);
        if (edge === null) continue;
        all.push({
          market: normalizeMarketName(m.key),
          player_name: r.player_name || r.player || r.p1_player_name || r.p2_player_name || r.p3_player_name || "",
          opponents: r.opponents || r.p2_player_name || r.p3_player_name || "",
          dg_id: r.dg_id || r.p1_dg_id || "",
          market_odds_best_dec: r.market_odds_best_dec || r.market_odds || r.odds || "",
          market_book_best: r.market_book_best || r.book || r.market_book || "",
          edge_prob: edge,
          p_model: toNumber(r.p_model) ?? toNumber(r.top20_prob_anchored_dh) ?? toNumber(r.top20_prob_anchored) ?? toNumber(r.top20_prob_model) ?? toNumber(r.p_make_cut_model) ?? toNumber(r.p_miss_cut_model),
        });
      }
    }

    all.sort((a, b) => b.edge_prob - a.edge_prob);
    const top = all.slice(0, 20);

    return NextResponse.json({
      meta,
      lastUpdated,
      summary: {
        top,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
