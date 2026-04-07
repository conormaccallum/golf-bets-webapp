import { NextResponse } from "next/server";
import { parseCsv, rowsToObjects, toNumber } from "@/lib/csv";
import { getPrisma } from "@/lib/prisma";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";
const DEFAULT_TOUR = "pga";

function normalizeTour(input: string | null) {
  const t = (input || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
  return "pga";
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

function pickUrl(tour: string, name: string, cacheBust: number) {
  return `${OUTPUT_BASE}/${tour}/${name}?t=${cacheBust}`;
}


async function fetchWithFallback(tour: string, name: string, cacheBust: number) {
  const primary = `${OUTPUT_BASE}/${tour}/${name}?t=${cacheBust}`;
  const fallback = `${OUTPUT_BASE}/${name}?t=${cacheBust}`;
  const res = await fetch(primary, { cache: "no-store" });
  if (res.ok || res.status !== 404) return res;
  const res2 = await fetch(fallback, { cache: "no-store" });
  return res2.ok ? res2 : res;
}

function normalizeMarketName(name: string) {
  if (name === "win") return "Win";
  if (name === "top5") return "Top 5";
  if (name === "top10") return "Top 10";
  if (name === "top20") return "Top 20";
  if (name === "makeCut") return "Make Cut";
  if (name === "missCut") return "Miss Cut";
  if (name === "matchup2") return "Matchup 2-Ball";
  if (name === "matchup3") return "Matchup 3-Ball";
  return name;
}

export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const cacheBust = Date.now();
    const url = new URL(req.url);
    const tour = normalizeTour(url.searchParams.get("tour"));
    const metaRes = await fetchWithFallback(tour, "event_meta.json", cacheBust);
    if (!metaRes.ok) {
      return NextResponse.json({ error: "event_meta.json not found" }, { status: 500 });
    }
    const meta = await metaRes.json();
    let lastUpdated: string | null = null;
    try {
      const runMetaRes = await fetchWithFallback(tour, "run_meta.json", cacheBust);
      if (runMetaRes.ok) {
        const runMeta = await runMetaRes.json();
        lastUpdated =
          runMeta.runAt ||
          runMeta.generatedAt ||
          runMeta.updatedAt ||
          runMeta.lastRunAt ||
          null;
      }
      if (!lastUpdated) {
        const lmMeta = metaRes.headers.get("last-modified");
        if (lmMeta) lastUpdated = lmMeta;
      }
      if (!lastUpdated) {
        const res2 = await fetchWithFallback(tour, "latest_betslip.csv", cacheBust);
        const lm2 = res2.headers.get("last-modified") || res2.headers.get("date");
        if (lm2) lastUpdated = lm2;
        if (!lastUpdated) {
          const csv = await res2.text();
          const { headers, rows } = parseCsv(csv);
          const idx = headers.indexOf("placed_at_utc");
          if (idx >= 0 && rows.length > 0) {
            const max = rows.map((r) => r[idx]).filter(Boolean).sort().at(-1) || null;
            if (max) lastUpdated = max;
          }
        }
      }
    } catch {
      // ignore
    }

    const markets = [
      { key: "win", file: "latest_value_win.csv" },
      { key: "top5", file: "latest_value_top5.csv" },
      { key: "top10", file: "latest_value_top10.csv" },
      { key: "top20", file: "latest_value_top20.csv" },
      { key: "makeCut", file: "latest_value_make_cut.csv" },
      { key: "missCut", file: "latest_value_miss_cut.csv" },
      { key: "matchup2", file: "latest_value_matchups_2ball.csv" },
      { key: "matchup3", file: "latest_value_matchups_3ball.csv" },
    ];

    const all: any[] = [];

    for (const m of markets) {
      const res = await fetchWithFallback(tour, m.file, cacheBust);
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
          p_model:
            toNumber(r.p_model) ??
            toNumber(r.win_prob_anchored) ??
            toNumber(r.win_prob_model) ??
            toNumber(r.top5_prob_anchored) ??
            toNumber(r.top5_prob_model) ??
            toNumber(r.top10_prob_anchored) ??
            toNumber(r.top10_prob_model) ??
            toNumber(r.top20_prob_anchored_dh) ??
            toNumber(r.top20_prob_anchored) ??
            toNumber(r.top20_prob_model) ??
            toNumber(r.p_make_cut_model) ??
            toNumber(r.p_miss_cut_model),
        });
      }
    }

    all.sort((a, b) => b.edge_prob - a.edge_prob);
    const top = all.slice(0, 20);

    const betslipItems = await prisma.betslipItem.findMany({
      where: { eventId: meta.eventId, tour },
      select: { uniqueKey: true },
    });
    const betslipKeys = betslipItems.map((b) => b.uniqueKey);

    return NextResponse.json({
      meta,
      tour,
      lastUpdated,
      summary: {
        top,
      },
      betslipKeys,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
