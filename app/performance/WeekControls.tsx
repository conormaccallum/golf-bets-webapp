"use client";

import { useState } from "react";

export default function WeekControls(props: { weekId: number; isFinal: boolean }) {
  const { weekId, isFinal } = props;
  const [loading, setLoading] = useState(false);

  async function setFinal(nextFinal: boolean, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await fetch("/api/week-finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekId, isFinal: nextFinal }),
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  async function autoSettle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/performance/auto-settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json?.error || "Auto-settle failed");
      alert(json.message || "Auto-settle complete");
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Auto-settle failed");
      setLoading(false);
    }
  }

  const buttonStyle = {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid var(--gb-border)",
    background: "var(--gb-surface)",
    color: "var(--gb-text)",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: 12,
  };

  return (
    <span style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <button type="button" onClick={autoSettle} disabled={loading} style={buttonStyle}>
        Auto-settle
      </button>
      <button
        type="button"
        onClick={(e) => setFinal(!isFinal, e)}
        disabled={loading}
        style={buttonStyle}
      >
        {isFinal ? "Edit" : "Save Week"}
      </button>
    </span>
  );
}
