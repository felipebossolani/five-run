import { test } from "node:test";
import assert from "node:assert/strict";
import { players } from "../src/content/catalog";
import { historicalTeams } from "../src/content/historicalTeams";
import { newRun } from "../src/domain/game";
import { validateHistoricalTeams } from "../src/domain/opponents";

test("Should_Contain12CoherentHistoricalRostersWithIndividualSeasonSnapshots_When_LoadingOpponents", () => {
  assert.equal(historicalTeams.length, 12);
  validateHistoricalTeams(players);
  for (const team of historicalTeams) {
    assert.equal(Object.keys(team.attributeOverrides ?? {}).length, 5);
    assert.ok(
      team.historical!.sources.every((url) => /^https?:\/\//.test(url)),
    );
    for (const id of team.playerIds) {
      const snapshot = team.attributeOverrides![id];
      assert.ok(snapshot.notes.length > 20);
      assert.ok(snapshot.sourceUrls.every((url) => /^https?:\/\//.test(url)));
    }
  }
});
test("Should_DrawSevenDistinctSavedHistoricalIdentities_When_CreatingRun", () => {
  const known = new Set(historicalTeams.map((t) => t.id));
  const first = newRun("historical-seed"),
    second = newRun("historical-seed");
  assert.equal(first.teams.length, 8);
  assert.deepEqual(first.teams, second.teams);
  assert.equal(new Set(first.teams.map((t) => t.id)).size, 8);
  assert.ok(
    first.teams
      .slice(1)
      .every((t) => known.has(t.id) && t.historical && t.attributeOverrides),
  );
  const original = historicalTeams.find((t) => t.id === first.teams[1].id)!;
  first.teams[1].attributeOverrides![
    first.teams[1].playerIds[0]
  ].attributes.defense = 40;
  assert.deepEqual(second.teams[1], { ...original, difficultyModifier: 0 });
});
