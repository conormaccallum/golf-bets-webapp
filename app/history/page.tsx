export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getPrisma } from "../../lib/prisma";
import { HeaderNav } from "../components/ui";
import ManualSettleButtons from "./ManualSettleButtons";

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

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function HistoryPage() {
  const prisma = getPrisma();

  const weeks = (await prisma.week.findMany({
    orderBy: { createdAt: "desc" },
    include: { bets: true },
  })) as any[];

  const overall = sum(
    weeks.flatMap((w) => (w.bets || []).map((b: any) => b?.returnUnits))
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1>History</h1>

        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
          <b>Overall W/L (units): {overall.toFixed(2)}</b>
        </div>

        <div style={{ height: 16 }} />

        {weeks.map((w: any, idx: number) => {
          const createdAt =
            typeof w.createdAt === "string"
              ? new Date(w.createdAt)
              : w.createdAt;

          const weekTotal = sum(
            (w.bets || []).map((b: any) => b?.returnUnits)
          );

          const stakeTotal = sum(
            (w.bets || []).map((b: any) => b?.stakeUnits)
          );

          const eventTitle =
            (w.eventName || "").trim() && w.eventYear
              ? `${w.eventName} ${w.eventYear}`
              : w.label || `Week ${dateKey(createdAt)}`;

          return (
            <section
              key={w.id}
              style={{
                border: "1px solid #333",
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
                  <span style={{ color: "#bbb" }}>
                    Bets: {w.bets?.length ?? 0}
                  </span>
                  <span style={{ color: "#bbb" }}>
                    Stake: {stakeTotal.toFixed(1)}
                  </span>
                  <span style={{ color: "#bbb" }}>
                    Week W/L: {weekTotal.toFixed(2)}
                  </span>
                </summary>

                <div style={{ height: 12 }} />

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
                          "Stake",
                          "Outcome",
                          "Returns",
                          "Settle",
                        ].map((hh) => (
                          <th
                            key={hh}
                            style={{
                              textAlign: "left",
                              padding: 10,
                              borderBottom: "1px solid #333",
                              background: "#111",
                              color: "white",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {hh}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {(w.bets || []).map((b: any, i: number) => (
                        <tr key={b.id} style={{ background: i % 2 === 0 ? "#000" : "#141414" }}>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {b.betType}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {b.playerName}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {b.marketBookBest ?? ""}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {b.marketOddsBestDec ?? ""}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {b.stakeUnits ?? ""}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {formatOutcome(b)}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {b.returnUnits ?? ""}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #222",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            <ManualSettleButtons
                              betId={b.id}
                              betType={b.betType}
                              resultWinFlag={b.resultWinFlag}
                              stakeUnits={b.stakeUnits}
                              oddsDec={b.marketOddsBestDec}
                              returnUnits={b.returnUnits}
                            />
                          </td>
                        </tr>
                      ))}
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
