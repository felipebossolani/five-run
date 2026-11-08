import { players, CATALOG_VERSION } from "../content/catalog";
import { FEATURED_PLAYER_SET, offerWeight } from "../content/featured";
import { selectHistoricalOpponents } from "./opponents";
import type { Run, Team, Player, Group, Standing, Difficulty } from "./types";
import { random, shuffle, weightedSample } from "./random";
import { ATTRIBUTES, WEIGHTS, RULES_VERSION, DRAFT_OPTIONS } from "./config";
import { normalizeTeamName } from "./team-name";
import { DIFFICULTY_MODIFIERS, isDifficulty, nextDifficulty } from "./difficulty";
import { profile, simulateMatch } from "./match";
export { simulateMatch } from "./match";
const slots: Group[] = ["G", "G", "F", "F", "C"];
export const overall = (p: Player) =>
  Math.round(
    ATTRIBUTES.reduce(
      (s, a, i) => s + p.attributes[a] * WEIGHTS[p.group][i],
      0,
    ),
  );
export const teamProfile = (t: Team) => profile(t, players);
const clone = (r: Run) => structuredClone(r);
const stamp = (r: Run) => {
  r.updatedAt = new Date().toISOString();
  return r;
};
export function newRun(
  seed = Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) =>
    value.toString(16).padStart(8, "0"),
  ).join(""),
  difficulty: Difficulty = "medium",
  userTeamName = "",
): Run {
  if (!isDifficulty(difficulty)) throw Error("Invalid difficulty");
  const normalizedName = normalizeTeamName(userTeamName);
  const rng = random(`${seed}:opponents`);
  const teams: Team[] = [
    {
      id: "user",
      name: normalizedName
        ? { "pt-BR": normalizedName, en: normalizedName }
        : { "pt-BR": "Seu quinteto", en: "Your five" },
      playerIds: [],
      color: "#ffad42",
    },
    ...selectHistoricalOpponents(rng, players).map((team) => ({
      ...team, difficultyModifier: DIFFICULTY_MODIFIERS[difficulty],
    })),
  ];
  const ids = shuffle(
      teams.map((t) => t.id),
      rng,
    ),
    now = new Date().toISOString();
  return {
    id: seed,
    seed,
    difficulty,
    userTeamName: normalizedName,
    rulesVersion: RULES_VERSION,
    catalogVersion: CATALOG_VERSION,
    status: "draft",
    draftRound: 0,
    offeredPlayerIds: [],
    seenPlayerIds: [],
    chosenPlayerIds: [],
    teams,
    groups: { A: ids.slice(0, 4), B: ids.slice(4) },
    results: [],
    groupRound: 0,
    knockout: { semifinals: [], final: [] },
    tiebreakOrder: shuffle(ids, rng),
    presentationCursor: 0,
    presentationEventCursor: 0,
    createdAt: now,
    updatedAt: now,
  };
}
export function promoteChampion(input: Run, seed?: string): Run {
  const next = nextDifficulty(input.difficulty);
  if (
    input.status !== "ended" || input.knockout.champion !== "user" ||
    !next || input.rulesVersion !== RULES_VERSION || input.catalogVersion !== CATALOG_VERSION ||
    input.draftRound !== 5 || input.chosenPlayerIds.length !== 5
  ) throw Error("Run cannot be promoted");
  const run = newRun(seed, next, input.userTeamName);
  run.status = "review";
  run.draftRound = 5;
  run.chosenPlayerIds = [...input.chosenPlayerIds];
  run.seenPlayerIds = [...input.seenPlayerIds];
  run.teams[0].playerIds = [...run.chosenPlayerIds];
  return run;
}
export function offerDraft(input: Run): Run {
  const r = clone(input);
  if (r.status !== "draft" || r.offeredPlayerIds.length) return r;
  const eligible = players.filter(
    (p) => p.group === slots[r.draftRound] && !r.seenPlayerIds.includes(p.id),
  );
  const rng = random(`${r.seed}:draft:${r.draftRound}`);
  r.offeredPlayerIds = drawDraftOptions(eligible, rng);
  r.seenPlayerIds.push(...r.offeredPlayerIds);
  return stamp(r);
}
export function drawDraftOptions(
  eligible: readonly Player[],
  rng: () => number,
): string[] {
  const featured = weightedSample(
    eligible.filter((p) => FEATURED_PLAYER_SET.has(p.id)),
    1,
    (p) => offerWeight(p.id),
    rng,
  )[0];
  if (!featured)
    throw Error("No eligible featured player for this draft round");
  const others = weightedSample(
    eligible.filter((p) => p.id !== featured.id),
    DRAFT_OPTIONS - 1,
    (p) => offerWeight(p.id),
    rng,
  );
  return shuffle([featured, ...others], rng).map((p) => p.id);
}
export function choosePlayer(input: Run, id: string): Run {
  const r = clone(input);
  if (
    r.status !== "draft" ||
    !r.offeredPlayerIds.includes(id) ||
    r.chosenPlayerIds.includes(id)
  )
    return r;
  r.chosenPlayerIds.push(id);
  r.teams[0].playerIds = [...r.chosenPlayerIds];
  r.offeredPlayerIds = [];
  r.draftRound++;
  if (r.draftRound === 5) r.status = "review";
  return stamp(r);
}
export function startTournament(input: Run): Run {
  const r = clone(input);
  if (r.status === "review") r.status = "groups";
  return stamp(r);
}
export function standings(r: Run, group: "A" | "B"): Standing[] {
  return r.groups[group]
    .map((teamId) => {
      const games = r.results.filter(
        (m) =>
          m.stage === "groups" && (m.homeId === teamId || m.awayId === teamId),
      );
      let pointsFor = 0,
        pointsAgainst = 0;
      games.forEach((m) => {
        pointsFor += m.homeId === teamId ? m.homeScore : m.awayScore;
        pointsAgainst += m.homeId === teamId ? m.awayScore : m.homeScore;
      });
      const wins = games.filter((m) => m.winnerId === teamId).length;
      return {
        teamId,
        wins,
        losses: games.length - wins,
        pointsFor,
        pointsAgainst,
        difference: pointsFor - pointsAgainst,
      };
    })
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        b.difference - a.difference ||
        b.pointsFor - a.pointsFor ||
        r.tiebreakOrder.indexOf(a.teamId) - r.tiebreakOrder.indexOf(b.teamId),
    );
}
const pairings = [
  [
    [0, 1],
    [2, 3],
  ],
  [
    [0, 2],
    [1, 3],
  ],
  [
    [0, 3],
    [1, 2],
  ],
];
function upcoming(r: Run): string[][] {
  if (r.status === "groups")
    return (["A", "B"] as const).flatMap((g) =>
      pairings[r.groupRound].map((pair) => pair.map((i) => r.groups[g][i])),
    );
  if (r.status === "semifinal") return r.knockout.semifinals;
  if (r.status === "final") return [r.knockout.final];
  return [];
}
export function nextOpponent(r: Run): Team | undefined {
  const pair = upcoming(r).find((p) => p.includes("user"));
  return r.teams.find((t) => t.id === pair?.find((id) => id !== "user"));
}
export function playNext(input: Run): Run {
  const r = clone(input);
  if (!["groups", "semifinal", "final"].includes(r.status)) return r;
  const stage = r.status as "groups" | "semifinal" | "final",
    round = r.groupRound;
  for (const [h, a] of upcoming(r)) {
    r.results.push(
      simulateMatch(
        r.teams.find((t) => t.id === h)!,
        r.teams.find((t) => t.id === a)!,
        `${r.seed}:matches:${stage}:${round}:${h}:${a}`,
        players,
        stage,
        round,
        r.rulesVersion,
      ),
    );
  }
  if (stage === "groups") {
    r.groupRound++;
    if (r.groupRound === 3) {
      const a = standings(r, "A"),
        b = standings(r, "B");
      r.knockout.semifinals = [
        [a[0].teamId, b[1].teamId],
        [b[0].teamId, a[1].teamId],
      ];
      r.status = r.knockout.semifinals.some((p) => p.includes("user"))
        ? "semifinal"
        : "ended";
    }
  } else if (stage === "semifinal") {
    r.knockout.final = r.results
      .filter((m) => m.stage === "semifinal")
      .map((m) => m.winnerId);
    r.status = r.knockout.final.includes("user") ? "final" : "ended";
  } else {
    r.knockout.champion = r.results.at(-1)!.winnerId;
    r.status = "ended";
  }
  return stamp(r);
}
