"use client";

import { FormEvent, useState } from "react";
import { Button, Card } from "../components/ui";

type WeekOption = {
  id: number;
  label: string;
  eventName: string;
  eventYear: number;
  tour: string;
};

const MARKET_SUGGESTIONS = ["Top 10", "Top 20", "Make Cut", "Miss Cut", "Matchup 2-Ball", "Matchup 3-Ball"];

export default function ManualBetForm({ weeks }: { weeks: WeekOption[] }) {
  const [weekId, setWeekId] = useState(weeks[0]?.id ? String(weeks[0].id) : "");
  const [market, setMarket] = useState("Top 20");
  const [playerName, setPlayerName] = useState("");
  const [dgId, setDgId] = useState("");
  const [opponents, setOpponents] = useState("");
  const [book, setBook] = useState("");
  const [oddsDec, setOddsDec] = useState("");
  const [stakeUnits, setStakeUnits] = useState("");
  const [pModel, setPModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/performance/manual-bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekId, market, playerName, dgId, opponents, book, oddsDec, stakeUnits, pModel }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to add bet");
      setMessage("Bet added to Performance.");
      setPlayerName("");
      setDgId("");
      setOpponents("");
      setBook("");
      setOddsDec("");
      setStakeUnits("");
      setPModel("");
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Failed to add bet");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 11px",
    borderRadius: 10,
    border: "1px solid var(--gb-border)",
    background: "var(--gb-bg)",
    color: "var(--gb-text)",
    font: "inherit",
    boxSizing: "border-box" as const,
  };

  const labelStyle = { display: "grid", gap: 6, color: "var(--gb-muted)", fontSize: 13, fontWeight: 700 };

  if (weeks.length === 0) return null;

  return (
    <details style={{ border: "1px solid var(--gb-border-soft)", borderRadius: 14, background: "var(--gb-surface)", boxShadow: "0 8px 18px rgba(43,17,23,0.05)" }}>
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          padding: "11px 14px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          color: "var(--gb-text)",
          fontWeight: 800,
        }}
      >
        <span>Add off-model bet</span>
        <span style={{ color: "var(--gb-muted)", fontSize: 13, fontWeight: 600 }}>Optional manual entry</span>
      </summary>

      <div style={{ borderTop: "1px solid var(--gb-border-soft)", padding: 14 }}>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0, color: "var(--gb-muted)", fontSize: 14 }}>
            For anything you actually placed that does not fit the standard model criteria. Market can be anything, e.g. Top 30, FRL, nationality, matchup, outright saver.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
            <label style={labelStyle}>
              Event
              <select value={weekId} onChange={(e) => setWeekId(e.target.value)} style={inputStyle}>
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {(w.tour || "pga").toUpperCase()} - {w.eventName || w.label} {w.eventYear || ""}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Market
              <input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                list="manual-bet-market-suggestions"
                placeholder="e.g. Top 30 / FRL / Saver"
                style={inputStyle}
              />
              <datalist id="manual-bet-market-suggestions">
                {MARKET_SUGGESTIONS.map((m) => <option key={m} value={m} />)}
              </datalist>
            </label>

            <label style={labelStyle}>
              Player / selection
              <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="e.g. Tommy Fleetwood" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Book
              <input value={book} onChange={(e) => setBook(e.target.value)} placeholder="e.g. bet365" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Odds
              <input value={oddsDec} onChange={(e) => setOddsDec(e.target.value)} inputMode="decimal" placeholder="e.g. 3.75" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Stake
              <input value={stakeUnits} onChange={(e) => setStakeUnits(e.target.value)} inputMode="decimal" placeholder="e.g. 10" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Model % optional
              <input value={pModel} onChange={(e) => setPModel(e.target.value)} inputMode="decimal" placeholder="e.g. 28 or 0.28" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              DataGolf ID optional
              <input value={dgId} onChange={(e) => setDgId(e.target.value)} inputMode="numeric" placeholder="Player ID" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Opponents / notes optional
              <input value={opponents} onChange={(e) => setOpponents(e.target.value)} placeholder="For matchups or notes" style={inputStyle} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Button disabled={loading}>{loading ? "Adding..." : "Add to Performance"}</Button>
            {message && <span style={{ color: "var(--gb-positive)", fontWeight: 700 }}>{message}</span>}
            {error && <span style={{ color: "var(--gb-danger)", fontWeight: 700 }}>{error}</span>}
          </div>
        </form>
      </div>
    </details>
  );
}
