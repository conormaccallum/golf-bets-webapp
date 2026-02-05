"use client";

import { useEffect, useState } from "react";
import { HeaderNav, Button, Card, Table } from "./components/ui";

type TableData = { headers: string[]; rows: string[][] };

const LS_KEY_TABLE = "golf:last_betslip_table";
const LS_KEY_META  = "golf:last_betslip_meta";

function pickCols(table: TableData, keep: string[]) {
  const idx: Record<string, number> = {};
  table.headers.forEach((h, i) => (idx[h] = i));

  const headers = keep;
  const rows = table.rows.map((r) => keep.map((k) => r[idx[k]] ?? ""));
  return { headers, rows };
}

function renameHeaders(table: TableData, mapping: Record<string, string>) {
  return {
    headers: table.headers.map((h) => mapping[h] ?? h),
    rows: table.rows,
  };
}


async function postJson(url: string) {
  const res = await fetch(url, { method: "POST" });
  const text = await res.text();
  if (text.trim().startsWith("<")) {
    throw new Error(`Non-JSON response from ${url} (HTTP ${res.status}).`);
  }
  return JSON.parse(text);
}

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);

  // This is what we display (persisted)
  const [table, setTable] = useState<TableData | null>(null);

  const [status, setStatus] = useState<string>("Idle");
  const [error, setError] = useState<string | null>(null);

  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);

  // Load last saved betslip on first page load
  useEffect(() => {
    const savedTable = safeParse<TableData>(localStorage.getItem(LS_KEY_TABLE));
    const savedMeta  = safeParse<{ lastLoadedAt: string }>(localStorage.getItem(LS_KEY_META));

    if (savedTable?.headers?.length && savedTable?.rows) {
      setTable(savedTable);
      setStatus("Loaded saved betslip");
    }
    if (savedMeta?.lastLoadedAt) {
      setLastLoadedAt(savedMeta.lastLoadedAt);
    }
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    setStatus("Running pipeline...");

    try {
      const json = await postJson("/api/run");
      if (!json.ok) throw new Error(json.error || "Run failed");

    const rawTable: TableData | null = json.tables?.betslip ?? null;
    if (!rawTable?.headers?.length) throw new Error("API did not return tables.betslip");

    // ---- HOME DISPLAY VERSION (only keep 5 columns) ----

    // Step A: find the index of each column we care about
    const idx: Record<string, number> = {};
    rawTable.headers.forEach((h, i) => (idx[h] = i));
    
    // Step B: define the columns we want to show
    const keep = [
      "bet_type",
      "player_name",
      "market_book_best",
      "market_odds_best_dec",
      "stake_units",
    ];

    // Step C: build the new filtered table
    const filteredTable: TableData = {
      headers: ["Market", "Player Name", "Bookmaker", "Odds", "Stake (Units)"],
      rows: rawTable.rows.map((r) => [
        r[idx["bet_type"]] ?? "",
        r[idx["player_name"]] ?? "",
        r[idx["market_book_best"]] ?? "",
        r[idx["market_odds_best_dec"]] ?? "",
        r[idx["stake_units"]] ?? "",
      ]),
    };

    // Step D: show it on the page
    setTable(filteredTable);

    // ----------------------------------------------------

      // Persist ONLY when refresh succeeds
      const now = new Date().toISOString();
      setLastLoadedAt(now);

      localStorage.setItem(LS_KEY_TABLE, JSON.stringify(filteredTable));
      localStorage.setItem(LS_KEY_META, JSON.stringify({ lastLoadedAt: now }));
      setStatus(`Loaded betslip. Rows: ${filteredTable.rows.length}`);

      
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  async function commit() {
    setCommitting(true);
    setError(null);
    setStatus("Committing to DB...");

    try {
      const json = await postJson("/api/commit");
      if (!json.ok) throw new Error(json.error || "Commit failed");
      setStatus(`Committed: ${json.label} (bets: ${json.betCount})`);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setStatus("Error");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Home</h1>

        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Button onClick={refresh} disabled={loading}>
              {loading ? "Running..." : "Refresh betslip"}
            </Button>

            <Button onClick={commit} disabled={committing}>
              {committing ? "Committing..." : "Commit"}
            </Button>

            <span style={{ marginLeft: "auto", color: "#bbb" }}>
              Status: {status}
            </span>
          </div>

          <div style={{ marginTop: 10, color: "#bbb", fontSize: 13 }}>
            Last betslip loaded: {lastLoadedAt ? lastLoadedAt : "None yet"}
          </div>

          {error && (
            <pre style={{ color: "#ff4d4d", whiteSpace: "pre-wrap", marginTop: 12 }}>
              {error}
            </pre>
          )}
        </Card>

        <div style={{ height: 16 }} />

        {!table ? (
          <Card>
            <p style={{ margin: 0, color: "#bbb" }}>No betslip loaded yet. Click Refresh betslip.</p>
          </Card>
        ) : (
          <Card>
            <Table data={table} />
          </Card>
        )}
      </main>
    </div>
  );
}
