import { test } from "node:test";
import assert from "node:assert/strict";
import { players } from "../src/content/catalog.ts";
import { ATTRIBUTES } from "../src/domain/config.ts";
import { DIFFICULTY_MODIFIERS, effectivePlayerAttributes } from "../src/domain/difficulty.ts";
import { choosePlayer, newRun, offerDraft, overall, playNext, startTournament } from "../src/domain/game.ts";
import { profile, simulateMatch } from "../src/domain/match.ts";
import { getStorageNotice, loadRun, loadSettings, saveRun } from "../src/persistence.ts";
import type { Difficulty } from "../src/domain/types.ts";

const modes = Object.keys(DIFFICULTY_MODIFIERS) as Difficulty[];
const byId = new Map(players.map((p) => [p.id, p]));
function draft(mode: Difficulty) {
  let run = newRun("same-draft", mode);
  const offers: string[][] = [];
  for (let i = 0; i < 5; i++) {
    run = offerDraft(run);
    offers.push(run.offeredPlayerIds);
    const best = [...run.offeredPlayerIds].sort((a, b) => overall(byId.get(b)!) - overall(byId.get(a)!))[0];
    run = choosePlayer(run, best);
  }
  return { run, offers };
}
test("Should_KeepDraftAndOpponentsIdentical_When_DifficultyChanges", () => {
  const reference = draft("medium");
  for (const mode of modes) {
    const current = draft(mode);
    assert.deepEqual(current.offers, reference.offers);
    assert.deepEqual(current.run.groups, reference.run.groups);
    assert.deepEqual(current.run.teams.map((t) => t.playerIds), reference.run.teams.map((t) => t.playerIds));
    assert.equal(current.run.difficulty, mode);
    assert.ok(current.run.teams.slice(1).every((t) => t.difficultyModifier === DIFFICULTY_MODIFIERS[mode]));
  }
  assert.throws(() => newRun("bad", "unknown" as Difficulty));
});
test("Should_ApplyClampedModifierToSnapshotsAndMatchProfiles_WithoutMutatingSource", () => {
  const team = newRun("snapshot", "impossible").teams[1];
  const player = byId.get(team.playerIds[0])!;
  const before = structuredClone({ team, player });
  const base = team.attributeOverrides?.[player.id]?.attributes ?? player.attributes;
  const actual = effectivePlayerAttributes(team, player);
  for (const a of ATTRIBUTES) assert.equal(actual[a], Math.max(40, Math.min(99, base[a] + 12)));
  const expected = team.playerIds.map((id) => effectivePlayerAttributes(team, byId.get(id)!));
  for (const a of ATTRIBUTES) assert.equal(profile(team, players)[a], expected.reduce((s, p) => s + p[a], 0) / 5);
  assert.deepEqual({ team, player }, before);
});
test("Should_ProduceReproducibleConsistentMatches_When_UsingDifficulty", () => {
  const run = draft("hard").run;
  const first = playNext(startTournament(run));
  const second = playNext(startTournament(run));
  assert.deepEqual(first.results, second.results);
  for (const result of first.results) {
    assert.equal(result.periods.reduce((s, p) => s + p.home, 0), result.homeScore);
    assert.equal(result.events.filter((e) => e.teamId === result.awayId).reduce((s, e) => s + e.points, 0), result.awayScore);
  }
  assert.deepEqual(simulateMatch(run.teams[0], run.teams[1], "same", players), simulateMatch(run.teams[0], run.teams[1], "same", players));
});
test("Should_RejectTamperedDifficultyAndModifiers_When_Loading", () => {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) } });
  for (const mode of modes) {
    const run = newRun("stored", mode);
    saveRun(run);
    assert.deepEqual(loadRun(), run);
    for (const corrupt of [undefined, null, "6", 42]) {
      const copy = structuredClone(run);
      (copy.teams[1] as any).difficultyModifier = corrupt;
      saveRun(copy);
      assert.equal(loadRun(), null);
      assert.equal(getStorageNotice(), "corrupt");
    }
    const copy = structuredClone(run);
    copy.teams[0].difficultyModifier = 1;
    saveRun(copy);
    assert.equal(loadRun(), null);
    (copy as any).difficulty = "bogus";
    saveRun(copy);
    assert.equal(loadRun(), null);
  }
  for (const value of [undefined, "bogus", null, "hard"]) {
    store.set("five-run.settings.v1", JSON.stringify({ schemaVersion: 1, difficulty: value }));
    assert.equal(loadSettings().difficulty, value === "hard" ? "hard" : "medium");
  }
});
