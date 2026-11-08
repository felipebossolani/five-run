import type {
  Attributes,
  Team,
  Player,
  MatchResult,
  MatchEvent,
} from "./types";
import { random } from "./random";
import { ATTRIBUTES, RULES, RULES_VERSION } from "./config";
export function profile(team: Team, catalog: Player[]): Attributes {
  const roster = team.playerIds.map((id) => catalog.find((p) => p.id === id)!);
  if (roster.length !== 5 || roster.some((p) => !p))
    throw Error("Invalid team");
  return Object.fromEntries(
    ATTRIBUTES.map((a) => [
      a,
      roster.reduce(
        (s, p) =>
          s + (team.attributeOverrides?.[p.id]?.attributes ?? p.attributes)[a],
        0,
      ) / 5,
    ]),
  ) as Attributes;
}
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
export function simulateMatch(
  home: Team,
  away: Team,
  seed: string,
  catalog: Player[],
  stage: MatchResult["stage"] = "groups",
  round = 0,
  version = RULES_VERSION,
  config = RULES,
): MatchResult {
  if (version !== RULES_VERSION) throw Error("Unsupported rules version");
  const rng = random(`${seed}:rules:${version}`),
    h = profile(home, catalog),
    a = profile(away, catalog),
    events: MatchEvent[] = [],
    periods: { home: number; away: number }[] = [],
    c = config,
    b = c.referenceAttribute;
  const rosters = new Map(
    [home, away].map((t) => [
      t.id,
      t.playerIds.map((id) => {
        const player = catalog.find((p) => p.id === id)!;
        return {
          ...player,
          attributes:
            t.attributeOverrides?.[id]?.attributes ?? player.attributes,
        };
      }),
    ]),
  );
  const possession = (
    team: Team,
    off: Attributes,
    def: Attributes,
    period: number,
  ): number => {
    const actor = (attr: keyof Attributes) => {
      const ps = rosters.get(team.id)!;
      let x = rng() * ps.reduce((s, p) => s + p.attributes[attr], 0);
      return (ps.find((p) => (x -= p.attributes[attr]) < 0) ?? ps[4]).id;
    };
    const emit = (
      kind: MatchEvent["kind"],
      points: number,
      attr: keyof Attributes,
    ) =>
      events.push({
        teamId: team.id,
        playerId: actor(attr),
        kind,
        points,
        period,
      });
    const turnover = clamp(
      c.turnoverBase +
        (c.turnoverDefense * (def.defense - b) -
          c.turnoverCreation * (off.playmaking - b) -
          c.turnoverAthleticism * (off.athleticism - b)) /
          100,
      c.turnoverMin,
      c.turnoverMax,
    );
    if (rng() < turnover) {
      emit("turnover", 0, "playmaking");
      return 0;
    }
    for (let attempt = 0; attempt < c.maxAttempts; attempt++) {
      const three =
        rng() <
        clamp(
          c.threeShareBase + (off.shooting - b) * c.threeShareShooting,
          c.threeShareMin,
          c.threeShareMax,
        );
      const chance = three
        ? c.threeBase +
          (c.threeShooting * (off.shooting - b) +
            c.threeCreation * (off.playmaking - b) +
            c.threeAthleticism * (off.athleticism - b) -
            c.threeDefense * (def.defense - b)) /
            100
        : c.twoBase +
          (c.twoFinishing * (off.finishing - b) +
            c.twoShooting * (off.shooting - b) +
            c.twoCreation * (off.playmaking - b) +
            c.twoAthleticism * (off.athleticism - b) -
            c.twoDefense * (def.defense - b)) /
            100;
      if (rng() < clamp(chance, c.accuracyMin, c.accuracyMax)) {
        const pts = three ? 3 : 2;
        emit(three ? "three" : "two", pts, three ? "shooting" : "finishing");
        return pts;
      }
      if (
        attempt === c.maxAttempts - 1 ||
        rng() >=
          clamp(
            c.reboundBase +
              (c.reboundDifference * (off.rebounding - def.rebounding)) / 100,
            c.reboundMin,
            c.reboundMax,
          )
      )
        return 0;
      emit("rebound", 0, "rebounding");
    }
    return 0;
  };
  let homeScore = 0,
    awayScore = 0;
  for (let period = 0; period < 4 || homeScore === awayScore; period++) {
    let hs = 0,
      as = 0;
    if (period >= 4 + c.maxOvertimes) {
      const team = rng() < 0.5 ? home : away;
      events.push({
        teamId: team.id,
        playerId: team.playerIds[0],
        points: 2,
        kind: "two",
        period,
      });
      hs = team === home ? 2 : 0;
      as = team === away ? 2 : 0;
    } else {
      const count = period < 4 ? c.possessions : c.overtimePossessions;
      for (let i = 0; i < count; i++) {
        // Alternate who opens each period; independent possessions have no score feedback.
        if (period % 2 === 0) {
          hs += possession(home, h, a, period);
          as += possession(away, a, h, period);
        } else {
          as += possession(away, a, h, period);
          hs += possession(home, h, a, period);
        }
      }
    }
    periods.push({ home: hs, away: as });
    homeScore += hs;
    awayScore += as;
  }
  return {
    id: `${stage}-${round}-${home.id}-${away.id}`,
    homeId: home.id,
    awayId: away.id,
    homeScore,
    awayScore,
    periods,
    events,
    winnerId: homeScore > awayScore ? home.id : away.id,
    stage,
    round,
  };
}
