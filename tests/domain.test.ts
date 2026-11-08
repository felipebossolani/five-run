import { test } from "node:test";
import assert from "node:assert/strict";
import { players } from "../src/content/catalog.ts";
import {
  newRun,
  offerDraft,
  choosePlayer,
  startTournament,
  playNext,
  standings,
  overall,
  simulateMatch,
} from "../src/domain/game.ts";
import { ATTRIBUTES, WEIGHTS } from "../src/domain/config.ts";
import { RULES, RULES_VERSION } from "../src/domain/config.ts";
import type { Run } from "../src/domain/types.ts";
function draft(seed = "spec"): Run {
  let r = newRun(seed);
  for (let i = 0; i < 5; i++) {
    r = offerDraft(r);
    r = choosePlayer(r, r.offeredPlayerIds[0]);
  }
  return r;
}
test("Should_Contain500CompletePlayers_When_LoadingCatalog", () => {
  assert.equal(players.length, 500);
  assert.equal(new Set(players.map((p) => p.id)).size, 500);
  for (const [g, n] of [
    ["G", 200],
    ["F", 200],
    ["C", 100],
  ] as const)
    assert.equal(players.filter((p) => p.group === g).length, n);
  for (const p of players) {
    for (const a of ATTRIBUTES)
      assert.ok(
        Number.isInteger(p.attributes[a]) &&
          p.attributes[a] >= 40 &&
          p.attributes[a] <= 99,
      );
    assert.ok(p.sources.length > 0);
    assert.ok(p.peakStart <= p.peakEnd);
    assert.ok(p.description.en && p.description["pt-BR"]);
  }
});
test("Should_DeriveOverallFromGroupWeights_When_RatingPlayer", () => {
  for (const w of Object.values(WEIGHTS))
    assert.ok(Math.abs(w.reduce((a, b) => a + b, 0) - 1) < 1e-10);
  for (const group of ["G", "F", "C"] as const)
    assert.equal(
      overall({
        ...players[0],
        group,
        attributes: Object.fromEntries(ATTRIBUTES.map((a) => [a, 80])) as any,
      }),
      80,
    );
  assert.equal(
    overall({
      ...players[0],
      group: "G",
      attributes: {
        shooting: 90,
        finishing: 80,
        playmaking: 95,
        defense: 75,
        rebounding: 50,
        athleticism: 85,
      },
    }),
    85,
  );
});
test("Should_PreserveSixDistinctOffersAndRejectDuplicateConfirm_When_Drafting", () => {
  let r = newRun("draft");
  const seen = new Set<string>();
  for (const group of ["G", "G", "F", "F", "C"]) {
    r = offerDraft(r);
    assert.equal(r.offeredPlayerIds.length, 6);
    assert.deepEqual(offerDraft(r), r);
    for (const id of r.offeredPlayerIds) {
      assert.ok(!seen.has(id));
      seen.add(id);
      assert.equal(players.find((p) => p.id === id)!.group, group);
    }
    const id = r.offeredPlayerIds[0];
    r = choosePlayer(r, id);
    assert.deepEqual(choosePlayer(r, id), r);
  }
  assert.equal(r.status, "review");
  assert.equal(r.chosenPlayerIds.length, 5);
});
test("Should_GenerateSameDraftAndOpponents_When_SeedMatches", () => {
  const a = draft("same"),
    b = draft("same");
  assert.deepEqual(a.teams, b.teams);
  assert.deepEqual(a.groups, b.groups);
  assert.deepEqual(a.chosenPlayerIds, b.chosenPlayerIds);
});
test("Should_PlayEveryGroupFixtureAndCrossSemifinals_When_AdvancingTournament", () => {
  for (let seed = 0; seed < 30; seed++) {
    let r = startTournament(draft(String(seed)));
    for (let i = 0; i < 3; i++) r = playNext(r);
    assert.equal(r.results.length, 12);
    for (const t of r.teams)
      assert.equal(
        r.results.filter((m) => m.homeId === t.id || m.awayId === t.id).length,
        3,
      );
    const a = standings(r, "A"),
      b = standings(r, "B");
    assert.deepEqual(r.knockout.semifinals, [
      [a[0].teamId, b[1].teamId],
      [b[0].teamId, a[1].teamId],
    ]);
    if (r.status === "semifinal") {
      r = playNext(r);
      assert.equal(r.results.length, 14);
    }
    if (r.status === "final") {
      r = playNext(r);
      assert.equal(r.results.length, 15);
      assert.ok(r.knockout.champion);
    }
    assert.equal(r.status, "ended");
    assert.deepEqual(playNext(r), r);
  }
});
test("Should_ProduceDeterministicConsistentPeriodsAndScoringEvents_When_Simulating", () => {
  const r = draft();
  for (let i = 0; i < 50; i++) {
    const args = [r.teams[0], r.teams[1], String(i), players] as const;
    const m = simulateMatch(...args);
    assert.deepEqual(m, simulateMatch(...args));
    assert.notEqual(m.homeScore, m.awayScore);
    assert.equal(
      m.homeScore,
      m.periods.reduce((s, p) => s + p.home, 0),
    );
    assert.equal(
      m.awayScore,
      m.periods.reduce((s, p) => s + p.away, 0),
    );
    for (const [id, score] of [
      [m.homeId, m.homeScore],
      [m.awayId, m.awayScore],
    ])
      assert.equal(
        m.events
          .filter((e) => e.teamId === id)
          .reduce((s, e) => s + e.points, 0),
        score,
      );
  }
});
test("Should_ResolveTotalStandingsTiesUsingSavedOrder_When_NoGamesPlayed", () => {
  const r = draft();
  for (const g of ["A", "B"] as const)
    assert.deepEqual(
      standings(r, g).map((t) => t.teamId),
      r.tiebreakOrder.filter((id) => r.groups[g].includes(id)),
    );
});
test("Should_ResolveTechnicalOvertimeLimitWithConsistentTwoPointPeriod_When_AllPossessionsScoreZero", () => {
  const r = draft();
  const m = simulateMatch(
    r.teams[0],
    r.teams[1],
    "overtime",
    players,
    "final",
    0,
    RULES_VERSION,
    { ...RULES, possessions: 0, overtimePossessions: 0, maxOvertimes: 0 },
  );
  assert.equal(m.periods.length, 5);
  assert.equal(m.homeScore + m.awayScore, 2);
  assert.equal(
    m.events.reduce((s, e) => s + e.points, 0),
    2,
  );
});
