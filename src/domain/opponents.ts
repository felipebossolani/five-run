import type { Player, Team } from "./types";
import { historicalTeams } from "../content/historicalTeams";
import { ATTRIBUTES } from "./config";
import { shuffle } from "./random";

export function validateHistoricalTeams(
  catalog: Player[],
  pool: Team[] = historicalTeams,
): void {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  if (pool.length < 7 || new Set(pool.map((t) => t.id)).size !== pool.length)
    throw Error(
      "Historical teams must contain at least seven distinct identities",
    );
  for (const team of pool) {
    if (
      team.id === "user" ||
      !team.historical ||
      !team.historical.sources.length ||
      !Number.isInteger(team.historical.year) ||
      team.playerIds.length !== 5 ||
      new Set(team.playerIds).size !== 5
    )
      throw Error(`Invalid historical team ${team.id}`);
    const roster = team.playerIds.map((id) => byId.get(id));
    if (roster.some((p) => !p))
      throw Error(`Missing historical player in ${team.id}`);
    if (
      roster
        .map((p) => p!.group)
        .sort()
        .join("") !== "CFFGG"
    )
      throw Error(`Invalid historical positions in ${team.id}`);
    for (const id of team.playerIds) {
      const snapshot = team.attributeOverrides?.[id];
      if (
        !snapshot ||
        snapshot.year !== team.historical.year ||
        !snapshot.notes ||
        !snapshot.sourceUrls.length ||
        ATTRIBUTES.some(
          (a) =>
            !Number.isInteger(snapshot.attributes[a]) ||
            snapshot.attributes[a] < 40 ||
            snapshot.attributes[a] > 99,
        )
      )
        throw Error(`Invalid historical snapshot ${team.id}/${id}`);
    }
  }
}

export function selectHistoricalOpponents(
  rng: () => number,
  catalog: Player[],
  pool: Team[] = historicalTeams,
): Team[] {
  validateHistoricalTeams(catalog, pool);
  return shuffle(pool, rng)
    .slice(0, 7)
    .map((team) => structuredClone(team));
}
