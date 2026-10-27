import strategyManifest from "./strategy-manifest.json";

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

export const STRATEGY_MANIFEST_ID = strategyManifest.releaseId;
const strategyAliases: Record<string, keyof typeof strategyManifest.markets> = {
  win: "win", winner: "win", "top 5": "top_5", top5: "top_5",
  "top 10": "top_10", top10: "top_10", "top 20": "top_20", top20: "top_20",
  "make cut": "make_cut", "miss cut": "miss_cut",
  "matchup 2-ball": "matchup_2ball", "matchup 2 ball": "matchup_2ball", matchup2: "matchup_2ball",
};
type SavedMarketSpec = { min_ev: number; odds_cap: number; odds_floor?: number;
  exception_min_ev?: number; exception_odds_cap?: number; exception_stake_multiplier?: number };
export const MARKET_BET_CRITERIA: Record<string, MarketBetCriteria> = Object.fromEntries(
  Object.entries(strategyAliases).map(([alias, key]) => {
    const spec: SavedMarketSpec = strategyManifest.markets[key];
    return [alias, { minEv: spec.min_ev, oddsCap: spec.odds_cap,
      oddsFloor: spec.odds_floor, exceptionMinEv: spec.exception_min_ev,
      exceptionOddsCap: spec.exception_odds_cap, exceptionStakeMultiplier: spec.exception_stake_multiplier }];
  })
);

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
  const evPerUnit = p * oddsDec - 1;
  const kellyFull = b > 0 ? (p * (b + 1) - 1) / b : 0;
  const kellyFrac = Math.max(0, Math.min(1, kellyFull * KELLY_FRACTION));
  const stakeRaw = kellyFrac * BANKROLL_UNITS;
  return { edge, evPerUnit, kellyFull, kellyFrac, stakeRaw };
}
