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

  if (isFinal) {
    return (
      <button
        type="button"
        onClick={(e) => setFinal(false, e)}
        disabled={loading}
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          border: "1px solid #333",
          background: "#111",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 12,
        }}
      >
        Edit
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => setFinal(true, e)}
      disabled={loading}
      style={{
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid #333",
        background: "#111",
        color: "white",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: 12,
      }}
    >
      Save Week
    </button>
  );
}
