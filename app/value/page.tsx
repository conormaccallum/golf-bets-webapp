"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HeaderNav } from "../components/ui";

type Market = "top20" | "make_cut" | "miss_cut";

type TableData = {
  headers: string[];
  rows: string[][];
};

function toNumber(x: unknown): number | null {
  if (x === null || x === undefined) return null;
  const s = String(x).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickIndex(headers: string[], candidates: string[]): number {
  const norm = headers.map((h) => h.trim().toLowerCase());
  for (const c of candidates) {
    const idx = norm.indexOf(c.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function formatPct(p: number | null): string {
  if (p === null) return "";
  return `${(p * 100).toFixed(1)}%`;
}

function formatOdds(o: number | null): string {
  if (o === null) return "";
  return o.toFixed(2);
}

function formatEdge(e: number | null): string {
  if (e === null) return "";
  const pct = e * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function modelProbHeader(market: Market): string {
  if (market === "top20") return "Model Prob. of Top 20";
  if (market === "make_cut") return "Model Prob. of Make Cut";
  return "Model Prob. of Miss Cut";
}

function transformValueTable(raw: TableData | null, market: Market): TableData | null {
  if (!raw?.headers?.length) return null;

  const h = raw.headers;

  const idxPlayer = pickIndex(h, ["player_name", "player", "name"]);
  const idxDgId = pickIndex(h, ["dg_id", "datagolf_id", "dgid"]);

  const idxBook = pickIndex(h, ["market_book_best", "bookmaker", "book", "best_book"]);
  const idxOdds = pickIndex(h, [
    "market_odds_best_dec",
    "best_market_odds",
    "best_odds",
    "odds_best_dec",
    "odds",
  ]);

  const idxModelProb =
    market === "top20"
      ? pickIndex(h, [
          "top20_prob_model",
          "top20_prob",
          "p_top20",
          "p_model",
        ])
      : market === "make_cut"
      ? pickIndex(h, [
          "p_make_cut_model",   // ← your actual column
          "p_make_cut",
          "make_cut_prob",
          "p_model",
        ])
      : pickIndex(h, [
          "p_miss_cut_model",   // ← your actual column
          "p_miss_cut",
          "miss_cut_prob",
          "p_model",
        ]);

  const outHeaders = [
    "Player Name",
    "DataGolf ID",
    modelProbHeader(market),
    "Implied Prob. from Market Odds",
    "Best Market Odds",
    "Bookmaker",
    "Implied Edge",
  ];

  const outRows: string[][] = raw.rows.map((r) => {
    const player = idxPlayer >= 0 ? (r[idxPlayer] ?? "") : "";
    const dgId = idxDgId >= 0 ? (r[idxDgId] ?? "") : "";

    const modelProb = idxModelProb >= 0 ? toNumber(r[idxModelProb]) : null;
    const odds = idxOdds >= 0 ? toNumber(r[idxOdds]) : null;
    const book = idxBook >= 0 ? (r[idxBook] ?? "") : "";

    const impliedProb = odds && odds > 0 ? 1 / odds : null;
    const edge = modelProb !== null && impliedProb !== null ? modelProb - impliedProb : null;

    return [player, dgId, formatPct(modelProb), formatPct(impliedProb), formatOdds(odds), book, formatEdge(edge)];
  });

  // sort by edge desc if edge exists
  outRows.sort((a, b) => {
    const ea = toNumber(String(a[6]).replace("%", "").replace("+", ""));
    const eb = toNumber(String(b[6]).replace("%", "").replace("+", ""));
    if (ea === null && eb === null) return 0;
    if (ea === null) return 1;
    if (eb === null) return -1;
    return eb - ea;
  });

  return { headers: outHeaders, rows: outRows };
}

export default function ValueScreensPage() {
  const [market, setMarket] = useState<Market>("top20");
  const [rawTable, setRawTable] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function load() {
    setLoading(true);
    setStatus("Loading...");
    try {
      const res = await fetch("/api/run", { method: "POST" });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? "API error");

      if (market === "top20") setRawTable(json.tables?.top20 ?? null);
      if (market === "make_cut") setRawTable(json.tables?.makeCut ?? null);
      if (market === "miss_cut") setRawTable(json.tables?.missCut ?? null);

      setStatus("Loaded");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to load");
      setRawTable(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market]);

  const displayTable = useMemo(() => transformValueTable(rawTable, market), [rawTable, market]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "sans-serif", color: "white" }}>
      {/* NAV */}
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Value Screens</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value as Market)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "white",
            }}
          >
            <option value="top20">Top 20</option>
            <option value="make_cut">Make Cut</option>
            <option value="miss_cut">Miss Cut</option>
          </select>

          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <span style={{ color: "#bbb" }}>{status}</span>
        </div>

        {!displayTable?.headers?.length ? (
          <div style={{ border: "1px solid #333", borderRadius: 16, padding: 16 }}>
            <p style={{ margin: 0 }}>No data loaded.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid #333", borderRadius: 14 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
              <thead>
                <tr>
                  {displayTable.headers.map((hh) => (
                    <th
                      key={hh}
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderBottom: "1px solid #333",
                        background: "#111",
                        color: "white",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {hh}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {displayTable.rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#000" : "#141414" }}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #222",
                          whiteSpace: "nowrap",
                          color: "white",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #333",
        color: "white",
        background: "#111",
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}
