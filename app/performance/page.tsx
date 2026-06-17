export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getPrisma } from "../../lib/prisma";
import { HeaderNav } from "../components/ui";
import ManualSettleButtons from "./ManualSettleButtons";
import WeekControls from "./WeekControls";

function sum(nums: any[]) {
  return nums.reduce((acc, n) => acc + (typeof n === "number" ? n : 0), 0);
}

function formatOutcome(b: any) {
  if (b.resultWinFlag === null) return "";
  if (b.resultWinFlag === 0) return "Loss";

  const bt = (b.betType ?? "").toLowerCase();
  const isTop20 = bt.includes("top 20") || bt.includes("top20");

  if (
    isTop20 &&
    b.stakeUnits != null &&
    b.marketOddsBestDec != null &&
    b.returnUnits != null
  ) {
    const expectedProfit = b.stakeUnits * (b.marketOddsBestDec - 1);
    if (b.returnUnits < expectedProfit - 1e-6) return "W - DHR";
  }

  return "Win";
}

function fmt(n: any, dp = 2) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  return v.toFixed(dp);
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function PerformancePage() {
  const prisma = getPrisma();

  const weeks = (await prisma.week.findMany({
    orderBy: { createdAt: "desc" },
    include: { bets: true },
  })) as any[];

  const overall = sum(
    weeks.flatMap((w) => (w.bets || []).map((b: any) => b?.returnUnits))
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--gb-bg)", color: "var(--gb-text)" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: 28 }}>
          Performance
        </h1>

        <div style={{ border: "1px solid var(--gb-border)", borderRadius: 12, padding: 12 }}>
          <b>Overall W/L (units): {overall.toFixed(2)}</b>
        </div>

        <div style={{ height: 16 }} />

        {weeks.map((w: any, idx: number) => {
          const createdAt =
            typeof w.createdAt === "string" ? new Date(w.createdAt) : w.createdAt;

          const weekTotal = sum((w.bets || []).map((b: any) => b?.returnUnits));

          const stakeTotal = sum((w.bets || []).map((b: any) => b?.stakeUnits));

          const eventTitle =
            (w.eventName || "").trim() && w.eventYear
              ? `${w.eventName} ${w.eventYear}`
              : w.label || `Week ${dateKey(createdAt)}`;

          const sortedBets = [...(w.bets || [])].sort((a: any, b: any) => {
            const sa = Number(a?.stakeUnits ?? 0);
            const sb = Number(b?.stakeUnits ?? 0);
            return sb - sa;
          });

          return (
            <section
              key={w.id}
              style={{
                border: "1px solid var(--gb-border)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <details open={idx === 0}>
                <summary
                  style={{
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    alignItems: "center",
                    fontWeight: 700,
                  }}
                >
                  <span>{eventTitle}</span>
                  <span style={{ color: "var(--gb-muted)" }}>Bets: {w.bets?.length ?? 0}</span>
                  <span style={{ color: "var(--gb-muted)" }}>Stake: {stakeTotal.toFixed(1)}</span>
                  <span style={{ color: "var(--gb-muted)" }}>Week W/L: {weekTotal.toFixed(2)}</span>
                  <span style={{ marginLeft: "auto" }}>
                    <WeekControls weekId={w.id} isFinal={Boolean(w.isFinal)} />
                  </span>
                </summary>

                <div style={{ height: 12 }} />

                <div
                  style={{
                    overflowX: "auto",
                    border: "1px solid rgba(255,250,243,0.18)",
                    borderRadius: 14,
                    background: "#3a1019",
                  }}
                >
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1000 }}>
                    <thead>
                      <tr>
                        {["Market", "Tour", "Player", "Opponents", "Book", "Odds", "Stake", "Outcome", "Returns", "Settle"].map(
                          (hh) => (
                            <th
                              key={hh}
                              style={{
                                textAlign: "left",
                                padding: 10,
                                borderBottom: "1px solid rgba(255,250,243,0.22)",
                                background: "#551827",
                                color: "#fffaf3",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {hh}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {sortedBets.map((b: any, i: number) => {
                        let rowBg = i % 2 === 0 ? "#3a1019" : "#46131f";
                        if (b.resultWinFlag === 1) rowBg = "#198754";
                        if (b.resultWinFlag === 0) rowBg = "#c63d45";
                        const cellStyle = {
                          padding: 10,
                          borderBottom: "1px solid rgba(255,250,243,0.16)",
                          whiteSpace: "nowrap" as const,
                          color: "#fffaf3",
                        };

                        return (
                          <tr key={b.id} style={{ background: rowBg }}>
                            <td style={cellStyle}>
                              {b.betType}
                            </td>
                            <td style={cellStyle}>
                              {(b.tour || w.tour || "").toUpperCase() || "PGA"}
                            </td>
                            <td style={cellStyle}>
                              {b.playerName}
                            </td>
                            <td style={cellStyle}>
                              {b.opponents ?? ""}
                            </td>
                            <td style={cellStyle}>
                              {b.marketBookBest ?? ""}
                            </td>
                            <td style={cellStyle}>
                              {fmt(b.marketOddsBestDec, 2)}
                            </td>
                            <td style={cellStyle}>
                              {fmt(b.stakeUnits, 2)}
                            </td>
                            <td style={cellStyle}>
                              {formatOutcome(b)}
                            </td>
                            <td style={cellStyle}>
                              {fmt(b.returnUnits, 2)}
                            </td>
                            <td style={cellStyle}>
                              <ManualSettleButtons
                                betId={b.id}
                                betType={b.betType}
                                resultWinFlag={b.resultWinFlag}
                                stakeUnits={b.stakeUnits}
                                oddsDec={b.marketOddsBestDec}
                                returnUnits={b.returnUnits}
                                isFinal={Boolean(w.isFinal)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>
          );
        })}
      </main>
    </div>
  );
}
