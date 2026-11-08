import { players } from "../src/content/catalog";
import {
  FEATURED_PLAYER_SET,
  BOOSTED_PLAYER_IDS,
  offerWeight,
} from "../src/content/featured";
import { drawDraftOptions } from "../src/domain/game";
import { random, shuffle } from "../src/domain/random";
import type { Group, Player } from "../src/domain/types";
const groups: Group[] = ["G", "G", "F", "F", "C"];
const byGroup = Object.fromEntries(
  (["G", "F", "C"] as Group[]).map((group) => [
    group,
    players.filter((p) => p.group === group),
  ]),
) as Record<Group, Player[]>;
const oldFeatured = new Set(
  [...FEATURED_PLAYER_SET].filter(
    (id) => !["luka-doncic", "bam-adebayo"].includes(id),
  ),
);
const runs = Number(process.argv[2] ?? 100000);
function legacyOffer(pool: Player[], rng: () => number) {
  const star = shuffle(
    pool.filter((p) => oldFeatured.has(p.id)),
    rng,
  )[0];
  return shuffle(
    [
      star,
      ...shuffle(
        pool.filter((p) => p.id !== star.id),
        rng,
      ).slice(0, 5),
    ],
    rng,
  ).map((p) => p.id);
}
function batch(weighted: boolean) {
  const offered = new Map(players.map((p) => [p.id, 0]));
  for (let index = 0; index < runs; index++) {
    const seen = new Set<string>();
    for (let round = 0; round < 5; round++) {
      const pool = byGroup[groups[round]].filter((p) => !seen.has(p.id));
      const rng = random(`weighted-audit-${index}:draft:${round}`);
      const ids = weighted
        ? drawDraftOptions(pool, rng)
        : legacyOffer(pool, rng);
      if (new Set(ids).size !== 6 || ids.some((id) => seen.has(id)))
        throw Error("Invalid/repeated offers");
      for (const id of ids) {
        seen.add(id);
        offered.set(id, offered.get(id)! + 1);
      }
    }
  }
  return offered;
}
// Exact probability of selecting the target in the next five weighted draws.
// States aggregate other candidates by equal weight; the target is absorbing.
function laterProbability(pool: Player[], target: string) {
  const weights = [0.02, 1, 5];
  const counts = weights.map(
    (w) =>
      pool.filter((p) => p.id !== target && offerWeight(p.id) === w).length,
  );
  let states = new Map<string, number>([["0,0,0", 1]]);
  for (let draw = 0; draw < 5; draw++) {
    const next = new Map<string, number>();
    for (const [key, prob] of states) {
      const used = key.split(",").map(Number);
      const total =
        offerWeight(target) +
        counts.reduce(
          (sum, count, i) => sum + (count - used[i]) * weights[i],
          0,
        );
      for (let i = 0; i < 3; i++) {
        const available = counts[i] - used[i];
        if (!available) continue;
        const after = [...used];
        after[i]++;
        const k = after.join(",");
        next.set(
          k,
          (next.get(k) ?? 0) + (prob * available * weights[i]) / total,
        );
      }
    }
    states = next;
  }
  return 1 - [...states.values()].reduce((a, b) => a + b, 0);
}
function firstRoundProbability(id: string) {
  const target = players.find((p) => p.id === id)!;
  const pool = byGroup[target.group];
  const featured = pool.filter((p) => FEATURED_PLAYER_SET.has(p.id));
  const total = featured.reduce((s, p) => s + offerWeight(p.id), 0);
  return featured.reduce(
    (sum, first) =>
      sum +
      (offerWeight(first.id) / total) *
        (first.id === id
          ? 1
          : laterProbability(
              pool.filter((p) => p.id !== first.id),
              id,
            )),
    0,
  );
}
const started = performance.now(),
  baseline = batch(false),
  weighted = batch(true);
const jordan = weighted.get("michael-jordan")!;
const rarestOther = players
  .filter((p) => p.id !== "michael-jordan")
  .map((p) => ({ id: p.id, offers: weighted.get(p.id)! }))
  .sort((a, b) => a.offers - b.offers)[0];
if (jordan <= 0 || jordan >= rarestOther.offers)
  throw Error("Jordan is not observed and strictly rarest");
const boosted = BOOSTED_PLAYER_IDS.map((id) => ({
  id,
  before: baseline.get(id)! / runs,
  after: weighted.get(id)! / runs,
  exactFirstRound: firstRoundProbability(id),
}));
if (boosted.some((p) => p.after <= p.before))
  throw Error("Boost did not increase exposure");
const output = {
  runs,
  seconds: (performance.now() - started) / 1000,
  weights: { default: 1, boosted: 5, jordan: 0.02 },
  jordan: {
    before: baseline.get("michael-jordan")! / runs,
    after: jordan / runs,
    offers: jordan,
    exactFirstGuardRound: firstRoundProbability("michael-jordan"),
  },
  rarestOther: { ...rarestOther, exposure: rarestOther.offers / runs },
  boosted,
  all500Observed: [...weighted.values()].every((n) => n > 0),
};
console.log(JSON.stringify(output, null, 2));
