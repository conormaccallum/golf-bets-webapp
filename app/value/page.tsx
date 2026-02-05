"use client";

import { useState } from "react";
import { HeaderNav, Button, Card, Table } from "../components/ui";

type Market = "top20" | "make_cut" | "miss_cut";
type TableData = { headers: string[]; rows: string[][] };

async function postJson(url: string) {
  const res = await fetch(url, { method: "POST" });
  const text = await res.text();
  if (text.trim().startsWith("<")) {
    throw new Error(`Non-JSON response from ${url} (HTTP ${res.status}).`);
  }
  return JSON.parse(text);
}

export default function ValueScreensPage() {
  const [market, setMarket] = useState<Market>("top20");
  const [table, setTable] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("Idle");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setStatus("Running pipeline...");
    try {
      const json = await postJson("/api/run");
      if (!json.ok) throw new Error(json.error || "Run failed");

      if (market === "top20") setTable(json.tables.top20);
      if (market === "make_cut") setTable(json.tables.makeCut);
      if (market === "miss_cut") setTable(json.tables.missCut);

      setStatus("Loaded");
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "white" }}>
      <HeaderNav />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Value Screens</h1>

        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as Market)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #333",
                fontWeight: 700,
                background: "#111",
                color: "white",
              }}
            >
              <option value="top20">Top 20</option>
              <option value="make_cut">Make Cut</option>
              <option value="miss_cut">Miss Cut</option>
            </select>

            <Button onClick={load} disabled={loading}>
              {loading ? "Running..." : "Load"}
            </Button>

            <span style={{ marginLeft: "auto", color: "#bbb" }}>Status: {status}</span>
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
            <p style={{ margin: 0, color: "#bbb" }}>No screen loaded.</p>
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
