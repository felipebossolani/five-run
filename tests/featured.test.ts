import { test } from "node:test";
import assert from "node:assert/strict";
import { players } from "../src/content/catalog";
import {
  FEATURED_PLAYER_IDS,
  FEATURED_PLAYER_SET,
} from "../src/content/featured";
import { newRun, offerDraft, choosePlayer } from "../src/domain/game";

test("Should_CurateRecognitionSeparatelyFromRatings_When_DefiningFeaturedNames", () => {
  assert.equal(FEATURED_PLAYER_IDS.length, 32);
  assert.equal(new Set(FEATURED_PLAYER_IDS).size, 32);
  for (const [group, count] of [
    ["G", 13],
    ["F", 12],
    ["C", 7],
  ] as const)
    assert.equal(
      players.filter((p) => p.group === group && FEATURED_PLAYER_SET.has(p.id))
        .length,
      count,
    );
  for (const id of FEATURED_PLAYER_IDS)
    assert.ok(players.some((p) => p.id === id));
});
test("Should_OfferFeaturedNamesEveryRoundWithoutRepeatsAndKeepAll500Reachable_When_Drafting", () => {
  const reached = new Set<string>(),
    positions = new Set<number>(),
    before = JSON.stringify(players);
  for (let seed = 0; seed < 1000; seed++) {
    let run = newRun(`featured-spec-${seed}`);
    const seen = new Set<string>();
    for (let round = 0; round < 5; round++) {
      run = offerDraft(run);
      assert.equal(run.offeredPlayerIds.length, 6);
      assert.ok(run.offeredPlayerIds.some((id) => FEATURED_PLAYER_SET.has(id)));
      positions.add(
        run.offeredPlayerIds.findIndex((id) => FEATURED_PLAYER_SET.has(id)),
      );
      assert.deepEqual(offerDraft(run), run);
      for (const id of run.offeredPlayerIds) {
        assert.ok(!seen.has(id));
        seen.add(id);
        reached.add(id);
      }
      run = choosePlayer(run, run.offeredPlayerIds[0]);
    }
    assert.equal(seen.size, 30);
  }
  assert.ok(
    players
      .filter((p) => p.id !== "michael-jordan")
      .every((p) => reached.has(p.id)),
  );
  assert.equal(positions.size, 6);
  assert.equal(JSON.stringify(players), before);
});
