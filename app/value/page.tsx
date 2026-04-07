"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HeaderNav, Button } from "../components/ui";

type Market = "win" | "top5" | "top10" | "top20" | "make_cut" | "miss_cut" | "matchup_2b" | "matchup_3b";
type TableData = { headers: string[]; rows: string[][] };
type RunResponse = {
  ok?: boolean;
  error?: string;
  meta?: { eventId?: string; refreshLockDay?: string };
  tables?: {
    win?: TableData | null;
    top5?: TableData | null;
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
  if (market === "win") return "Win";
  if (market === "top5") return "Top 5";
  if (market === "top10") return "Top 10";
  if (market === "top20") return "Top 20";
  if (market === "make_cut") return "Make Cut";
  if (market === "miss_cut") return "Miss Cut";
  if (market === "matchup_2b") return "Matchup 2-Ball";
  return "Matchup 3-Ball";
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

  const idxModelProb =
    market === "win"
      ? pickIndex(h, ["win_prob_anchored", "win_prob_model", "p_model"])
      : market === "top5"
      ? pickIndex(h, ["top5_prob_anchored", "top5_prob_model", "p_model"])
      : market === "top10"
      ? pickIndex(h, ["top10_prob_anchored", "top10_prob_model", "p_model"])
      : market === "top20"
      ? pickIndex(h, ["top20_prob_anchored_dh", "top20_prob_anchored", "top20_prob_dh", "top20_prob_model", "p_model"])
      : market === "make_cut"
      ? pickIndex(h, ["p_make_cut_anchored", "p_make_cut_model", "p_make_cut", "make_cut_prob", "p_model"])
      : market === "miss_cut"
      ? pickIndex(h, ["p_miss_cut_anchored", "p_miss_cut_model", "p_miss_cut", "miss_cut_prob", "p_model"])
      : pickIndex(h, ["p_model", "win_prob", "model_prob"]);

  return raw.rows
    .map((r) => {
      const odds = idxOdds >= 0 ? toNumber(r[idxOdds]) : null;
      const marketProb = idxMarketProb >= 0 ? toNumber(r[idxMarketProb]) : odds && odds > 0 ? 1 / odds : null;
      const modelProb = idxModelProb >= 0 ? toNumber(r[idxModelProb]) : null;
      const edgeCsv = idxEdge >= 0 ? toNumber(r[idxEdge]) : null;
      const edge = edgeCsv !== null ? edgeCsv : modelProb !== null && marketProb !== null ? modelProb - marketProb : null;
      const evPerUnit =
        modelProb !== null && odds !== null && odds > 1
          ? modelProb * (odds - 1) - (1 - modelProb)
          : null;
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
      };
    })
    .filter((r) => r.playerName)
    .sort((a, b) => (b.evPerUnit ?? -999) - (a.evPerUnit ?? -999) || (b.edge ?? -999) - (a.edge ?? -999));
}

