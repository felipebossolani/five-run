import { ATTRIBUTES } from "./config";
import type { Attributes, Difficulty, Player, Team } from "./types";

export const DIFFICULTY_MODIFIERS: Record<Difficulty, number> = {
  easy: -4,
  medium: 0,
  hard: 6,
  impossible: 12,
};

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && Object.hasOwn(DIFFICULTY_MODIFIERS, value);
}

export function nextDifficulty(mode: Difficulty): Difficulty | null {
  switch (mode) {
    case "easy": return "medium";
    case "medium": return "hard";
    case "hard": return "impossible";
    case "impossible": return null;
    default: throw Error("Invalid difficulty");
  }
}

export function effectivePlayerAttributes(team: Team, player: Player): Attributes {
  const base = team.attributeOverrides?.[player.id]?.attributes ?? player.attributes;
  const modifier = team.difficultyModifier ?? 0;
  return Object.fromEntries(ATTRIBUTES.map((a) => [a, Math.max(40, Math.min(99, base[a] + modifier))])) as Attributes;
}
