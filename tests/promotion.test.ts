import { test } from "node:test";
import assert from "node:assert/strict";
import { newRun, offerDraft, choosePlayer, promoteChampion } from "../src/domain/game.ts";
import { nextDifficulty, DIFFICULTY_MODIFIERS } from "../src/domain/difficulty.ts";
import { loadRun, saveRun } from "../src/persistence.ts";
import type { Difficulty } from "../src/domain/types.ts";

test("Should_PreserveChampionRosterAndStartFreshTournament_When_Promoting", () => {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) } });
  for (const mode of ["easy", "medium", "hard"] as Difficulty[]) {
    let source = newRun("source", mode, "Café 🏀");
    for (let i = 0; i < 5; i++) {
      source = offerDraft(source);
      source = choosePlayer(source, source.offeredPlayerIds[0]);
    }
    source.status = "ended";
    source.knockout.champion = "user";
    const before = structuredClone(source);
    const promoted = promoteChampion(source, "new-tournament");
    assert.equal(promoted.status, "review");
    assert.equal(promoted.difficulty, nextDifficulty(mode));
    assert.equal(promoted.userTeamName, source.userTeamName);
    assert.deepEqual(promoted.teams[0].name, source.teams[0].name);
    assert.deepEqual(promoted.chosenPlayerIds, source.chosenPlayerIds);
    assert.deepEqual(promoted.seenPlayerIds, source.seenPlayerIds);
    assert.deepEqual(promoted.teams[0].playerIds, source.chosenPlayerIds);
    assert.deepEqual(promoted.results, []);
    assert.equal(promoted.groupRound, 0);
    assert.deepEqual(promoted.knockout, { semifinals: [], final: [] });
    assert.ok(promoted.teams.slice(1).every((team) => team.difficultyModifier === DIFFICULTY_MODIFIERS[promoted.difficulty]));
    assert.deepEqual(promoted.groups, promoteChampion(source, "new-tournament").groups);
    assert.deepEqual(source, before);
    saveRun(promoted);
    assert.deepEqual(loadRun(), promoted);
  }
});
test("Should_RejectPromotion_When_NotChampionOrAlreadyAtHighestDifficulty", () => {
  const run = newRun("loser");
  assert.throws(() => promoteChampion(run, "new"));
  run.status = "ended";
  run.knockout.champion = "other";
  assert.throws(() => promoteChampion(run, "new"));
  run.knockout.champion = "user";
  assert.throws(() => promoteChampion(run, "new"));
  run.difficulty = "impossible";
  assert.equal(nextDifficulty(run.difficulty), null);
  assert.throws(() => promoteChampion(run, "new"));
});
