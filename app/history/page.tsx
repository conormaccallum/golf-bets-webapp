export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  const bt = (b.betType ?? "").toLowerCase();
  const isTop20 = bt.includes("top 20") || bt.includes("top20");

  if (
    isTop20 &&
    b.stakeUnits !== null &&
    b.marketOddsBestDec !== null &&
    b.returnUnits !== null
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
  const weeks = await prisma.week.findMany({
    orderBy: { createdAt: "desc" },
    include: { bets: true },
  }) as any[];
  const overall = sum(
    weeks.flatMap((w: any) =>
      (w.bets || []).map((b: any) => b?.returnUnits)
    )
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "sans-serif", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1>History</h1>

        <div style={{ border: "1px solid #333", borderRadius: 16, padding: 16 }}>
          <b>Overall W/L (units): {overall.toFixed(2)}</b>
        </div>

        <div style={{ height: 16 }} />

        {weeks.map((w) => {
          const createdAt = typeof w.createdAt === "string" ? new Date(w.createdAt) : w.createdAt;

          const weekTotal = sum(w.bets.map((b) => b.returnUnits));
          const stakeTotal = sum(w.bets.map((b) => b.stakeUnits));

          return (
            <section key={w.id} style={{ border: "1px solid #333", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <h2>Week {dateKey(createdAt)}</h2>

              <p>
                Bets: {w.bets.length} | Stake: {stakeTotal.toFixed(1)} | Week W/L: {weekTotal.toFixed(2)}
              </p>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Player</th>
                    <th>Book</th>
                    <th>Odds</th>
                    <th>Stake</th>
                    <th>Outcome</th>
                    <th>Returns</th>
                    <th>Settle</th>
                  </tr>
                </thead>

                <tbody>
                  {w.bets.map((b) => (
                    <tr key={b.id}>
                      <td>{b.betType}</td>
                      <td>{b.playerName}</td>
                      <td>{b.marketBookBest ?? ""}</td>
                      <td>{b.marketOddsBestDec ?? ""}</td>
                      <td>{b.stakeUnits ?? ""}</td>
                      <td>{formatOutcome(b)}</td>
                      <td>{b.returnUnits ?? ""}</td>
                      <td>
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
            </section>
          );
        })}
      </main>
    </div>
  );
}
