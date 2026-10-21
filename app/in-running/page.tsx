"use client";

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { HeaderNav, Button } from "../components/ui";

type Tour = "pga" | "dp";
type Market = "win" | "top5" | "top10" | "top20";
type TableData = { headers: string[]; rows: string[][] };
type Meta = {
  mode?: string;
  tour?: string;
  eventName?: string | null;
  runAt?: string;
  oddsLastUpdated?: string | null;
  deadHeat?: boolean;
  probabilitySource?: string;
  marketWeight?: number;
  markets?: { market: string; status?: string; reason?: string; validUntil?: string }[];
};
type Row = {
  playerName: string;
  position: string;
  score: string;
  thru: string;
  odds: number | null;
  book: string;
  marketProb: number | null;
  modelProb: number | null;
  edge: number | null;
  ev: number | null;
  qualified: boolean;
};

const MARKET_FILES: Record<Market, string> = {
  win: "latest_in_running_win.csv",
  top5: "latest_in_running_top5.csv",
  top10: "latest_in_running_top10.csv",
  top20: "latest_in_running_top20.csv",
};

const pageShell: CSSProperties = {
  width: "min(100%, 1480px)",
  margin: "0 auto",
  padding: "clamp(14px, 3vw, 28px)",
};

const panelStyle: CSSProperties = {
  border: "1px solid rgba(123,31,45,0.14)",
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(255,250,243,0.96), rgba(250,241,232,0.92))",
  boxShadow: "0 20px 55px rgba(43,17,23,0.12)",
};

function marketLabel(market: Market) {
  if (market === "win") return "Win";
  if (market === "top5") return "Top 5";
  if (market === "top10") return "Top 10";
  return "Top 20";
}

function parseCsv(text: string): TableData {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };
  return { headers: parseLine(lines[0]), rows: lines.slice(1).map(parseLine) };
}

function idx(headers: string[], names: string[]) {
  const norm = headers.map((h) => h.toLowerCase().trim());
  for (const name of names) {
    const found = norm.indexOf(name.toLowerCase());
    if (found >= 0) return found;
  }
  return -1;
}

function num(value: unknown): number | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function pct(value: number | null) {
  if (value === null) return "--";
  return `${(value * 100).toFixed(1)}%`;
}

function signedPct(value: number | null) {
  if (value === null) return "--";
  const n = value * 100;
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function ev(value: number | null) {
  if (value === null) return "--";
  return `${value > 0 ? "+" : ""}${value.toFixed(3)}`;
}

function dateTime(value: string | null | undefined) {
  if (!value) return "Not available";
  const parsed = Date.parse(value.replace(" UTC", "+00:00"));
  if (!Number.isFinite(parsed)) return value;
  return new Date(parsed).toLocaleString();
}

function buildRows(table: TableData): Row[] {
  const h = table.headers;
  const iPlayer = idx(h, ["player_name", "player"]);
  const iPos = idx(h, ["current_pos"]);
  const iScore = idx(h, ["current_score"]);
  const iThru = idx(h, ["thru"]);
  const iOdds = idx(h, ["market_odds_best_dec"]);
  const iBook = idx(h, ["market_book_best"]);
  const iMarketProb = idx(h, ["market_prob_best"]);
  const iModel = idx(h, ["p_model", "p_dg_live"]);
  const iEdge = idx(h, ["edge_prob"]);
  const iEv = idx(h, ["ev_per_unit"]);
  const iQualified = idx(h, ["strategy_qualified", "bet_flag"]);

  return table.rows
    .map((r) => {
      const qualifiedRaw = iQualified >= 0 ? String(r[iQualified] ?? "").toLowerCase() : "";
      return {
        playerName: iPlayer >= 0 ? r[iPlayer] ?? "" : "",
        position: iPos >= 0 ? r[iPos] ?? "" : "",
        score: iScore >= 0 ? r[iScore] ?? "" : "",
        thru: iThru >= 0 ? r[iThru] ?? "" : "",
        odds: iOdds >= 0 ? num(r[iOdds]) : null,
        book: iBook >= 0 ? r[iBook] ?? "" : "",
        marketProb: iMarketProb >= 0 ? num(r[iMarketProb]) : null,
        modelProb: iModel >= 0 ? num(r[iModel]) : null,
        edge: iEdge >= 0 ? num(r[iEdge]) : null,
        ev: iEv >= 0 ? num(r[iEv]) : null,
        qualified: ["true", "1", "yes"].includes(qualifiedRaw),
      };
    })
    .filter((r) => r.playerName)
    .sort((a, b) => (b.ev ?? -999) - (a.ev ?? -999));
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "positive" | "dark" }) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.01em",
    border: "1px solid rgba(123,31,45,0.16)",
    background: "rgba(255,250,243,0.78)",
    color: "var(--gb-muted)",
  };
  if (tone === "positive") {
    style.background = "rgba(23,102,66,0.12)";
    style.color = "#0f5736";
    style.border = "1px solid rgba(23,102,66,0.22)";
  }
  if (tone === "dark") {
    style.background = "rgba(255,250,243,0.12)";
    style.color = "#fff7ed";
    style.border = "1px solid rgba(255,250,243,0.22)";
  }
  return <span style={style}>{children}</span>;
}

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div style={{ ...panelStyle, padding: 16, minHeight: 104 }}>
      <div style={{ color: "var(--gb-muted)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ color: "var(--gb-text)", fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, marginTop: 8, lineHeight: 1 }}>{value}</div>
      {detail ? <div style={{ color: "var(--gb-muted)", marginTop: 8, fontSize: 13 }}>{detail}</div> : null}
    </div>
  );
}

