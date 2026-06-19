"use client";

import { useEffect, useState } from "react";
import { HeaderNav, Button, Card } from "./components/ui";

type HomeSummary = {
  ok?: boolean;
  error?: string;
  tour?: string;
  meta?: { eventId?: string; eventName?: string; eventYear?: number } | null;
  ytd?: {
    year: number;
    pnlUnits: number;
    stakedUnits: number;
    roi: number | null;
    betsPlaced: number;
    betsSettled: number;
    betsWon: number;
    betsLost: number;
    bestBet: null | {
      market: string;
      playerName: string;
      odds: number | null;
      stake: number | null;
      returnUnits: number | null;
      eventName: string;
      eventYear: number;
    };
  };
  liveError?: string | null;
  liveLastUpdate?: string | null;
  liveProjection?: {
    countedBets: number;
    pendingBets: number;
    wins: number;
    losses: number;
    pnlUnits: number;
  };
  weeklyPlaced?: Array<{
    id: string;
    market: string;
    playerName: string;
    opponents?: string | null;
    book?: string | null;
    odds?: number | null;
    stake?: number | null;
    pModel?: number | null;
    evPerUnit?: number | null;
    liveStatus: string;
    liveDetail?: string | null;
    liveProb?: number | null;
    currentPos?: string | null;
    currentScore?: number | null;
    thru?: number | string | null;
    round?: number | string | null;
    projectedReturnUnits?: number | null;
    projectedOutcome?: string;
  }>;
};

function fmt(n: unknown, dp = 2) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  return v.toFixed(dp);
}

function fmtSigned(n: unknown, dp = 2) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  return `${v > 0 ? "+" : ""}${v.toFixed(dp)}`;
}

function fmtPct(n: unknown) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  return `${(v * 100).toFixed(1)}%`;
}

