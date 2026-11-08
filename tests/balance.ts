import assert from "node:assert/strict";
import { simulateMatch } from "../src/domain/match.ts";
import { ATTRIBUTES } from "../src/domain/config.ts";
import type { Player, Team, Attribute } from "../src/domain/types.ts";
const base = Object.fromEntries(ATTRIBUTES.map((a) => [a, 75]));
function catalog(boost?: Attribute, all = false): Player[] {
  return Array.from(
    { length: 10 },
    (_, i) =>
      ({
        id: String(i),
        attributes: Object.fromEntries(
          ATTRIBUTES.map((a) => [
            a,
            base[a] + (i < 5 && (all || boost === a) ? 15 : 0),
          ]),
        ),
      }) as Player,
  );
}
const home: Team = {
    id: "h",
    name: { en: "h", "pt-BR": "h" },
    playerIds: ["0", "1", "2", "3", "4"],
    color: "",
  },
  away: Team = { ...home, id: "a", playerIds: ["5", "6", "7", "8", "9"] };
function batch(boost?: Attribute, all = false) {
  let wins = 0,
    reverseWins = 0;
  const ps = catalog(boost, all);
  for (let i = 0; i < 10000; i++) {
    if (simulateMatch(home, away, `balance-${i}`, ps).winnerId === "h") wins++;
    if (simulateMatch(away, home, `reverse-${i}`, ps).winnerId === "h")
      reverseWins++;
  }
  return { home: wins / 10000, away: reverseWins / 10000 };
}
const identical = batch();
assert.ok(identical.home >= 0.47 && identical.home <= 0.53);
assert.ok(identical.away >= 0.47 && identical.away <= 0.53);
console.log("Identical 10,000 games per side:", identical);
for (const attribute of ATTRIBUTES) {
  const rates = batch(attribute);
  assert.ok(rates.home >= identical.home - 0.02, attribute);
  assert.ok(rates.away >= identical.away - 0.02, attribute);
  console.log(`+15 ${attribute}:`, rates);
}
const superior = batch(undefined, true);
assert.ok(superior.home > 0.75 && superior.away > 0.75);
console.log("+15 all attributes:", superior);
const builds = {
  balanced: [8, 8, 8, 8, 8, 8],
  scoring: [24, 24, 0, 0, 0, 0],
  paint: [0, 0, 0, 24, 24, 0],
  creation: [0, 0, 24, 0, 0, 24],
};
const outcomes: Record<string, number> = {};
for (const [an, av] of Object.entries(builds))
  for (const [bn, bv] of Object.entries(builds)) {
    if (an >= bn) continue;
    const ps = catalog().map((p, i) => ({
      ...p,
      attributes: Object.fromEntries(
        ATTRIBUTES.map((a, j) => [a, 75 + (i < 5 ? av[j] : bv[j])]),
      ) as Player["attributes"],
    }));
    let wins = 0;
    for (let i = 0; i < 3000; i++) {
      const m =
        i % 2
          ? simulateMatch(away, home, `profiles-${i}`, ps)
          : simulateMatch(home, away, `profiles-${i}`, ps);
      if (m.winnerId === "h") wins++;
    }
    const rate = wins / 3000;
    assert.ok(
      rate > 0.35 && rate < 0.65,
      `Dominant equal-budget matchup: ${an}/${bn} ${rate}`,
    );
    outcomes[`${an} vs ${bn}`] = rate;
  }
console.log(
  "Equal attribute budgets, 3,000 games alternating sides:",
  outcomes,
);