export default function ValueScreensPage() {
  const [market, setMarket] = useState<Market>("top20");
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
      const isMatchup = market === "matchup_2b" || market === "matchup_3b";
      const table = market === "win"
        ? json.tables?.win
        : market === "top5"
        ? json.tables?.top5
        : market === "top10"
        ? json.tables?.top10
        : market === "top20"
        ? json.tables?.top20
        : market === "make_cut"
        ? json.tables?.makeCut
        : market === "miss_cut"
        ? json.tables?.missCut
        : market === "matchup_2b"
        ? json.tables?.matchup2
        : json.tables?.matchup3;
      if (isMatchup && table && Array.isArray(table.rows) && table.rows.length === 0) {
        setStatus("No matchup odds available for this event.");
      } else {
        setStatus("Loaded");
      }
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
    if (market === "win") return data.tables.win ?? null;
    if (market === "top5") return data.tables.top5 ?? null;
    if (market === "top10") return data.tables.top10 ?? null;
    if (market === "top20") return data.tables.top20 ?? null;
    if (market === "make_cut") return data.tables.makeCut ?? null;
    if (market === "miss_cut") return data.tables.missCut ?? null;
    if (market === "matchup_2b") return data.tables.matchup2 ?? null;
    return data.tables.matchup3 ?? null;
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
      if (onlyValue && (row.evPerUnit ?? -999) <= evFloor) return false;
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
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "sans-serif", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h1 style={{ marginTop: 0, fontWeight: 700, fontSize: 28 }}>Value Screens</h1>
          <div style={{ display: "flex", gap: 6 }}>
            <Button onClick={() => setTour("pga")} style={{ background: tour === "pga" ? "#f3b44b" : "transparent", color: tour === "pga" ? "#111" : "#f3b44b", border: "1px solid #f3b44b" }}>PGA</Button>
            <Button onClick={() => setTour("dp")} style={{ background: tour === "dp" ? "#f3b44b" : "transparent", color: tour === "dp" ? "#111" : "#f3b44b", border: "1px solid #f3b44b" }}>DP World Tour</Button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <select value={market} onChange={(e) => setMarket(e.target.value as Market)} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", background: "#111", color: "white" }}>
            <option value="win">Win</option>
            <option value="top5">Top 5</option>
            <option value="top10">Top 10</option>
            <option value="top20">Top 20</option>
            <option value="make_cut">Make Cut</option>
            <option value="miss_cut">Miss Cut</option>
            <option value="matchup_2b">Matchups (2-Ball)</option>
            <option value="matchup_3b">Matchups (3-Ball)</option>
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player, opponent or book"
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", background: "#111", color: "white", minWidth: 260 }}
          />

          <input
            value={minEv}
            onChange={(e) => setMinEv(e.target.value)}
            placeholder="Min EV / unit (0.000 default)"
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", background: "#111", color: "white", width: 190 }}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ddd" }}>
            <input type="checkbox" checked={onlyValue} onChange={(e) => setOnlyValue(e.target.checked)} />
            Value only
          </label>

          <select
            value={metricView}
            onChange={(e) => setMetricView(e.target.value as "edge" | "ev")}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", background: "#111", color: "white" }}
          >
            <option value="edge">Show Edge</option>
            <option value="ev">Show EV / Unit</option>
          </select>

          <Button onClick={() => load(false)} disabled={loading || locked}>
            {loading ? "Loading..." : "Refresh"}
          </Button>

          <span style={{ color: "#bbb" }}>
            {status}
            {locked && <span style={{ marginLeft: 12, color: "#ffb347" }}>{lockMsg ?? "Refresh locked (tournament live)."}</span>}
          </span>
        </div>

        <div style={{ marginBottom: 12, color: "#bbb" }}>
          Showing {filteredRows.length} of {rows.length} rows
        </div>

        {error && <div style={{ marginBottom: 12, color: "#ff7a7a" }}>{error}</div>}

        {!rows.length ? (
          <div style={{ border: "1px solid #333", borderRadius: 16, padding: 16 }}>
            <p style={{ margin: 0 }}>No data loaded.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid #333", borderRadius: 14 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1100 }}>
              <thead>
                <tr>
                  {["Player", "Opponent(s)", "Odds", "Book", "Market Win %", "Model Win %", metricView === "edge" ? "Edge" : "EV / Unit", ""].map((hh) => (
                    <th key={hh} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #333", background: "#111", color: "white", whiteSpace: "nowrap" }}>
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
                    <tr key={rowId + i} style={{ background: i % 2 === 0 ? "#000" : "#141414" }}>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{row.playerName}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{row.opponents}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{formatOdds(row.odds)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{row.book}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{formatPct(row.marketProb)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{formatPct(row.modelProb)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap", color: isValue ? "#8bffb6" : "#bbb", fontWeight: isValue ? 700 : 400 }}>
                        {metricValue}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>
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
