

"use client";

import { useState } from "react";

function isTop20(betType: string) {
  const t = betType.toLowerCase();
  return t.includes("top 20") || t.includes("top20");
}

function approxEqual(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

function outcomeLabel(params: {
  betType: string;
  resultWinFlag: number | null | undefined;
  stakeUnits: number | null | undefined;
  oddsDec: number | null | undefined;
  returnUnits: number | null | undefined;
}): string {
  const { betType, resultWinFlag, stakeUnits, oddsDec, returnUnits } = params;

  if (resultWinFlag === null || resultWinFlag === undefined) return "";

  if (resultWinFlag === 0) return "Loss";

  // Win:
  // If it's Top20, infer DHR by comparing returnUnits vs full profit.
  if (isTop20(betType)) {
    const stake = Number(stakeUnits);
    const odds = Number(oddsDec);

    if (
      Number.isFinite(stake) &&
      Number.isFinite(odds) &&
      returnUnits !== null &&
      returnUnits !== undefined &&
      Number.isFinite(Number(returnUnits))
    ) {
      const fullProfit = stake * (odds - 1);
      const ret = Number(returnUnits);

      // If return differs from full profit and is lower => DHR
      if (!approxEqual(ret, fullProfit) && ret < fullProfit) {
        return "W - DHR";
      }
    }
  }

  return "Win";
}

export default function ManualSettleButtons(props: {
  betId: number;
  betType: string;
  resultWinFlag: number | null | undefined;
  stakeUnits: number | null | undefined;
  oddsDec: number | null | undefined;
  returnUnits: number | null | undefined;
}) {
  const { betId, betType, resultWinFlag, stakeUnits, oddsDec, returnUnits } = props;
  const [loading, setLoading] = useState(false);

  const settled = !(resultWinFlag === null || resultWinFlag === undefined);

  async function settleWin() {
    let deadHeatFrac: number | null = null;

    if (isTop20(betType)) {
      const input = prompt('Dead heat fraction (example: 3/6). Leave blank for full win:');
      if (input && input.includes("/")) {
        const [a, b] = input.split("/");
        const num = Number(a);
        const den = Number(b);
        if (num > 0 && den > 0) deadHeatFrac = num / den;
      }
    }

    setLoading(true);

    await fetch("/api/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ betId, isWin: true, deadHeatFrac }),
    });

    window.location.reload();
  }

  async function settleLoss() {
    setLoading(true);

    await fetch("/api/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ betId, isWin: false, deadHeatFrac: null }),
    });

    window.location.reload();
  }

  async function undo() {
    setLoading(true);

    await fetch("/api/unsettle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ betId }),
    });

    window.location.reload();
  }

  if (!settled) {
    return (
      <span style={{ whiteSpace: "nowrap" }}>
        <button
          onClick={settleWin}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: loading ? "#666" : "#9fd",
            textDecoration: "underline",
            cursor: loading ? "not-allowed" : "pointer",
            padding: 0,
            margin: 0,
            fontWeight: 700,
          }}
        >
          Win
        </button>

        <span style={{ color: "#666", margin: "0 8px" }}>|</span>

        <button
          onClick={settleLoss}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: loading ? "#666" : "#f99",
            textDecoration: "underline",
            cursor: loading ? "not-allowed" : "pointer",
            padding: 0,
            margin: 0,
            fontWeight: 700,
          }}
        >
          Loss
        </button>
      </span>
    );
  }

  const label = outcomeLabel({ betType, resultWinFlag, stakeUnits, oddsDec, returnUnits });

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <button disabled={loading} onClick={undo}>Undo</button>
    </div>
  );
}

