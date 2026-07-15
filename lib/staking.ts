export const BANKROLL_UNITS = 500;
export const KELLY_FRACTION = 0.25;
export const MAX_BET_FRAC = 0.10;
export const MAX_EVENT_EXPOSURE_FRAC = 1.0;
export const MIN_EDGE = 0.04;
export const MIN_EV_PER_UNIT = 0;



export const MARKET_BET_CRITERIA: Record<string, { minEv: number; oddsCap: number | null }> = {
  "top 10": { minEv: 0.20, oddsCap: 10.0 },
  "top 20": { minEv: 0.25, oddsCap: 10.0 },
  "make cut": { minEv: 0.075, oddsCap: 3.0 },
  "miss cut": { minEv: 0.15, oddsCap: 10.0 },
};

export function marketCriteria(market?: string): { minEv: number; oddsCap: number | null } | null {
  const key = (market || "").trim().toLowerCase();
  return MARKET_BET_CRITERIA[key] ?? null;
}

export function qualifiesMarketBet(market: string | undefined, evPerUnit: number | null | undefined, oddsDec: number | null | undefined): boolean {
  const criteria = marketCriteria(market);
  if (!criteria) return false;
  if (evPerUnit === null || evPerUnit === undefined || !Number.isFinite(evPerUnit)) return false;
  if (oddsDec === null || oddsDec === undefined || !Number.isFinite(oddsDec)) return false;
  if (evPerUnit < criteria.minEv) return false;
  if (criteria.oddsCap !== null && oddsDec > criteria.oddsCap) return false;
  return true;
}

export const MARKET_STAKE_MULTIPLIERS = {
  default: 1.0,
  matchup2: 0.5,
  matchup3: 0.4,
};

export function stakeMultiplierForMarket(market?: string): number {
  const m = (market || "").toLowerCase();
  if (m.includes("matchup 2")) return MARKET_STAKE_MULTIPLIERS.matchup2;
  if (m.includes("matchup 3")) return MARKET_STAKE_MULTIPLIERS.matchup3;
  return MARKET_STAKE_MULTIPLIERS.default;
}

export function computeStakeUnits(p: number, oddsDec: number): {
  edge: number;
  evPerUnit: number;
  kellyFull: number;
  kellyFrac: number;
  stakeRaw: number;
} {
  const q = 1 - p;
  const b = oddsDec - 1;
  const marketProb = 1 / oddsDec;
  const edge = p - marketProb;
  const evPerUnit = p * b - q;
  const kellyFull = b > 0 ? (p * (b + 1) - 1) / b : 0;
  const kellyFrac = Math.max(0, Math.min(1, kellyFull * KELLY_FRACTION));
  const stakeRaw = kellyFrac * BANKROLL_UNITS;
  return { edge, evPerUnit, kellyFull, kellyFrac, stakeRaw };
}
