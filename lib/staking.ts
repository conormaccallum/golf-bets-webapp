export const BANKROLL_UNITS = 500;
export const KELLY_FRACTION = 0.25;
export const MAX_BET_FRAC = 0.10;
export const MIN_EDGE = 0.04;

export const MARKET_STAKE_MULTIPLIERS = {
  default: 1.0,
  matchup2: 0.7,
  matchup3: 0.6,
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
