"use client";

import React, { useEffect, useMemo, useState } from "react";

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

function transformValueTable(raw: TableData | null, market: Market): TableData | null {
  if (!raw?.headers?.length) return null;

  const h = raw.headers;

  // Core columns (robust to header name differences)
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

  // Model prob differs by market; fall back to p_model if that’s what your pipeline uses
  const idxModelProb =
    market === "top20"
      ? pickIndex(h, ["top20_prob_model", "p_model", "model_prob", "prob_model", "top20_prob"])
      : market === "make_cut"
      ? pickIndex(h, ["make_cut_prob_model", "makecut_prob_model", "p_model", "model_prob", "prob_model"])
      : pickIndex(h, ["miss_cut_prob_model", "misscut_prob_model", "p_model", "model_prob", "prob_model"]);

  const modelHeader =
    market === "top20"
      ? "Model Prob. of Top 20"
      : market === "make_cut"
      ? "Model Prob. of Make Cut"
      : "Model Prob. of Miss Cut";

  const outHeaders = [
    "Player Name",
    "DataGolf ID",
    modelHeader,
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

    return [
      player,
      dgId,
      formatPct(modelProb),
      formatPct(impliedProb),
      formatOdds(odds),
      book,
      formatEdge(edge),
    ];
  });

  // Optional: sort by Implied Edge descending (keeps the best at top)
  outRows.sort((a, b) => {
    const ea = toNumber(String(a[6]).replace("%", "").replace("+", "")); // edge %
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
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Value Screens (v26314c5)</h2>

        <select
          value={market}
          onChange={(e) => setMarket(e.target.value as Market)}
          style={{ padding: 6 }}
        >
          <option value="top20">Top 20</option>
          <option value="make_cut">Make Cut</option>
          <option value="miss_cut">Miss Cut</option>
        </select>

        <button onClick={load} disabled={loading} style={{ padding: "6px 10px" }}>
          {loading ? "Loading..." : "Refresh"}
        </button>

        <span style={{ color: "#999" }}>{status}</span>
      </div>

      {!displayTable?.headers?.length ? (
        <div style={{ color: "#bbb" }}>No data loaded.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {displayTable.headers.map((hh) => (
                  <th
                    key={hh}
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #333",
                      padding: "8px 6px",
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
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        borderBottom: "1px solid #222",
                        padding: "8px 6px",
                        whiteSpace: "nowrap",
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
    </div>
  );
}
