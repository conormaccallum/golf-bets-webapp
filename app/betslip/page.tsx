"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, HeaderNav } from "../components/ui";

const MIN_EDGE = 0.04;

type BetslipItem = {
  id: string;
  eventId: string;
  eventName: string | null;
  eventYear: number | null;
  market: string;
  playerName: string;
  dgId: string | null;
  opponents: string | null;
  marketBookBest: string | null;
  marketOddsBestDec: number | null;
  oddsEnteredDec: number | null;
  pModel: number | null;
  edgeProb: number | null;
  evPerUnit: number | null;
  kellyFull: number | null;
  kellyFrac: number | null;
  stakeUnits: number | null;
  status: "PENDING" | "PLACED";
  createdAt?: string;
  updatedAt?: string;
};

type EventMeta = {
  eventId: string;
  eventName: string;
  eventYear: number;
  refreshLockDay?: string;
};

function fmt(n: number | null | undefined, dp = 2) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "";
  return n.toFixed(dp);
}

function edgeLabel(edge: number | null) {
  if (edge === null || !Number.isFinite(edge)) return "";
  return `${(edge * 100).toFixed(1)}%`;
}

export default function BetslipPage() {
  const [eventMeta, setEventMeta] = useState<EventMeta | null>(null);
  const [items, setItems] = useState<BetslipItem[]>([]);
  const [edits, setEdits] = useState<Record<string, { oddsDec: string; book: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/betslip", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load betslip");
      setEventMeta(json.eventMeta || null);
      setItems(json.items || []);
      setEdits((prev) => {
        const next: Record<string, { oddsDec: string; book: string }> = { ...prev };
        for (const it of json.items || []) {
          const oddsValue =
            it.oddsEnteredDec !== null && it.oddsEnteredDec !== undefined
              ? it.oddsEnteredDec
              : it.marketOddsBestDec;
          next[it.id] = {
            oddsDec: oddsValue !== null && oddsValue !== undefined ? String(oddsValue) : "",
            book: it.marketBookBest ?? "",
          };
        }
        return next;
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load betslip");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveOdds(id: string) {
    const raw = edits[id]?.oddsDec ?? "";
    const odds = Number(raw);
    if (!raw) return;
    if (!Number.isFinite(odds) || odds <= 1) {
      setError("Odds must be a number greater than 1");
      return;
    }
    setError(null);
    const res = await fetch(`/api/betslip/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oddsEnteredDec: odds }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Failed to update odds");
      return;
    }
    await load();
  }

  async function saveBook(id: string) {
    const book = (edits[id]?.book ?? "").trim();
    setError(null);
    const res = await fetch(`/api/betslip/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketBookBest: book }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Failed to update book");
      return;
    }
    await load();
  }

  async function setStatus(id: string, status: "PENDING" | "PLACED") {
    setError(null);
    const res = await fetch(`/api/betslip/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Failed to update status");
      return;
    }
    await load();
  }

  async function removeItem(id: string) {
    setError(null);
    const res = await fetch(`/api/betslip/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Failed to remove bet");
      return;
    }
    await load();
  }

  async function archivePlaced() {
    setArchiving(true);
    setError(null);
    try {
      const res = await fetch("/api/archive-placed", {
        method: "POST",
        headers: { "x-archive-manual": "true" },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to commit placed bets");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to commit placed bets");
    } finally {
      setArchiving(false);
    }
  }

  const pending = useMemo(
    () => items.filter((i) => i.status === "PENDING"),
    [items]
  );
  const placed = useMemo(
    () => items.filter((i) => i.status === "PLACED"),
    [items]
  );

  const pendingStakeTotal = useMemo(() => {
    return pending.reduce((acc, i) => acc + (Number(i.stakeUnits) || 0), 0);
  }, [pending]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0 }}>Betslip</h1>
          <Button onClick={load} disabled={loading}>
            Refresh
          </Button>
          <button
            onClick={archivePlaced}
            disabled={archiving}
            style={{
              border: "1px solid #4b2a00",
              background: "#2b1a06",
              color: "#ffd7a3",
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {archiving ? "Committing..." : "Commit Placed Bets"}
          </button>
        </div>

        <div style={{ height: 8 }} />

        {eventMeta ? (
          <div style={{ color: "#bbb" }}>
            {eventMeta.eventName} {eventMeta.eventYear}
          </div>
        ) : null}

        <div style={{ height: 6 }} />
        <div style={{ color: "#c9a97a", fontSize: 12 }}>
          Only commit when all bets are placed. Committing does not clear the betslip.
        </div>

        <div style={{ height: 12 }} />

        {error ? (
          <div style={{ color: "#ff8b8b", border: "1px solid #5a1f1f", padding: 10 }}>
            {error}
          </div>
        ) : null}

        <div style={{ height: 12 }} />

        {loading ? <div>Loading...</div> : null}

        {!loading && pending.length === 0 && placed.length === 0 ? (
          <div style={{ color: "#bbb" }}>No bets added yet.</div>
        ) : null}

        {pending.length > 0 ? (
          <section style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={{ margin: 0 }}>Pending</h2>
              <span style={{ color: "#bbb" }}>Stake total: {pendingStakeTotal.toFixed(1)}</span>
            </div>

            <div style={{ height: 8 }} />

            <div
              style={{
                overflowX: "auto",
                border: "1px solid #333",
                borderRadius: 14,
                background: "#000",
              }}
            >
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1100 }}>
                <thead>
                  <tr>
                    {[
                      "Market",
                      "Player",
                      "Model Odds",
                      "Book",
                      "Odds",
                      "Edge",
                      "Stake",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: 10,
                          borderBottom: "1px solid #333",
                          background: "#111",
                          color: "white",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map((it, idx) => {
                    const edgeLow = it.edgeProb !== null && it.edgeProb < MIN_EDGE;
                    const rowBg = edgeLow ? "#2b1414" : idx % 2 === 0 ? "#000" : "#141414";
                    return (
                      <tr key={it.id} style={{ background: rowBg }}>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          {it.market}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          {it.playerName}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          {it.marketBookBest
                            ? `${it.marketBookBest} ${fmt(it.marketOddsBestDec, 2)}`
                            : fmt(it.marketOddsBestDec, 2)}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          <input
                            value={edits[it.id]?.book ?? ""}
                            onChange={(e) =>
                              setEdits((prev) => ({
                                ...prev,
                                [it.id]: { ...prev[it.id], book: e.target.value },
                              }))
                            }
                            onBlur={() => saveBook(it.id)}
                            style={{
                              background: "#111",
                              color: "white",
                              border: "1px solid #333",
                              borderRadius: 8,
                              padding: "6px 8px",
                              width: 120,
                            }}
                          />
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          <input
                            type="number"
                            step="0.01"
                            value={edits[it.id]?.oddsDec ?? ""}
                            onChange={(e) =>
                              setEdits((prev) => ({
                                ...prev,
                                [it.id]: { ...prev[it.id], oddsDec: e.target.value },
                              }))
                            }
                            onBlur={() => saveOdds(it.id)}
                            style={{
                              background: "#111",
                              color: "white",
                              border: "1px solid #333",
                              borderRadius: 8,
                              padding: "6px 8px",
                              width: 90,
                            }}
                          />
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          <div style={{ fontWeight: 700 }}>{edgeLabel(it.edgeProb)}</div>
                          {edgeLow ? (
                            <div style={{ color: "#ffb3b3", fontSize: 12 }}>Below 4%</div>
                          ) : null}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          {fmt(it.stakeUnits, 1)}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => setStatus(it.id, "PLACED")}
                              style={{
                                border: "1px solid #2f5",
                                background: "#0f2f1a",
                                color: "#caffd8",
                                padding: "6px 8px",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                            >
                              Mark Placed
                            </button>
                            <button
                              onClick={() => removeItem(it.id)}
                              style={{
                                border: "1px solid #733",
                                background: "#2b1414",
                                color: "#ffb3b3",
                                padding: "6px 8px",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {placed.length > 0 ? (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ margin: 0 }}>Placed</h2>
            <div style={{ height: 8 }} />
            <div
              style={{
                overflowX: "auto",
                border: "1px solid #333",
                borderRadius: 14,
                background: "#000",
              }}
            >
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
                <thead>
                  <tr>
                    {[
                      "Market",
                      "Player",
                      "Book",
                      "Odds",
                      "Edge",
                      "Stake",
                      "Placed At",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: 10,
                          borderBottom: "1px solid #333",
                          background: "#111",
                          color: "white",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {placed.map((it, idx) => (
                    <tr key={it.id} style={{ background: idx % 2 === 0 ? "#000" : "#141414" }}>
                      <td style={{ padding: 10, borderBottom: "1px solid #222" }}>{it.market}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222" }}>{it.playerName}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                        {it.marketBookBest ?? ""}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                        {fmt(it.oddsEnteredDec ?? it.marketOddsBestDec, 2)}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222" }}>{edgeLabel(it.edgeProb)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222" }}>{fmt(it.stakeUnits, 1)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222", color: "#bbb" }}>
                        {it.updatedAt ?? ""}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #222" }}>
                        <button
                          onClick={() => setStatus(it.id, "PENDING")}
                          style={{
                            border: "1px solid #333",
                            background: "#111",
                            color: "white",
                            padding: "6px 8px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          Move Back
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
