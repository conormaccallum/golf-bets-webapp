type LiveRow = Record<string, any>;

type BetLike = {
  market?: string | null;
  playerName?: string | null;
  dgId?: string | number | null;
  opponents?: string | null;
};

export type LiveBetStatus = {
  available: boolean;
  status: string;
  detail?: string;
  currentPos?: string | null;
  currentScore?: number | null;
  thru?: number | string | null;
  round?: number | string | null;
  today?: number | null;
  liveProb?: number | null;
  lastUpdate?: string | null;
};

const DG_BASE = "https://feeds.datagolf.com";

export function dgTour(tour: string) {
  const t = (tour || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "euro";
  return "pga";
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeName(name: string | null | undefined) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z, ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePosition(pos: unknown): number | null {
  if (pos === null || pos === undefined) return null;
  const match = String(pos).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function pct(v: number | null) {
  if (v === null) return "";
  return `${(v * 100).toFixed(0)}%`;
}

function scoreText(row: LiveRow | null) {
  if (!row) return "";
  const pos = row.current_pos ? `Pos ${row.current_pos}` : "";
  const score = toNumber(row.current_score);
  const scorePart = score === null ? "" : `${score > 0 ? "+" : ""}${score}`;
  const thru = row.thru !== null && row.thru !== undefined ? `Thru ${row.thru}` : "";
  return [pos, scorePart, thru].filter(Boolean).join(" • ");
}

export async function fetchLiveRows(tour: string): Promise<{ rows: LiveRow[]; info: any | null; error?: string }> {
  const key = process.env.DATAGOLF_API_KEY;
  if (!key) return { rows: [], info: null, error: "Missing DATAGOLF_API_KEY" };

  const url = new URL(`${DG_BASE}/preds/in-play`);
  url.searchParams.set("tour", dgTour(tour));
  url.searchParams.set("dead_heat", "yes");
  url.searchParams.set("odds_format", "percent");
  url.searchParams.set("file_format", "json");
  url.searchParams.set("key", key);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { rows: [], info: null, error: `DataGolf live fetch failed (${res.status})` };
  }
  const json = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  return { rows, info: json?.info ?? null };
}

export function buildLiveLookup(rows: LiveRow[]) {
  const byDgId = new Map<string, LiveRow>();
  const byName = new Map<string, LiveRow>();
  for (const row of rows) {
    if (row?.dg_id !== null && row?.dg_id !== undefined) byDgId.set(String(row.dg_id), row);
    const n = normalizeName(row?.player_name);
    if (n) byName.set(n, row);
  }
  return { byDgId, byName };
}

function findPlayer(bet: BetLike, lookup: ReturnType<typeof buildLiveLookup>) {
  if (bet.dgId !== null && bet.dgId !== undefined && bet.dgId !== "") {
    const byId = lookup.byDgId.get(String(bet.dgId));
    if (byId) return byId;
  }
  return lookup.byName.get(normalizeName(bet.playerName)) ?? null;
}

function findOpponentRows(opponents: string | null | undefined, lookup: ReturnType<typeof buildLiveLookup>) {
  if (!opponents) return [];
  return opponents
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((name) => lookup.byName.get(normalizeName(name)) ?? null)
    .filter(Boolean) as LiveRow[];
}

function finishStatus(row: LiveRow, target: "win" | "top_5" | "top_10" | "top_20") {
  const marketTarget = target === "win" ? 1 : Number(target.split("_")[1]);
  const pos = parsePosition(row.current_pos);
  const prob = toNumber(row[target]);
  const currentlyWinning = pos !== null && pos <= marketTarget;
  return {
    available: true,
    status: currentlyWinning ? "Currently winning" : "Currently losing",
    detail: `${target.replace("_", " ").toUpperCase()} ${pct(prob)}${scoreText(row) ? ` • ${scoreText(row)}` : ""}`,
    currentPos: row.current_pos ?? null,
    currentScore: toNumber(row.current_score),
    thru: row.thru ?? null,
    round: row.round ?? null,
    today: toNumber(row.today),
    liveProb: prob,
  };
}

export function statusForBet(
  bet: BetLike,
  lookup: ReturnType<typeof buildLiveLookup>,
  lastUpdate?: string | null
): LiveBetStatus {
  const row = findPlayer(bet, lookup);
  if (!row) {
    return { available: false, status: "No live data", lastUpdate: lastUpdate ?? null };
  }

  const market = (bet.market || "").toLowerCase();
  let out: LiveBetStatus;

  if (market.includes("matchup")) {
    const selected = toNumber(row.current_score);
    const opponents = findOpponentRows(bet.opponents, lookup);
    const oppScores = opponents.map((o) => toNumber(o.current_score)).filter((v): v is number => v !== null);
    if (selected === null || oppScores.length === 0) {
      out = { available: true, status: "Live scores pending", detail: scoreText(row) };
    } else {
      const bestOpp = Math.min(...oppScores);
      const currentlyWinning = selected < bestOpp;
      const tied = selected === bestOpp;
      out = {
        available: true,
        status: tied ? "Currently tied" : currentlyWinning ? "Currently winning" : "Currently losing",
        detail: `${scoreText(row)} • Opp best ${bestOpp > 0 ? "+" : ""}${bestOpp}`,
        currentPos: row.current_pos ?? null,
        currentScore: selected,
        thru: row.thru ?? null,
        round: row.round ?? null,
        today: toNumber(row.today),
        liveProb: null,
      };
    }
  } else if (market.includes("miss cut")) {
    const makeCut = toNumber(row.make_cut);
    const missCut = makeCut === null ? null : 1 - makeCut;
    out = {
      available: true,
      status: missCut !== null && missCut >= 0.5 ? "Likely winning" : "Likely losing",
      detail: `Miss cut ${pct(missCut)}${scoreText(row) ? ` • ${scoreText(row)}` : ""}`,
      currentPos: row.current_pos ?? null,
      currentScore: toNumber(row.current_score),
      thru: row.thru ?? null,
      round: row.round ?? null,
      today: toNumber(row.today),
      liveProb: missCut,
    };
  } else if (market.includes("make cut")) {
    const makeCut = toNumber(row.make_cut);
    out = {
      available: true,
      status: makeCut !== null && makeCut >= 0.5 ? "Likely winning" : "Likely losing",
      detail: `Make cut ${pct(makeCut)}${scoreText(row) ? ` • ${scoreText(row)}` : ""}`,
      currentPos: row.current_pos ?? null,
      currentScore: toNumber(row.current_score),
      thru: row.thru ?? null,
      round: row.round ?? null,
      today: toNumber(row.today),
      liveProb: makeCut,
    };
  } else if (market.includes("top 5") || market.includes("top5")) {
    out = finishStatus(row, "top_5");
  } else if (market.includes("top 10") || market.includes("top10")) {
    out = finishStatus(row, "top_10");
  } else if (market.includes("top 20") || market.includes("top20")) {
    out = finishStatus(row, "top_20");
  } else if (market.includes("win")) {
    out = finishStatus(row, "win");
  } else {
    out = { available: true, status: "Live data found", detail: scoreText(row) };
  }

  return { ...out, lastUpdate: lastUpdate ?? null };
}
