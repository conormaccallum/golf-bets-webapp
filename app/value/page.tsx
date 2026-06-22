"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HeaderNav, Button } from "../components/ui";

type Market = "top10" | "top20" | "make_cut" | "miss_cut";
type TableData = { headers: string[]; rows: string[][] };
type RunResponse = {
  ok?: boolean;
  error?: string;
  meta?: { eventId?: string; refreshLockDay?: string };
  tables?: {
    top10?: TableData | null;
    top20?: TableData | null;
    makeCut?: TableData | null;
    missCut?: TableData | null;
    matchup2?: TableData | null;
    matchup3?: TableData | null;
  };
  betslipKeys?: string[];
};
type DisplayRow = {
  playerName: string;
  opponents: string;
  book: string;
  odds: number | null;
  marketProb: number | null;
  modelProb: number | null;
  edge: number | null;
  evPerUnit: number | null;
  dgId: string | null;
  marketLabel: string;
  qualified: boolean | null;
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

function formatEv(v: number | null): string {
  if (v === null) return "";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(3)}`;
}

function marketLabel(market: Market): string {
  if (market === "top10") return "Top 10";
  if (market === "top20") return "Top 20";
  if (market === "make_cut") return "Make Cut";
  if (market === "miss_cut") return "Miss Cut";
  return "Miss Cut";
}

function makeUniqueKey(input: {
  tour: string;
  eventId: string;
  market: string;
  dgId: string | null;
  playerName: string;
  opponents?: string | null;
}) {
  return [
    input.tour,
    input.eventId,
    input.market,
    input.dgId || "",
    input.playerName,
    input.opponents || "",
  ].join("|");
}

function buildDisplayRows(raw: TableData | null, market: Market): DisplayRow[] {
  if (!raw?.headers?.length) return [];
  const h = raw.headers;
  const idxPlayer = pickIndex(h, ["player_name", "player", "name"]);
  const idxOpp = pickIndex(h, ["opponents", "opponent", "opp"]);
  const idxDgId = pickIndex(h, ["dg_id", "p1_dg_id", "datagolf_id", "dgid"]);
  const idxBook = pickIndex(h, ["market_book_best", "bookmaker", "book", "best_book"]);
  const idxOdds = pickIndex(h, ["market_odds_best_dec", "best_market_odds", "best_odds", "odds_best_dec", "odds"]);
  const idxMarketProb = pickIndex(h, ["market_prob_best", "market_prob", "implied_prob"]);
  const idxEdge = pickIndex(h, ["edge_prob", "edge"]);
  const idxEv = pickIndex(h, ["ev_per_unit", "ev"]);
  const idxQualified = pickIndex(h, ["strategy_qualified", "bet_flag"]);

  const idxModelProb =
    market === "top10"
      ? pickIndex(h, ["p_model", "top10_strategy_prob", "top10_prob_anchored", "top10_prob_model"])
      : market === "top20"
      ? pickIndex(h, ["p_model", "top20_strategy_prob", "top20_prob_anchored_dh", "top20_prob_anchored", "top20_prob_model"])
      : market === "make_cut"
      ? pickIndex(h, ["p_model", "make_cut_strategy_prob", "p_make_cut_anchored", "p_make_cut_model", "p_make_cut"])
      : pickIndex(h, ["p_model", "miss_cut_strategy_prob", "p_miss_cut_dg", "p_miss_cut_anchored", "p_miss_cut_model", "p_miss_cut"]);

  return raw.rows
    .map((r) => {
      const odds = idxOdds >= 0 ? toNumber(r[idxOdds]) : null;
      const marketProb = idxMarketProb >= 0 ? toNumber(r[idxMarketProb]) : odds && odds > 0 ? 1 / odds : null;
      const modelProb = idxModelProb >= 0 ? toNumber(r[idxModelProb]) : null;
      const edgeCsv = idxEdge >= 0 ? toNumber(r[idxEdge]) : null;
      const edge = edgeCsv !== null ? edgeCsv : modelProb !== null && marketProb !== null ? modelProb - marketProb : null;
      const evCsv = idxEv >= 0 ? toNumber(r[idxEv]) : null;
      const evPerUnit =
        evCsv !== null
          ? evCsv
          : modelProb !== null && odds !== null && odds > 1
          ? modelProb * (odds - 1) - (1 - modelProb)
          : null;
      const qualifiedRaw = idxQualified >= 0 ? String(r[idxQualified] ?? "").trim().toLowerCase() : "";
      const qualified = idxQualified >= 0 ? ["true", "1", "yes"].includes(qualifiedRaw) : null;
      return {
        playerName: idxPlayer >= 0 ? r[idxPlayer] ?? "" : "",
        opponents: idxOpp >= 0 ? r[idxOpp] ?? "" : "",
        book: idxBook >= 0 ? r[idxBook] ?? "" : "",
        odds,
        marketProb,
        modelProb,
        edge,
        evPerUnit,
        dgId: idxDgId >= 0 && r[idxDgId] ? String(r[idxDgId]) : null,
        marketLabel: marketLabel(market),
        qualified,
      };
    })
    .filter((r) => r.playerName)
    .sort((a, b) => (b.evPerUnit ?? -999) - (a.evPerUnit ?? -999) || (b.edge ?? -999) - (a.edge ?? -999));
}

export default function ValueScreensPage() {
  const [market, setMarket] = useState<Market>("top10");
  const [tour, setTour] = useState<"pga" | "dp">("pga");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [lockMsg, setLockMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [onlyValue, setOnlyValue] = useState(true);
  const [minEv, setMinEv] = useState("");
  const [metricView, setMetricView] = useState<"edge" | "ev">("ev");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [runningModel, setRunningModel] = useState(false);


  async function runModel() {
    setRunningModel(true);
    setError(null);
    setStatus("Dispatching model run...");
    try {
      const res = await fetch("/api/run-model", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to run model");
      setStatus("Model run started in GitHub Actions. Refresh after the run completes.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to run model");
      setStatus(e?.message ?? "Failed to run model");
    } finally {
      setRunningModel(false);
    }
  }

  async function load(ignoreLock = false) {
    if (locked && !ignoreLock) {
      setStatus("Refresh locked (tournament live)");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus("Loading...");
    try {
      const res = await fetch(`/api/run?tour=${tour}`, { method: "POST" });
      const json = (await res.json()) as RunResponse;
      if (!json?.ok) throw new Error(json?.error ?? "API error");
      setData(json);
      setStatus("Loaded");
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
      setStatus(e?.message ?? "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  useEffect(() => {
    async function loadLock() {
      try {
        const res = await fetch(`/api/data/event_meta.json?tour=${tour}`, { cache: "no-store" });
        if (!res.ok) return;
        const meta = await res.json();
        const lockDay = String(meta?.refreshLockDay ?? "").toUpperCase();
        const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
        const lockIdx = days.indexOf(lockDay);
        if (lockIdx === -1) return;
        const todayIdx = new Date().getDay();
        const daysSinceLock = (todayIdx - lockIdx + 7) % 7;
        const isLocked = daysSinceLock <= 3;
        setLocked(isLocked);
        setLockMsg(isLocked ? `Refresh locked (${lockDay}–Sunday).` : null);
      } catch {
        // ignore
      }
    }
    loadLock();
  }, [tour]);

  const betslipKeySet = useMemo(() => new Set(data?.betslipKeys ?? []), [data]);

  const rawTable = useMemo(() => {
    if (!data?.tables) return null;
    if (market === "top10") return data.tables.top10 ?? null;
    if (market === "top20") return data.tables.top20 ?? null;
    if (market === "make_cut") return data.tables.makeCut ?? null;
    return data.tables.missCut ?? null;
  }, [data, market]);

  const rows = useMemo(() => buildDisplayRows(rawTable, market), [rawTable, market]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const evFloor = minEv.trim() === "" ? 0 : Number(minEv) || 0;
    const sorted = [...rows].sort((a, b) =>
      metricView === "ev"
        ? (b.evPerUnit ?? -999) - (a.evPerUnit ?? -999) || (b.edge ?? -999) - (a.edge ?? -999)
        : (b.edge ?? -999) - (a.edge ?? -999) || (b.evPerUnit ?? -999) - (a.evPerUnit ?? -999)
    );
    return sorted.filter((row) => {
      if (q) {
        const hay = `${row.playerName} ${row.opponents} ${row.book}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (onlyValue) {
        if (row.qualified === false) return false;
        if (row.qualified === null && (row.evPerUnit ?? -999) <= evFloor) return false;
        if (row.qualified === true && minEv.trim() !== "" && (row.evPerUnit ?? -999) <= evFloor) return false;
      }
      return true;
    });
  }, [rows, search, minEv, onlyValue, metricView]);

  async function addToBetslip(row: DisplayRow) {
    const rowId = `${row.playerName}|${row.marketLabel}|${row.opponents}`;
    const uniqueKey = makeUniqueKey({
      tour,
      eventId: data?.meta?.eventId ?? "",
      market: row.marketLabel,
      dgId: row.dgId,
      playerName: row.playerName,
      opponents: row.opponents,
    });
    if (betslipKeySet.has(uniqueKey)) {
      setError("That bet is already in the betslip.");
      return;
    }
    setAddingId(rowId);
    setError(null);
    try {
      const payload = {
        tour,
        market: row.marketLabel,
        playerName: row.playerName,
        dgId: row.dgId ? Number(row.dgId) : undefined,
        opponents: row.opponents,
        marketOddsBestDec: row.odds ?? undefined,
        marketBookBest: row.book,
        pModel: row.modelProb ?? undefined,
      };
      const res = await fetch("/api/betslip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to add bet");
      await load(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to add bet");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--gb-bg)", fontFamily: "Arial, Helvetica, sans-serif", color: "var(--gb-text)" }}>
      <HeaderNav />

      <main className="gb-page-shell">
        <div className="gb-page-header">
          <h1 style={{ marginTop: 0, fontWeight: 700, fontSize: 28 }}>Value Screens</h1>
          <div className="gb-actions">
            <Button onClick={() => setTour("pga")} style={{ background: tour === "pga" ? "var(--gb-accent)" : "transparent", color: tour === "pga" ? "var(--gb-surface)" : "var(--gb-accent)", border: "1px solid var(--gb-accent)" }}>PGA</Button>
            <Button onClick={() => setTour("dp")} style={{ background: tour === "dp" ? "var(--gb-accent)" : "transparent", color: tour === "dp" ? "var(--gb-surface)" : "var(--gb-accent)", border: "1px solid var(--gb-accent)" }}>DP World Tour</Button>
          </div>
        </div>

        <div className="gb-control-bar">
          <select value={market} onChange={(e) => setMarket(e.target.value as Market)} className="gb-control" style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--gb-border)", background: "var(--gb-surface)", color: "var(--gb-text)" }}>
            <option value="top10">Top 10</option>
            <option value="top20">Top 20</option>
            <option value="make_cut">Make Cut</option>
            <option value="miss_cut">Miss Cut</option>
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player, opponent or book"
            className="gb-control-wide" style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--gb-border)", background: "var(--gb-surface)", color: "var(--gb-text)", minWidth: 260 }}
          />

          <input
            value={minEv}
            onChange={(e) => setMinEv(e.target.value)}
            placeholder="Min EV / unit (0.000 default)"
            className="gb-control" style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--gb-border)", background: "var(--gb-surface)", color: "var(--gb-text)", width: 190 }}
          />

          <label className="gb-control" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gb-muted)" }}>
            <input type="checkbox" checked={onlyValue} onChange={(e) => setOnlyValue(e.target.checked)} />
            Value only
          </label>

          <select
            value={metricView}
            onChange={(e) => setMetricView(e.target.value as "edge" | "ev")}
            className="gb-control"
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--gb-border)", background: "var(--gb-surface)", color: "var(--gb-text)" }}
          >
            <option value="edge">Show Edge</option>
            <option value="ev">Show EV / Unit</option>
          </select>

          <Button onClick={() => load(false)} disabled={loading || locked}>
            {loading ? "Loading..." : "Refresh"}
          </Button>

          <Button onClick={runModel} disabled={runningModel}>
            {runningModel ? "Starting..." : "Run Model"}
          </Button>

          <span style={{ color: "var(--gb-muted)" }}>
            {status}
            {locked && <span style={{ marginLeft: 12, color: "#ffb347" }}>{lockMsg ?? "Refresh locked (tournament live)."}</span>}
          </span>
        </div>

        <div style={{ marginBottom: 12, color: "var(--gb-muted)" }}>Showing {filteredRows.length} of {rows.length} rows</div>

        {error && <div style={{ marginBottom: 12, color: "#ff7a7a" }}>{error}</div>}

        {!rows.length ? (
          <div style={{ border: "1px solid var(--gb-border)", borderRadius: 16, padding: 16 }}>
            <p style={{ margin: 0 }}>No data loaded.</p>
          </div>
        ) : (
          <div className="gb-table-scroll gb-mobile-card-table">
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
              <thead>
                <tr>
                  {["Player", "Odds", "Book", "Market %", "Model %", metricView === "edge" ? "Edge" : "EV / Unit", ""].map((hh) => (
                    <th key={hh} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--gb-border)", background: "var(--gb-surface)", color: "var(--gb-text)", whiteSpace: "nowrap" }}>
                      {hh}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => {
                  const rowId = `${row.playerName}|${row.marketLabel}|${row.opponents}`;
                  const uniqueKey = makeUniqueKey({
                    tour,
                    eventId: data?.meta?.eventId ?? "",
                    market: row.marketLabel,
                    dgId: row.dgId,
                    playerName: row.playerName,
                    opponents: row.opponents,
                  });
                  const alreadyAdded = betslipKeySet.has(uniqueKey);
                  const isValue = (row.evPerUnit ?? -999) > 0;
                  const metricValue = metricView === "edge" ? formatEdge(row.edge) : formatEv(row.evPerUnit);
                  return (
                    <tr key={rowId + i} style={{ background: i % 2 === 0 ? "var(--gb-bg)" : "var(--gb-row-alt)" }}>
                      <td data-label="Player" style={{ padding: 10, borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{row.playerName}</td>
                      <td data-label="Odds" style={{ padding: 10, borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{formatOdds(row.odds)}</td>
                      <td data-label="Book" style={{ padding: 10, borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{row.book}</td>
                      <td data-label="Market %" style={{ padding: 10, borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{formatPct(row.marketProb)}</td>
                      <td data-label="Model %" style={{ padding: 10, borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{formatPct(row.modelProb)}</td>
                      <td data-label={metricView === "edge" ? "Edge" : "EV / Unit"} style={{ padding: 10, borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap", color: isValue ? "var(--gb-positive)" : "var(--gb-muted)", fontWeight: isValue ? 700 : 400 }}>
                        {metricValue}
                      </td>
                      <td data-label="" style={{ padding: 10, borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>
                        <Button onClick={() => addToBetslip(row)} disabled={addingId === rowId || alreadyAdded}>
                          {addingId === rowId ? "Adding..." : alreadyAdded ? "Added" : "Add to Betslip"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
