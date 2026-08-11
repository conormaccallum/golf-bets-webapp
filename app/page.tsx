"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HeaderNav, Button, Card } from "./components/ui";


type ModelRunProgress = {
  ok?: boolean;
  error?: string;
  run?: {
    id: number;
    status: string;
    conclusion: string | null;
    created_at: string;
    run_started_at: string | null;
    updated_at: string;
    html_url: string;
    isCurrentRequest?: boolean;
  } | null;
  output?: {
    updatedForRequest?: boolean;
    runMeta?: { runAt?: string; eventName?: string; eventYear?: number; tour?: string } | null;
    eventMeta?: { eventName?: string; eventYear?: number; eventId?: string } | null;
  };
};

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
      tour?: string | null;
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


function runProgressMessage(progress: ModelRunProgress | null, startedAt: string | null) {
  if (!startedAt) return "";
  if (!progress) return "Starting model run...";
  if (progress.error) return progress.error;

  const run = progress.run;
  const output = progress.output;
  if (output?.updatedForRequest) {
    const event = output.eventMeta?.eventName || output.runMeta?.eventName || "latest event";
    return `Outputs updated for ${event}.`;
  }
  if (!run || !run.isCurrentRequest) return "GitHub has accepted the request. Waiting for the workflow run to appear...";
  if (run.status === "queued") return "GitHub Actions queued. Waiting for a runner...";
  if (run.status === "in_progress") return "Model is running in GitHub Actions...";
  if (run.status === "completed" && run.conclusion === "success") return "Model run complete. Waiting for output files/event name to update...";
  if (run.status === "completed") return `Model run finished with status: ${run.conclusion || "unknown"}.`;
  return `GitHub Actions status: ${run.status}.`;
}

function runProgressPct(progress: ModelRunProgress | null, startedAt: string | null) {
  if (!startedAt) return 0;
  if (progress?.output?.updatedForRequest) return 100;
  const run = progress?.run;
  if (!run || !run.isCurrentRequest) return 15;
  if (run.status === "queued") return 25;
  if (run.status === "in_progress") return 55;
  if (run.status === "completed" && run.conclusion === "success") return 85;
  if (run.status === "completed") return 100;
  return 35;
}

function isSettledHomeBet(b: NonNullable<HomeSummary["weeklyPlaced"]>[number]) {
  const status = (b.liveStatus || "").toLowerCase();
  return status === "won" || status === "lost" || status === "push" || status.includes("settled");
}

function liveWinSortProb(b: NonNullable<HomeSummary["weeklyPlaced"]>[number]) {
  const p = Number(b.liveProb);
  if (Number.isFinite(p)) return p;

  const status = (b.liveStatus || "").toLowerCase();
  if (status === "won" || status.includes("winning")) return 0.75;
  if (status === "push" || status.includes("tied")) return 0.5;
  if (status === "lost" || status.includes("losing")) return 0.25;
  return -1;
}

export default function HomePage() {
  const [tour, setTour] = useState<"pga" | "dp">("pga");
  const [data, setData] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [runStartedAt, setRunStartedAt] = useState<string | null>(null);
  const [runProgress, setRunProgress] = useState<ModelRunProgress | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  async function pollModelProgress(startedAt: string, attempt = 0) {
    try {
      const res = await fetch(`/api/run-model?tour=${tour}&since=${encodeURIComponent(startedAt)}&t=${Date.now()}`, { cache: "no-store" });
      const json = (await res.json()) as ModelRunProgress;
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to check model progress");
      setRunProgress(json);
      setStatus(runProgressMessage(json, startedAt));

      if (json.output?.updatedForRequest) {
        setRunning(false);
        await load();
        return;
      }

      const run = json.run;
      if (run?.isCurrentRequest && run.status === "completed" && run.conclusion && run.conclusion !== "success") {
        setRunning(false);
        setError(`Model run failed: ${run.conclusion}. Open the GitHub Actions link for logs.`);
        return;
      }

      if (attempt < 90) {
        pollTimer.current = setTimeout(() => pollModelProgress(startedAt, attempt + 1), 10000);
      } else {
        setRunning(false);
        setStatus("Stopped polling after 15 minutes. The run may still finish in GitHub Actions.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to check model progress");
      setRunning(false);
    }
  }

  async function runModel() {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    const startedAt = new Date().toISOString();
    setRunning(true);
    setRunStartedAt(startedAt);
    setRunProgress(null);
    setError(null);
    setStatus("Dispatching model run...");
    try {
      const res = await fetch("/api/run-model", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || "Failed to run model");
      setStatus("Model run dispatched. Checking GitHub Actions...");
      pollTimer.current = setTimeout(() => pollModelProgress(startedAt), 5000);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setStatus("");
      setRunning(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  const ytd = data?.ytd;
  const weekly = useMemo(() => {
    return [...(data?.weeklyPlaced ?? [])].sort((a, b) => {
      const settledDiff = Number(isSettledHomeBet(a)) - Number(isSettledHomeBet(b));
      if (settledDiff !== 0) return settledDiff;
      return liveWinSortProb(b) - liveWinSortProb(a);
    });
  }, [data?.weeklyPlaced]);
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

        {(status || runStartedAt) && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <b>Model Refresh</b>
              <span style={{ color: "var(--gb-muted)", fontSize: 13 }}>
                {runStartedAt ? `Started ${new Date(runStartedAt).toLocaleTimeString()}` : "Not started"}
              </span>
            </div>
            <div style={{ color: "var(--gb-muted)", marginBottom: 10 }}>{status || runProgressMessage(runProgress, runStartedAt)}</div>
            <div style={{ height: 9, background: "var(--gb-border-soft)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: `${runProgressPct(runProgress, runStartedAt)}%`,
                  height: "100%",
                  background: runProgress?.run?.status === "completed" && runProgress.run.conclusion !== "success" ? "#b42335" : "var(--gb-accent)",
                  transition: "width 300ms ease",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, color: "var(--gb-muted)", fontSize: 13 }}>
              {runProgress?.run?.html_url ? <a href={runProgress.run.html_url} target="_blank" rel="noreferrer">Open GitHub run</a> : <span>GitHub run pending</span>}
              {runProgress?.output?.runMeta?.runAt ? <span>Latest output: {new Date(runProgress.output.runMeta.runAt).toLocaleString()}</span> : <span>Output timestamp pending</span>}
              {runProgress?.output?.eventMeta?.eventName ? <span>Output event: {runProgress.output.eventMeta.eventName}</span> : null}
            </div>
          </Card>
        )}
        {error && <pre style={{ marginTop: 12, color: "#b42335", whiteSpace: "pre-wrap" }}>{error}</pre>}

        <div style={{ height: 18 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <Card><Stat label="YTD P/L (All Tours)" value={`${fmtSigned(ytd?.pnlUnits)}u`} /></Card>
          <Card><Stat label="YTD ROI (All Tours)" value={fmtPct(ytd?.roi)} /></Card>
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
              <span>{(ytd.bestBet.tour || "pga").toUpperCase()} • {ytd.bestBet.eventName} {ytd.bestBet.eventYear}</span>
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
  if (s === "won" || s.includes("winning") || s.includes("win")) return "var(--gb-positive)";
  if (s === "lost" || s.includes("losing") || s.includes("loss")) return "#b42335";
  if (s === "push" || s.includes("tied")) return "#9a6a12";
  return "var(--gb-muted)";
}

function liveProjectionColor(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "var(--gb-muted)";
  if (n > 0) return "var(--gb-positive)";
  if (n < 0) return "#b42335";
  return "var(--gb-muted)";
}