export default function HomePage() {
  const [tour, setTour] = useState<"pga" | "dp">("pga");
  const [data, setData] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/home-summary?tour=${tour}&t=${Date.now()}`, { cache: "no-store" });
      const json = (await res.json()) as HomeSummary;
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load home summary");
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function runModel() {
    setRunning(true);
    setError(null);
    setStatus("Dispatching model run...");
    try {
      const res = await fetch("/api/run-model", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || "Failed to run model");
      setStatus("Model run started in GitHub Actions. Refresh this page after the run completes.");
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setStatus("");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  const ytd = data?.ytd;
  const weekly = data?.weeklyPlaced ?? [];
  const eventTitle = data?.meta?.eventName
    ? `${data.meta.eventName} ${data.meta.eventYear ?? ""}`
    : "Current event unavailable";

  return (
    <div style={{ minHeight: "100vh", background: "var(--gb-bg)", color: "var(--gb-text)" }}>
      <HeaderNav />
      <main className="gb-page-shell gb-page-shell-narrow">
        <div className="gb-page-header">
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 30 }}>Golf Bets Webapp</h1>
            <div style={{ color: "var(--gb-muted)", marginTop: 4 }}>{eventTitle}</div>
          </div>
          <div className="gb-actions gb-actions-auto">
            <Button onClick={() => setTour("pga")} style={{ background: tour === "pga" ? "var(--gb-accent)" : "transparent", color: tour === "pga" ? "var(--gb-surface)" : "var(--gb-accent)" }}>PGA</Button>
            <Button onClick={() => setTour("dp")} style={{ background: tour === "dp" ? "var(--gb-accent)" : "transparent", color: tour === "dp" ? "var(--gb-surface)" : "var(--gb-accent)" }}>DP World Tour</Button>
          </div>
          <Button onClick={load} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</Button>
          <Button onClick={runModel} disabled={running}>{running ? "Starting..." : "Run Model"}</Button>
        </div>

        {status && <div style={{ marginTop: 12, color: "var(--gb-muted)" }}>{status}</div>}
        {error && <pre style={{ marginTop: 12, color: "#b42335", whiteSpace: "pre-wrap" }}>{error}</pre>}

        <div style={{ height: 18 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <Card><Stat label="YTD P/L" value={`${fmtSigned(ytd?.pnlUnits)}u`} /></Card>
          <Card><Stat label="YTD ROI" value={fmtPct(ytd?.roi)} /></Card>
          <Card><Stat label="Bets Placed" value={String(ytd?.betsPlaced ?? 0)} /></Card>
          <Card><Stat label="Won / Lost" value={`${ytd?.betsWon ?? 0} / ${ytd?.betsLost ?? 0}`} /></Card>
        </div>

        <div style={{ height: 16 }} />

        <Card>
          <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>Best YTD Bet</h2>
          {!ytd?.bestBet ? (
            <p style={{ margin: 0, color: "var(--gb-muted)" }}>No settled bets yet.</p>
          ) : (
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: "var(--gb-muted)" }}>
              <b style={{ color: "var(--gb-text)" }}>{ytd.bestBet.playerName}</b>
              <span>{ytd.bestBet.market}</span>
              <span>{ytd.bestBet.eventName} {ytd.bestBet.eventYear}</span>
              <span>Odds {fmt(ytd.bestBet.odds)}</span>
              <span>Stake {fmt(ytd.bestBet.stake)}u</span>
              <span style={{ color: "var(--gb-positive)", fontWeight: 800 }}>Return {fmtSigned(ytd.bestBet.returnUnits)}u</span>
            </div>
          )}
        </Card>

        <div style={{ height: 16 }} />

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap", marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Bets Placed This Week</h2>
            <span style={{ color: "var(--gb-muted)", fontSize: 13 }}>
              {data?.liveError
                ? `Live feed: ${data.liveError}`
                : data?.liveLastUpdate
                  ? `Live updated: ${data.liveLastUpdate}`
                  : "Live feed pending"}
            </span>
          </div>
          {!weekly.length ? (
            <p style={{ margin: 0, color: "var(--gb-muted)" }}>No placed bets for the current event yet.</p>
          ) : (
            <div className="gb-table-scroll gb-mobile-card-table">
              <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Market", "Player", "Opponents", "Book", "Odds", "Stake", "Live Status", "Live Detail"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--gb-border-soft)", color: "var(--gb-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekly.map((b, i) => (
                    <tr key={b.id} style={{ background: i % 2 ? "var(--gb-row-alt)" : "transparent" }}>
                      <td data-label="Market" style={cell}>{b.market}</td>
                      <td data-label="Player" style={cell}>{b.playerName}</td>
                      <td data-label="Opponents" style={cell}>{b.opponents || "-"}</td>
                      <td data-label="Book" style={cell}>{b.book || "-"}</td>
                      <td data-label="Odds" style={cell}>{fmt(b.odds)}</td>
                      <td data-label="Stake" style={cell}>{fmt(b.stake)}</td>
                      <td data-label="Live Status" style={{ ...cell, color: liveColor(b.liveStatus), fontWeight: 800 }}>{b.liveStatus}</td>
                      <td data-label="Live Detail" style={{ ...cell, color: "var(--gb-muted)" }}>{b.liveDetail || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {weekly.length > 0 && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid var(--gb-border-soft)",
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                color: "var(--gb-muted)",
              }}
            >
              <b style={{ color: "var(--gb-text)" }}>If finished now</b>
              <span>P/L: <b style={{ color: liveProjectionColor(data?.liveProjection?.pnlUnits) }}>{fmtSigned(data?.liveProjection?.pnlUnits)}u</b></span>
              <span>Won/Lost: <b style={{ color: "var(--gb-text)" }}>{data?.liveProjection?.wins ?? 0} / {data?.liveProjection?.losses ?? 0}</b></span>
              <span>Counted: {data?.liveProjection?.countedBets ?? 0}</span>
              {(data?.liveProjection?.pendingBets ?? 0) > 0 && <span>Pending/no live data: {data?.liveProjection?.pendingBets}</span>}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--gb-muted)", fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 850 }}>{value}</div>
    </div>
  );
}

const cell = {
  padding: 10,
  borderBottom: "1px solid var(--gb-border-soft)",
  whiteSpace: "nowrap" as const,
};


function liveColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes("winning") || s.includes("win")) return "var(--gb-positive)";
  if (s.includes("losing") || s.includes("loss")) return "#b42335";
  if (s.includes("tied")) return "#9a6a12";
  return "var(--gb-muted)";
}

function liveProjectionColor(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "var(--gb-muted)";
  if (n > 0) return "var(--gb-positive)";
  if (n < 0) return "#b42335";
  return "var(--gb-muted)";
}
