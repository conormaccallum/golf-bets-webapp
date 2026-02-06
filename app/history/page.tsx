export const dynamic = "force-dynamic";

import { prisma } from "../../lib/prisma";
import { HeaderNav } from "../components/ui";
import ManualSettleButtons from "./ManualSettleButtons";

function sum(nums: Array<number | null | undefined>) {
  return nums.reduce<number>((acc, n) => acc + (typeof n === "number" ? n : 0), 0);
}

function formatOutcome(b: {
  betType: string;
  resultWinFlag: number | null;
  stakeUnits: number | null;
  marketOddsBestDec: number | null;
  returnUnits: number | null;
}) {
  if (b.resultWinFlag === null) return "";

  if (b.resultWinFlag === 0) return "Loss";

  // Win: decide whether dead-heat reduction likely applied (Top 20 only)
  const bt = (b.betType ?? "").toLowerCase();
  const isTop20 = bt.includes("top 20") || bt.includes("top20");

  if (
    isTop20 &&
    b.stakeUnits !== null &&
    b.marketOddsBestDec !== null &&
    b.returnUnits !== null
  ) {
    const expectedProfit = b.stakeUnits * (b.marketOddsBestDec - 1);
    // If payout is materially lower than expected profit, label as dead-heat win
    if (b.returnUnits < expectedProfit - 1e-6) return "W - DHR";
  }

  return "Win";
}

export default async function HistoryPage() {
  const weeks = await prisma.week.findMany({
    orderBy: { createdAt: "desc" },
    include: { bets: true },
  });

  const overall = sum(weeks.flatMap((w) => w.bets.map((b) => b.returnUnits)));

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "sans-serif", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>History</h1>

        <div style={{ border: "1px solid #333", borderRadius: 16, padding: 16, background: "#000" }}>
          <p style={{ margin: 0, fontWeight: 800 }}>Overall W/L (units): {overall.toFixed(2)}</p>
        </div>

        <div style={{ height: 16 }} />

        {weeks.length === 0 ? (
          <div style={{ border: "1px solid #333", borderRadius: 16, padding: 16 }}>
            <p style={{ margin: 0 }}>No weeks committed yet.</p>
          </div>
        ) : (
          weeks.map((w) => {
            const weekTotal = sum(w.bets.map((b) => b.returnUnits));
            const stakeTotal = sum(w.bets.map((b) => b.stakeUnits));

            return (
              <section
                key={w.id}
                style={{
                  border: "1px solid #333",
                  borderRadius: 16,
                  padding: 16,
                  background: "#000",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0 }}>{w.label}</h2>
                <p style={{ margin: "6px 0", color: "#bbb" }}>
                  Bets: {w.bets.length} | Stake: {stakeTotal.toFixed(1)} | Week W/L: {weekTotal.toFixed(2)}
                </p>

                <div style={{ overflowX: "auto", border: "1px solid #333", borderRadius: 14 }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1050 }}>
                    <thead>
                      <tr>
                        {[
                          "Market",
                          "Player Name",
                          "Bookmaker",
                          "Odds",
                          "Stake (Units)",
                          "Outcome",
                          "Returns",
                          "Settle / Undo",
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
                      {w.bets.map((b, i) => (
                        <tr key={b.id} style={{ background: i % 2 === 0 ? "#000" : "#141414" }}>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{b.betType}</td>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{b.playerName}</td>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{b.marketBookBest ?? ""}</td>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{b.marketOddsBestDec ?? ""}</td>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{b.stakeUnits ?? ""}</td>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>
                            {formatOutcome(b)}
                          </td>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>
                            {b.returnUnits === null || b.returnUnits === undefined ? "" : Number(b.returnUnits).toFixed(2)}
                          </td>
                          <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>
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
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
