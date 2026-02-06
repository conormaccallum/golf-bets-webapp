export const dynamic = "force-dynamic";

import { HeaderNav } from "../components/ui";

export default function HistoryPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "sans-serif", color: "white" }}>
      <HeaderNav />
      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>History</h1>
        <p>
          History is temporarily disabled in production while the database connection is being configured.
        </p>
      </main>
    </div>
  );
}
