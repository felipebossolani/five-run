import { test } from "node:test";
import assert from "node:assert/strict";
import { players } from "../src/content/catalog";
import { profile, simulateMatch } from "../src/domain/match";
import type { Team } from "../src/domain/types";
test("Should_UseHistoricalAttributesForProfilesAndIndividualEvents_When_SnapshotOverridesPeak", () => {
  const home: Team = {
    id: "home",
    name: { en: "Home", "pt-BR": "Casa" },
    color: "#fff",
    playerIds: players.slice(0, 5).map((p) => p.id),
    historical: {
      year: 2000,
      label: { en: "Test season", "pt-BR": "Temporada teste" },
      sources: ["https://example.com/season"],
      rosterNotes: "Test fixture",
    },
  };
  const away: Team = {
    id: "away",
    name: { en: "Away", "pt-BR": "Fora" },
    color: "#000",
    playerIds: players.slice(5, 10).map((p) => p.id),
  };
  const attrs = {
    shooting: 40,
    finishing: 40,
    playmaking: 40,
    defense: 40,
    rebounding: 40,
    athleticism: 40,
  };
  const snapshot = {
    ...home,
    attributeOverrides: {
      [home.playerIds[0]]: {
        attributes: attrs,
        year: 2000,
        sourceUrls: ["https://example.com/season"],
        notes: "Test fixture",
      },
    },
  };
  const revised = players.map((p) =>
    p.id === home.playerIds[0] ? { ...p, attributes: attrs } : p,
  );
  assert.deepEqual(profile(snapshot, players), profile(home, revised));
  assert.deepEqual(
    simulateMatch(snapshot, away, "snapshot", players),
    simulateMatch(home, away, "snapshot", revised),
  );
  assert.notDeepEqual(profile(snapshot, players), profile(home, players));
});
