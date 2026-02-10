"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HeaderNav, Button, Card } from "./components/ui";

type SummaryRow = {
  market?: string;
  player_name?: string;
  dg_id?: string | number;
  market_odds_best_dec?: string | number;
  market_book_best?: string;
  edge_prob?: number;
  p_model?: number;
  opponents?: string;
};

type ValueSummaryResponse = {
  meta?: {
    eventId?: string;
    eventName?: string;
    eventYear?: number;
    refreshLockDay?: string;
  };
  lastUpdated?: string | null;
  summary?: {
    top?: SummaryRow[];
    top20?: SummaryRow[];
  };
  betslipKeys?: string[];
};

const MIN_EDGE = 0.04;

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function formatPct(v: unknown): string {
  const n = toNumber(v);
  if (n === null) return "-";
  return `${(n * 100).toFixed(1)}%`;
}

function formatOdds(v: unknown): string {
  const n = toNumber(v);
  if (n === null) return "-";
  return n.toFixed(2);
}

function formatEdge(v: unknown): string {
  const n = toNumber(v);
  if (n === null) return "-";
  return `${(n * 100).toFixed(1)}%`;
}

function makeUniqueKey(input: {
  eventId: string;
  market: string;
  dgId: string | null;
  playerName: string;
  opponents?: string | null;
}) {
  return [
    input.eventId,
    input.market,
    input.dgId || "",
    input.playerName,
    input.opponents || "",
  ].join("|");
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [runningModel, setRunningModel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValueSummaryResponse | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [runStep, setRunStep] = useState<1 | 2 | 3 | 4 | null>(null);
  const [runProgress, setRunProgress] = useState<number>(0);
  const [addingId, setAddingId] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<NodeJS.Timeout | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/value-summary?t=${Date.now()}`, { cache: "no-store" });
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        throw new Error(`Non-JSON response from /api/value-summary (HTTP ${res.status}).`);
      }
      const json = JSON.parse(text) as ValueSummaryResponse;
      if (!res.ok) throw new Error((json as any)?.error || "Failed to load summary");
      setData(json);
      setLastUpdatedAt(new Date().toISOString());
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function runModel() {
    setRunningModel(true);
    setError(null);
    setRunStep(1);
    setRunProgress(10);
    setRunStatus("Step 1/4: Dispatching model run...");
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (statusRef.current) {
      clearInterval(statusRef.current);
      statusRef.current = null;
    }
    try {
      const prevUpdated = data?.lastUpdated ?? null;
      const res = await fetch("/api/run-model", { method: "POST" });
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        throw new Error(`Non-JSON response from /api/run-model (HTTP ${res.status}).`);
      }
      const json = JSON.parse(text);
      if (!res.ok) throw new Error(json?.error || "Failed to run model");
      setRunStep(2);
      setRunProgress(30);
      setRunStatus("Step 2/4: Model run started (GitHub Actions)...");

      const startedAt = Date.now();
      statusRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/run-model?t=${Date.now()}`, { cache: "no-store" });
          const t = await r.text();
          if (t.trim().startsWith("<")) return;
          const j = JSON.parse(t);
          if (!r.ok) return;
          const run = j?.run;
          if (run?.status === "in_progress" || run?.status === "queued") {
            setRunStep(2);
            setRunProgress(40);
            setRunStatus(`Step 2/4: GitHub Actions ${run.status.replace("_", " ")}...`);
            return;
          }
          if (run?.status === "completed") {
            if (statusRef.current) {
              clearInterval(statusRef.current);
              statusRef.current = null;
            }
            if (run?.conclusion !== "success") {
              setRunProgress(0);
              setRunStatus(`Run finished with status: ${run.conclusion || "unknown"}`);
              return;
            }
            setRunStep(3);
            setRunProgress(70);
            setRunStatus("Step 3/4: Run complete. Waiting for outputs to update...");

            pollRef.current = setInterval(async () => {
              try {
                const r2 = await fetch(`/api/value-summary?t=${Date.now()}`, { cache: "no-store" });
                const t2 = await r2.text();
                if (t2.trim().startsWith("<")) return;
                const j2 = JSON.parse(t2) as ValueSummaryResponse;
                if (!r2.ok) return;
                const updated = j2.lastUpdated ?? null;
                if (updated && updated !== prevUpdated) {
                  setData(j2);
                  setLastUpdatedAt(new Date().toISOString());
                  setRunStep(4);
                  setRunProgress(100);
                  setRunStatus(`Step 4/4: Outputs updated at ${updated}.`);
                  if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                  }
                  return;
                }
                if (Date.now() - startedAt > 12 * 60 * 1000) {
                  setRunProgress(95);
                  setRunStatus("Still running after 12 minutes. Try refresh later.");
                  if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                  }
                }
              } catch {
                // ignore polling errors
              }
            }, 15000);
          }
        } catch {
          // ignore
        }
      }, 10000);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setRunProgress(0);
      setRunStatus("Error");
    } finally {
      setRunningModel(false);
    }
  }

  const rows = useMemo(() => {
    return data?.summary?.top ?? data?.summary?.top20 ?? [];
  }, [data]);

  const betslipKeySet = useMemo(() => {
    return new Set(data?.betslipKeys ?? []);
  }, [data]);

  async function addToBetslip(row: SummaryRow) {
    const id = String(row.dg_id ?? row.player_name ?? "");
    const dgIdStr = row.dg_id !== undefined && row.dg_id !== null && row.dg_id !== ""
      ? String(row.dg_id)
      : null;
    const uniqueKey = makeUniqueKey({
      eventId: data?.meta?.eventId ?? "",
      market: row.market ?? "",
      dgId: dgIdStr,
      playerName: row.player_name ?? "",
      opponents: row.opponents ?? "",
    });
    if (betslipKeySet.has(uniqueKey)) {
      setError("That bet is already in the betslip.");
      return;
    }
    setAddingId(id);
    setError(null);
    try {
      const payload = {
        market: row.market ?? "",
        playerName: row.player_name ?? "",
        dgId: toNumber(row.dg_id) ?? undefined,
        opponents: row.opponents ?? "",
        marketOddsBestDec: toNumber(row.market_odds_best_dec) ?? undefined,
        marketBookBest: row.market_book_best ?? "",
        pModel: toNumber(row.p_model) ?? undefined,
      };
      const res = await fetch("/api/betslip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        throw new Error(`Non-JSON response from /api/betslip (HTTP ${res.status}).`);
      }
      const json = JSON.parse(text);
      if (!res.ok) throw new Error(json?.error || "Failed to add bet");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setAddingId(null);
    }
  }

  const meta = data?.meta;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0 }}>Value Summary</h1>
          <Button onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={runModel} disabled={runningModel}>
            {runningModel ? "Starting..." : "Run Model"}
          </Button>
          <span style={{ marginLeft: "auto", color: "#bbb" }}>
            {meta?.eventName ? `${meta.eventName} ${meta.eventYear ?? ""}` : "No event meta"}
          </span>
        </div>

        <div style={{ marginTop: 8, color: "#bbb", fontSize: 13 }}>
          Last fetched: {lastUpdatedAt ?? "Not yet"}
        </div>
        <div style={{ marginTop: 4, color: "#bbb", fontSize: 13 }}>
          Model outputs updated: {data?.lastUpdated ?? "Unknown"}
          {runStatus ? ` • ${runStatus}` : ""}
        </div>
        <div style={{ marginTop: 4, color: "#8a8a8a", fontSize: 12 }}>
          Note: model outputs can take up to ~5 minutes to fully update after a run.
        </div>
        {runStatus && (
          <div style={{ marginTop: 8 }}>
            <div style={{ color: "#bbb", fontSize: 12, marginBottom: 6 }}>
              Progress: {runProgress}%
            </div>
            <div
              style={{
                height: 8,
                background: "#1a1a1a",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${runProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #2dd4bf, #22d3ee)",
                  transition: "width 300ms ease",
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <pre style={{ color: "#ff4d4d", whiteSpace: "pre-wrap", marginTop: 12 }}>
            {error}
          </pre>
        )}

        <div style={{ height: 16 }} />

        <Card>
          {!rows.length ? (
            <p style={{ margin: 0, color: "#bbb" }}>No summary rows available.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    {["Market", "Player", "Book", "Odds", "Model", "Edge", ""].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "8px 10px",
                            borderBottom: "1px solid #222",
                            color: "#bbb",
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const edge = toNumber(r.edge_prob) ?? 0;
                    const isValue = edge >= MIN_EDGE;
                    const rowId = String(r.dg_id ?? r.player_name ?? i);
                    const rowKey = makeUniqueKey({
                      eventId: meta?.eventId ?? "",
                      market: r.market ?? "",
                      dgId:
                        r.dg_id !== undefined && r.dg_id !== null && r.dg_id !== ""
                          ? String(r.dg_id)
                          : null,
                      playerName: r.player_name ?? "",
                      opponents: r.opponents ?? "",
                    });
                    const alreadyAdded = betslipKeySet.has(rowKey);
                    return (
                      <tr
                        key={`${rowId}-${i}`}
                        style={{
                          background: isValue ? "rgba(0, 200, 120, 0.12)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid #111" }}>
                          {r.market ?? "-"}
                        </td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid #111" }}>
                          {r.player_name ?? "-"}
                        </td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid #111" }}>
                          {r.market_book_best ?? "-"}
                        </td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid #111" }}>
                          {formatOdds(r.market_odds_best_dec)}
                        </td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid #111" }}>
                          {formatPct(r.p_model)}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #111",
                            color: isValue ? "#8bffb6" : "#bbb",
                            fontWeight: isValue ? 700 : 400,
                          }}
                        >
                          {formatEdge(r.edge_prob)}
                        </td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid #111" }}>
                          <Button
                            onClick={() => addToBetslip(r)}
                            disabled={addingId === rowId || alreadyAdded}
                          >
                            {addingId === rowId
                              ? "Adding..."
                              : alreadyAdded
                                ? "Added"
                                : "Add to Betslip"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
