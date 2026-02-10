export const BANKROLL_UNITS = 500;
export const KELLY_FRACTION = 0.25;
export const MAX_BET_FRAC = 0.10;
export const MIN_EDGE = 0.04;

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
