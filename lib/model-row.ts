import { STRATEGY_MANIFEST_ID } from "./staking";

type ModelPick = { dgId: string | null; playerName: string; opponents?: string | null; pModel: unknown };
type Rejection = { status: number; error: string };

export function validatePublishedModelRow(rows: Record<string, string>[], pick: ModelPick): Rejection | null {
  const row = rows.find(candidate =>
    (pick.dgId ? String(candidate.dg_id) === pick.dgId : candidate.player_name === pick.playerName)
    && String(candidate.opponents || "").trim() === String(pick.opponents || "").trim()
  );
  if (!row || !["true", "1", "yes"].includes(String(row.strategy_qualified || row.bet_flag).toLowerCase())
      || row.strategy_manifest_id !== STRATEGY_MANIFEST_ID) {
    return { status: 400, error: "This row does not meet the current model's historical-data and market criteria. Refresh the value screen." };
  }
  const published = Number(row.p_model);
  const requested = Number(pick.pModel);
  if (!row.p_model?.trim() || pick.pModel === null || pick.pModel === "" || !Number.isFinite(published)
      || !Number.isFinite(requested) || Math.abs(published - requested) > 1e-9) {
    return { status: 409, error: "The model probability has changed. Refresh the value screen." };
  }
  return null;
}
