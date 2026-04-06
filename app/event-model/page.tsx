export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { getPrisma } from "../../lib/prisma";
import { HeaderNav } from "../components/ui";

function fmtPct(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return "-";
  return `${(v * 100).toFixed(1)}%`;
}

function fmtOdds(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v) || v <= 0) return "-";
  return (1 / v).toFixed(2);
}

function fmtNum(v: number | null | undefined, dp = 3) {
  if (v == null || !Number.isFinite(v)) return "-";
  return v.toFixed(dp);
}

export default async function EventModelPage({
  searchParams,
}: {
  searchParams?: Promise<{ tour?: string }>;
}) {
  const prisma = getPrisma();
  const params = (await searchParams) || {};
  const tour = (params.tour || "pga").toLowerCase() === "dp" ? "dp" : "pga";

  const latestEvent = await prisma.eventSnapshot.findFirst({
    where: { tour },
    orderBy: { capturedAt: "desc" },
  });

  const rows = latestEvent
    ? await prisma.preEventPlayerSnapshot.findMany({
        where: {
          tour,
          eventId: latestEvent.eventId,
          eventYear: latestEvent.eventYear,
          capturedAt: latestEvent.capturedAt,
        },
        orderBy: [{ top20ProbAnchoredDh: "desc" as any }, { customPred: "desc" }],
      })
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 28 }}>Event Model</h1>
            <div style={{ color: "#bbb", marginTop: 6 }}>
              {latestEvent
                ? `${latestEvent.eventName} ${latestEvent.eventYear} • ${tour.toUpperCase()} • ${new Date(latestEvent.capturedAt).toLocaleString("en-GB", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}`
                : `No snapshot found for ${tour.toUpperCase()}`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href={`/event-model?tour=pga`}
              style={{
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #333",
                color: "white",
                background: tour === "pga" ? "#1b3a26" : "#111",
                fontWeight: 700,
              }}
            >
              PGA
            </Link>
            <Link
              href={`/event-model?tour=dp`}
              style={{
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #333",
                color: "white",
                background: tour === "dp" ? "#1b3a26" : "#111",
                fontWeight: 700,
              }}
            >
              DP
            </Link>
          </div>
        </div>

        <div style={{ height: 16 }} />

        {!latestEvent ? (
          <div style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
            No pre-event snapshot has been captured for this tour yet.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #333",
              borderRadius: 14,
              background: "#000",
            }}
          >
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1500 }}>
              <thead>
                <tr>
                  {[
                    "Player",
                    "Win %",
                    "Win Fair",
                    "Top 5 %",
                    "Top 5 Fair",
                    "Top 10 %",
                    "Top 10 Fair",
                    "Top 20 %",
                    "Top 20 Fair",
                    "Make Cut %",
                    "Skill",
                    "Custom",
                    "SG App",
                    "SG OTT",
                    "SG ARG",
                    "SG Putt",
                    "SG Total",
                    "Fit Adj",
                    "History Adj",
                    "Timing Adj",
                    "SD",
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
                        position: "sticky",
                        top: 0,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#000" : "#141414" }}>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{row.playerName}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtPct(row.winProbAnchored ?? row.winProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtOdds(row.winProbAnchored ?? row.winProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtPct(row.top5ProbAnchored ?? row.top5ProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtOdds(row.top5ProbAnchored ?? row.top5ProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtPct(row.top10ProbAnchored ?? row.top10ProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtOdds(row.top10ProbAnchored ?? row.top10ProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtPct(row.top20ProbAnchoredDh ?? row.top20ProbAnchored ?? row.top20ProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtOdds(row.top20ProbAnchoredDh ?? row.top20ProbAnchored ?? row.top20ProbModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtPct(row.pMakeCutModel)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.skillPred)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.customPred)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.sgApp)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.sgOtt)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.sgArg)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.sgPutt)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.sgTotal)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.totalFitAdjustment)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.totalCourseHistoryAdjustment)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.timingAdjustment)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{fmtNum(row.stdDeviation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
