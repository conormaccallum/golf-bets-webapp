export const BANKROLL_UNITS = 1000;
export const KELLY_FRACTION = 0.25;
export const MAX_BET_FRAC = 0.10;
export const MAX_EVENT_EXPOSURE_FRAC = 1.0;
export const MIN_EDGE = 0.04;
export const MIN_EV_PER_UNIT = 0;



export type MarketBetCriteria = {
  minEv: number;
  oddsCap: number | null;
  oddsFloor?: number | null;
  exceptionMinEv?: number;
  exceptionOddsCap?: number;
  exceptionStakeMultiplier?: number;
};

export const MARKET_BET_CRITERIA: Record<string, MarketBetCriteria> = {
  "win": { minEv: 0.40, oddsCap: 100.0 },
  "winner": { minEv: 0.40, oddsCap: 100.0 },
  "top 5": { minEv: 0.35, oddsCap: 15.0, exceptionMinEv: 0.60, exceptionOddsCap: 25.0, exceptionStakeMultiplier: 0.25 },
  "top5": { minEv: 0.35, oddsCap: 15.0, exceptionMinEv: 0.60, exceptionOddsCap: 25.0, exceptionStakeMultiplier: 0.25 },
  "top 10": { minEv: 0.20, oddsCap: 10.0 },
  "top 20": { minEv: 0.20, oddsCap: 10.0, exceptionMinEv: 0.35, exceptionOddsCap: 15.0, exceptionStakeMultiplier: 0.5 },
  "top20": { minEv: 0.20, oddsCap: 10.0, exceptionMinEv: 0.35, exceptionOddsCap: 15.0, exceptionStakeMultiplier: 0.5 },
  "make cut": { minEv: 0.075, oddsCap: 3.0 },
  "miss cut": { minEv: 0.15, oddsCap: 10.0 },
  "matchup 2-ball": { minEv: 0.075, oddsFloor: 1.60, oddsCap: 2.20 },
  "matchup 2 ball": { minEv: 0.075, oddsFloor: 1.60, oddsCap: 2.20 },
  "matchup2": { minEv: 0.075, oddsFloor: 1.60, oddsCap: 2.20 },
};

export function marketCriteria(market?: string): MarketBetCriteria | null {
  const key = (market || "").trim().toLowerCase();
  return MARKET_BET_CRITERIA[key] ?? null;
}

export function isExceptionMarketBet(market: string | undefined, evPerUnit: number | null | undefined, oddsDec: number | null | undefined): boolean {
  const criteria = marketCriteria(market);
  if (!criteria?.exceptionMinEv || !criteria.exceptionOddsCap || criteria.oddsCap === null) return false;
  if (evPerUnit === null || evPerUnit === undefined || !Number.isFinite(evPerUnit)) return false;
  if (oddsDec === null || oddsDec === undefined || !Number.isFinite(oddsDec)) return false;
  return evPerUnit >= criteria.exceptionMinEv && oddsDec > criteria.oddsCap && oddsDec <= criteria.exceptionOddsCap;
}

export function qualifiesMarketBet(market: string | undefined, evPerUnit: number | null | undefined, oddsDec: number | null | undefined): boolean {
  const criteria = marketCriteria(market);
  if (!criteria) return false;
  if (evPerUnit === null || evPerUnit === undefined || !Number.isFinite(evPerUnit)) return false;
  if (oddsDec === null || oddsDec === undefined || !Number.isFinite(oddsDec)) return false;
  const standardOk =
    evPerUnit >= criteria.minEv &&
    (criteria.oddsCap === null || oddsDec <= criteria.oddsCap) &&
    (criteria.oddsFloor === undefined || criteria.oddsFloor === null || oddsDec >= criteria.oddsFloor);
  return standardOk || isExceptionMarketBet(market, evPerUnit, oddsDec);
}

export const MARKET_STAKE_MULTIPLIERS = {
  default: 1.0,
  win: 0.5,
  top5: 0.5,
  matchup2: 0.5,
  matchup3: 0.4,
};

export function stakeMultiplierForMarket(market?: string): number {
  const m = (market || "").toLowerCase();
  if (m === "win" || m.includes("winner")) return MARKET_STAKE_MULTIPLIERS.win;
  if (m.includes("top 5") || m.includes("top5")) return MARKET_STAKE_MULTIPLIERS.top5;
  if (m.includes("matchup 2")) return MARKET_STAKE_MULTIPLIERS.matchup2;
  if (m.includes("matchup 3")) return MARKET_STAKE_MULTIPLIERS.matchup3;
  return MARKET_STAKE_MULTIPLIERS.default;
}

export function stakeMultiplierForBet(market: string | undefined, evPerUnit: number | null | undefined, oddsDec: number | null | undefined): number {
  const criteria = marketCriteria(market);
  if (criteria?.exceptionStakeMultiplier !== undefined && isExceptionMarketBet(market, evPerUnit, oddsDec)) {
    return criteria.exceptionStakeMultiplier;
  }
  return stakeMultiplierForMarket(market);
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
