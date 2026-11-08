import { test } from "node:test";
import assert from "node:assert/strict";
import { weightedSample, random } from "../src/domain/random";
import { players } from "../src/content/catalog";
import {
  overall,
  drawDraftOptions,
  offerDraft,
  newRun,
} from "../src/domain/game";
import {
  offerWeight,
  FEATURED_PLAYER_SET,
  BOOSTED_PLAYER_IDS,
} from "../src/content/featured";
test("Should_SampleDeterministicallyWithoutReplacementAndValidateWeights_When_UsingWeightedPool", () => {
  const items = ["a", "b", "c"];
  assert.deepEqual(
    weightedSample(items, 3, () => 1, random("same")),
    weightedSample(items, 3, () => 1, random("same")),
  );
  assert.equal(
    new Set(weightedSample(items, 3, () => 1, random("full"))).size,
    3,
  );
  assert.deepEqual(items, ["a", "b", "c"]);
  assert.throws(() => weightedSample(items, 1, () => 0, random("invalid")));
});
test("Should_ApplyUserWeightsInBothPoolsAndDeriveHighestOverall_When_TuningJordan", () => {
  assert.equal(offerWeight("michael-jordan"), 0.02);
  for (const id of BOOSTED_PLAYER_IDS) {
    assert.equal(offerWeight(id), 5);
    assert.ok(FEATURED_PLAYER_SET.has(id));
  }
  assert.equal(offerWeight("kobe-bryant"), 1);
  const jordan = players.find((p) => p.id === "michael-jordan")!;
  assert.equal(overall(jordan), 97);
  assert.ok(
    players
      .filter((p) => p !== jordan)
      .every((p) => overall(p) < overall(jordan)),
  );
  const run = newRun("helper-parity");
  assert.deepEqual(
    offerDraft(run).offeredPlayerIds,
    drawDraftOptions(
      players.filter((p) => p.group === "G"),
      random(`${run.seed}:draft:0`),
    ),
  );
});
