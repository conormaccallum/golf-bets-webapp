import { STRATEGY_MANIFEST_ID } from "./staking";

type ModelPick = { dgId: string | null; playerName: string; opponents?: string | null; pModel: unknown };
type Rejection = { status: number; error: string };

export function publishedRowRejection(row: Record<string, string> | undefined): Rejection | null {
  if (!row) return { status: 409, error: "This pick is no longer in the current output. Refresh the value screen." };
  if (row.strategy_manifest_id?.trim() !== STRATEGY_MANIFEST_ID) {
    return { status: 409, error: "These predictions belong to an older model version. Refresh the value screen." };
  }
  if (!["true", "1", "yes"].includes(String(row.strategy_qualified || row.bet_flag).trim().toLowerCase())) {
    return { status: 400, error: "This pick does not meet the current model's history and market criteria." };
  }
  return null;
}

export function validatePublishedModelRow(rows: Record<string, string>[], pick: ModelPick): Rejection | null {
  const row = rows.find(candidate =>
    (pick.dgId ? String(candidate.dg_id) === pick.dgId : candidate.player_name === pick.playerName)
    && String(candidate.opponents || "").trim() === String(pick.opponents || "").trim()
  );
  const rejection = publishedRowRejection(row);
  if (rejection) return rejection;
  if (!row) return { status: 409, error: "Refresh the value screen." };
  const published = Number(row.p_model);
  const requested = Number(pick.pModel);
  if (!row.p_model?.trim() || pick.pModel === null || pick.pModel === "" || !Number.isFinite(published)
      || !Number.isFinite(requested) || Math.abs(published - requested) > 1e-9) {
    return { status: 409, error: "The model probability has changed. Refresh the value screen." };
  }
  return null;
}