export default function InRunningPage() {
  const [tour, setTour] = useState<Tour>("pga");
  const [market, setMarket] = useState<Market>("top20");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [table, setTable] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [onlyQualified, setOnlyQualified] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const [now, setNow] = useState(() => Date.now());
  const sourceMarket = market === "win" ? "win" : `top_${market.slice(3)}`;
  const marketMeta = meta?.markets?.find((item) => item.market === sourceMarket);
  const expiry = Date.parse(marketMeta?.validUntil ?? "");
  const snapshotValid = marketMeta?.status === "ready" && Number.isFinite(expiry) && now < expiry;
  const emptyReason = marketMeta?.reason || (marketMeta?.status === "ready" ? "This snapshot has expired. Run the in-running model again for fresh probabilities and prices." : "No current live comparison available. Run the in-running model when the tournament is underway.");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function load() {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    setTable(null);
    setMeta(null);
    setStatus("Loading in-running outputs...");
    try {
      const [csvRes, metaRes] = await Promise.all([
        fetch(`/api/data/${MARKET_FILES[market]}?tour=${tour}`, { cache: "no-store" }),
        fetch(`/api/data/in_running_meta.json?tour=${tour}`, { cache: "no-store" }),
      ]);
      if (!csvRes.ok) throw new Error(`${MARKET_FILES[market]} (${csvRes.status})`);
      if (!metaRes.ok) throw new Error(`In-running metadata (${metaRes.status})`);
      const [csv, nextMeta] = await Promise.all([csvRes.text(), metaRes.json() as Promise<Meta>]);
      if (id !== requestId.current) return;
      if (nextMeta.tour !== tour) throw new Error("In-running data belongs to a different tour");
      setTable(parseCsv(csv));
      setMeta(nextMeta);
      setNow(Date.now());
      setStatus("Loaded");
    } catch (e: any) {
      if (id !== requestId.current) return;
      setError(e?.message ?? "Failed to load in-running outputs");
      setTable(null);
      setStatus("Failed to load");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  async function runInRunningModel() {
    setRunning(true);
    setError(null);
    setStatus("Starting in-running model...");
    try {
      const res = await fetch("/api/run-model", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "in_running" }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to run in-running model");
      setStatus("In-running model started in GitHub Actions. Refresh this page after it completes.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to run in-running model");
      setStatus("Failed to start");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, market]);

  const rows = useMemo(() => buildRows(table ?? { headers: [], rows: [] }), [table]);
  const visibleRows = useMemo(() => {
    if (!snapshotValid) return [];
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyQualified && !r.qualified) return false;
      if (q && !`${r.playerName} ${r.book}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, onlyQualified, search, snapshotValid]);

  const qualifiedRows = useMemo(() => snapshotValid ? rows.filter((r) => r.qualified) : [], [rows, snapshotValid]);
  const bestRow = snapshotValid ? qualifiedRows[0] ?? rows[0] ?? null : null;
  const avgEv = qualifiedRows.length
    ? qualifiedRows.reduce((sum, row) => sum + (row.ev ?? 0), 0) / qualifiedRows.length
    : null;
  const topEv = bestRow?.ev ?? null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 16% 0%, rgba(123,31,45,0.18), transparent 32%), linear-gradient(135deg, #f8efe4 0%, #fffaf3 42%, #ead8cb 100%)",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "var(--gb-text)",
      }}
    >
      <HeaderNav />
      <main style={pageShell}>
        <section
          style={{
            borderRadius: 30,
            overflow: "hidden",
            background: "linear-gradient(135deg, #2b1117 0%, #651927 52%, #9b6a48 100%)",
            color: "#fffaf3",
            boxShadow: "0 28px 70px rgba(43,17,23,0.24)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              padding: "clamp(20px, 4vw, 34px)",
              background:
                "radial-gradient(circle at 82% 10%, rgba(255,250,243,0.22), transparent 28%), radial-gradient(circle at 22% 95%, rgba(255,250,243,0.10), transparent 30%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ maxWidth: 780 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  <Pill tone="dark">DataGolf Live</Pill>
                  <Pill tone="dark">Dead-Heat Adjusted</Pill>
                  <Pill tone="dark">Research Mode</Pill>
                </div>
                <h1 style={{ margin: 0, fontSize: "clamp(34px, 6vw, 68px)", lineHeight: 0.92, letterSpacing: "-0.055em", fontWeight: 900 }}>
                  In Running
                </h1>
                <p style={{ margin: "16px 0 0", color: "rgba(255,250,243,0.82)", fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.5, maxWidth: 720 }}>
                  A separate live-price workspace using DataGolf in-play probabilities. It does not overwrite the pre-tournament model or the normal betslip.
                </p>
              </div>
              <div style={{ minWidth: 260, border: "1px solid rgba(255,250,243,0.18)", borderRadius: 22, padding: 16, background: "rgba(255,250,243,0.10)", backdropFilter: "blur(10px)" }}>
                <div style={{ color: "rgba(255,250,243,0.62)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em" }}>Current Event</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{meta?.eventName || "Unknown"}</div>
                <div style={{ color: "rgba(255,250,243,0.72)", marginTop: 10, fontSize: 13 }}>Odds updated: {dateTime(meta?.oddsLastUpdated)}</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 14 }}>
          <StatCard label="Qualified Plays" value={String(qualifiedRows.length)} detail={`${marketLabel(market)} · ${tour.toUpperCase()}`} />
          <StatCard label="Top EV / Unit" value={ev(topEv)} detail={bestRow ? bestRow.playerName : "No rows loaded"} />
          <StatCard label="Average Qualified EV" value={ev(avgEv)} detail={qualifiedRows.length ? `${qualifiedRows.length} bets passing criteria` : "No qualified bets"} />
          <StatCard label="Market Blend" value={`${Math.round((meta?.marketWeight ?? 0) * 100)}%`} detail="0% means raw DG live probability" />
        </section>

        <section style={{ ...panelStyle, padding: "14px clamp(14px, 2.4vw, 20px)", marginBottom: 14 }}>
          <div className="gb-control-bar" style={{ marginBottom: 0, alignItems: "center" }}>
            <div className="gb-actions" style={{ gap: 8 }}>
              <Button onClick={() => setTour("pga")} style={{ background: tour === "pga" ? "var(--gb-accent)" : "#fffaf3", color: tour === "pga" ? "var(--gb-surface)" : "var(--gb-accent)", border: "1px solid var(--gb-accent)", boxShadow: tour === "pga" ? "0 8px 18px rgba(123,31,45,0.22)" : "none" }}>PGA</Button>
              <Button onClick={() => setTour("dp")} style={{ background: tour === "dp" ? "var(--gb-accent)" : "#fffaf3", color: tour === "dp" ? "var(--gb-surface)" : "var(--gb-accent)", border: "1px solid var(--gb-accent)", boxShadow: tour === "dp" ? "0 8px 18px rgba(123,31,45,0.22)" : "none" }}>DP World Tour</Button>
            </div>
            <select aria-label="In-running market" value={market} onChange={(e) => setMarket(e.target.value as Market)} className="gb-control" style={{ padding: "11px 12px", borderRadius: 12, border: "1px solid var(--gb-border)", background: "#fffaf3", color: "var(--gb-text)", fontWeight: 800 }}>
              <option value="win">Win</option>
              <option value="top5">Top 5</option>
              <option value="top10">Top 10</option>
              <option value="top20">Top 20</option>
            </select>
            <input aria-label="Search player or book" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player or book" className="gb-control-wide" style={{ padding: "11px 12px", borderRadius: 12, border: "1px solid var(--gb-border)", background: "#fffaf3", color: "var(--gb-text)", minWidth: 250 }} />
            <label className="gb-control" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gb-muted)", fontWeight: 800 }}>
              <input type="checkbox" checked={onlyQualified} onChange={(e) => setOnlyQualified(e.target.checked)} />
              Criteria only
            </label>
            <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
            <Button onClick={runInRunningModel} disabled={running} style={{ background: running ? "var(--gb-border-soft)" : "var(--gb-accent)", color: running ? "var(--gb-muted)" : "#fffaf3" }}>
              {running ? "Starting..." : "Run In-Running Model"}
            </Button>
          </div>
        </section>

        <section style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill>{dateTime(meta?.runAt)}</Pill>
            <Pill>{meta?.deadHeat ? "Dead heat on" : "Dead heat unknown"}</Pill>
            <Pill>{visibleRows.length} of {rows.length} rows</Pill>
          </div>
          <div style={{ color: status === "Failed to load" ? "#9f1f32" : "var(--gb-muted)", fontWeight: 800 }}>{status}</div>
        </section>

        {error ? (
          <div style={{ ...panelStyle, marginBottom: 12, padding: 14, color: "#9f1f32", fontWeight: 800 }}>{error}</div>
        ) : null}

        {!visibleRows.length ? (
          <div style={{ ...panelStyle, padding: 22 }} role="status">{loading ? "Loading in-running outputs..." : snapshotValid ? "No players match the current filters." : emptyReason}</div>
        ) : (
          <div className="gb-table-scroll gb-mobile-card-table" style={{ ...panelStyle, overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 1040 }}>
                <thead>
                  <tr>
                    {["Player", "Position", "Score", "Thru", "Odds", "Book", "Market", "DG Live", "Edge", "EV / Unit", "Criteria"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "13px 14px", borderBottom: "1px solid rgba(123,31,45,0.14)", background: "#fffaf3", color: "var(--gb-muted)", whiteSpace: "nowrap", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, i) => {
                    const positive = (row.ev ?? 0) > 0;
                    return (
                      <tr key={`${row.playerName}-${i}`} style={{ background: row.qualified ? "rgba(23,102,66,0.055)" : i % 2 === 0 ? "rgba(255,250,243,0.75)" : "rgba(240,228,216,0.58)" }}>
                        <td data-label="Player" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap", fontWeight: 900 }}>{row.playerName}</td>
                        <td data-label="Position" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{row.position || "--"}</td>
                        <td data-label="Score" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap", fontWeight: 900 }}>{row.score || "--"}</td>
                        <td data-label="Thru" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{row.thru || "--"}</td>
                        <td data-label="Odds" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap", fontWeight: 900 }}>{row.odds?.toFixed(2) ?? "--"}</td>
                        <td data-label="Book" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{row.book || "--"}</td>
                        <td data-label="Market" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>{pct(row.marketProb)}</td>
                        <td data-label="DG Live" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap", fontWeight: 900 }}>{pct(row.modelProb)}</td>
                        <td data-label="Edge" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap", color: (row.edge ?? 0) > 0 ? "var(--gb-positive)" : "var(--gb-muted)", fontWeight: 800 }}>{signedPct(row.edge)}</td>
                        <td data-label="EV / Unit" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap", color: positive ? "var(--gb-positive)" : "var(--gb-muted)", fontWeight: 950 }}>{ev(row.ev)}</td>
                        <td data-label="Criteria" style={{ padding: "14px", borderBottom: "1px solid var(--gb-border-soft)", whiteSpace: "nowrap" }}>
                          <Pill tone={row.qualified ? "positive" : "neutral"}>{row.qualified ? "Pass" : "Watch"}</Pill>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
