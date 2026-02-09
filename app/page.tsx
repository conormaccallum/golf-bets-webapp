"use client";

import { useEffect, useMemo, useState } from "react";
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
  summary?: {
    top?: SummaryRow[];
    top20?: SummaryRow[];
  };
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

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValueSummaryResponse | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/value-summary", { cache: "no-store" });
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

  const rows = useMemo(() => {
    return data?.summary?.top ?? data?.summary?.top20 ?? [];
  }, [data]);

  async function addToBetslip(row: SummaryRow) {
    const id = String(row.dg_id ?? row.player_name ?? "");
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
          <span style={{ marginLeft: "auto", color: "#bbb" }}>
            {meta?.eventName ? `${meta.eventName} ${meta.eventYear ?? ""}` : "No event meta"}
          </span>
        </div>

        <div style={{ marginTop: 8, color: "#bbb", fontSize: 13 }}>
          Last updated: {lastUpdatedAt ?? "Not yet"}
        </div>

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
                    {["Market", "Player", "Opponents", "Book", "Odds", "Model", "Edge", ""].map(
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
                          {r.opponents ?? "-"}
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
                            disabled={addingId === rowId}
                          >
                            {addingId === rowId ? "Adding..." : "Add to Betslip"}
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
