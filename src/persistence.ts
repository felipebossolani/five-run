import type { Run, Settings } from "./domain/types";
import { players, CATALOG_VERSION } from "./content/catalog";
import { FEATURED_PLAYER_SET } from "./content/featured";
import { RULES_VERSION, DRAFT_OPTIONS, ATTRIBUTES } from "./domain/config";
const RUN_KEY = "five-run.run.v1",
  SETTINGS_KEY = "five-run.settings.v1";
let notice: string | null = null;
export const getStorageNotice = () => notice;
const ids = new Set(players.map((p) => p.id));
function validRun(value: unknown): value is Run {
  if (!value || typeof value !== "object") return false;
  const r = value as Run;
  const stringIds = (a: unknown): a is string[] =>
    Array.isArray(a) && a.every((x) => typeof x === "string");
  if (
    typeof r.seed !== "string" ||
    typeof r.id !== "string" ||
    !["draft", "review", "groups", "semifinal", "final", "ended"].includes(
      r.status,
    ) ||
    !Number.isInteger(r.draftRound) ||
    r.draftRound < 0 ||
    r.draftRound > 5 ||
    !Number.isInteger(r.groupRound) ||
    r.groupRound < 0 ||
    r.groupRound > 3
  )
    return false;
  if (
    ![r.chosenPlayerIds, r.offeredPlayerIds, r.seenPlayerIds].every(
      (a) => stringIds(a) && a.every((id) => ids.has(id)),
    )
  )
    return false;
  if (
    new Set(r.chosenPlayerIds).size !== r.chosenPlayerIds.length ||
    r.chosenPlayerIds.length !== r.draftRound ||
    ![0, DRAFT_OPTIONS].includes(r.offeredPlayerIds.length) ||
    new Set(r.offeredPlayerIds).size !== r.offeredPlayerIds.length
  )
    return false;
  if (
    (r.status === "draft" && r.draftRound === 5) ||
    (r.status !== "draft" && r.draftRound !== 5) ||
    (r.status === "groups" && r.groupRound >= 3)
  )
    return false;
  const slots = ["G", "G", "F", "F", "C"];
  const offeredGroups = [
    ...slots.slice(0, r.draftRound),
    ...(r.offeredPlayerIds.length ? [slots[r.draftRound]] : []),
  ];
  if (
    new Set(r.seenPlayerIds).size !== r.seenPlayerIds.length ||
    r.chosenPlayerIds.some((id) => !r.seenPlayerIds.includes(id)) ||
    r.offeredPlayerIds.some((id) => !r.seenPlayerIds.includes(id))
  )
    return false;
  for (const group of ["G", "F", "C"])
    if (
      r.seenPlayerIds.filter(
        (id) => players.find((p) => p.id === id)?.group === group,
      ).length !==
      offeredGroups.filter((g) => g === group).length * DRAFT_OPTIONS
    )
      return false;
  if (
    r.offeredPlayerIds.length &&
    !r.offeredPlayerIds.some((id) => FEATURED_PLAYER_SET.has(id))
  )
    return false;
  if (
    r.chosenPlayerIds.some(
      (id, i) => players.find((p) => p.id === id)?.group !== slots[i],
    )
  )
    return false;
  if (
    r.offeredPlayerIds.some(
      (id) =>
        r.chosenPlayerIds.includes(id) ||
        players.find((p) => p.id === id)?.group !== slots[r.draftRound],
    )
  )
    return false;
  if (
    !Array.isArray(r.teams) ||
    r.teams.length !== 8 ||
    new Set(r.teams.map((t) => t.id)).size !== 8
  )
    return false;
  if (
    r.teams.some(
      (t) =>
        typeof t.id !== "string" ||
        typeof t.name?.en !== "string" ||
        typeof t.name?.["pt-BR"] !== "string" ||
        typeof t.color !== "string" ||
        !stringIds(t.playerIds) ||
        t.playerIds.some((id) => !ids.has(id)) ||
        new Set(t.playerIds).size !== t.playerIds.length ||
        (t.id !== "user" && t.playerIds.length !== 5),
    )
  )
    return false;
  const user = r.teams.find((t) => t.id === "user");
  if (
    !user ||
    JSON.stringify(user.playerIds) !== JSON.stringify(r.chosenPlayerIds)
  )
    return false;
  const teamIds = new Set(r.teams.map((t) => t.id));
  if (
    r.teams.some((t) => {
      if (
        t.historical &&
        (!Number.isInteger(t.historical.year) ||
          typeof t.historical.label?.en !== "string" ||
          typeof t.historical.label?.["pt-BR"] !== "string" ||
          !Array.isArray(t.historical.sources) ||
          !t.historical.sources.every((url) => typeof url === "string") ||
          typeof t.historical.rosterNotes !== "string")
      )
        return true;
      if (
        t.attributeOverrides &&
        (typeof t.attributeOverrides !== "object" ||
          Array.isArray(t.attributeOverrides) ||
          Object.entries(t.attributeOverrides).some(
            ([id, snapshot]) =>
              !t.playerIds.includes(id) ||
              !snapshot ||
              !Number.isInteger(snapshot.year) ||
              snapshot.year !== t.historical?.year ||
              !Array.isArray(snapshot.sourceUrls) ||
              snapshot.sourceUrls.length === 0 ||
              !snapshot.sourceUrls.every((url) => typeof url === "string") ||
              typeof snapshot.notes !== "string" ||
              !snapshot.attributes ||
              ATTRIBUTES.some(
                (a) =>
                  !Number.isInteger(snapshot.attributes[a]) ||
                  snapshot.attributes[a] < 40 ||
                  snapshot.attributes[a] > 99,
              ),
          ))
      )
        return true;
      return false;
    })
  )
    return false;
  if (
    !r.groups ||
    ![r.groups.A, r.groups.B].every(
      (a) => stringIds(a) && a.length === 4 && a.every((id) => teamIds.has(id)),
    ) ||
    new Set([...r.groups.A, ...r.groups.B]).size !== 8
  )
    return false;
  if (
    !stringIds(r.tiebreakOrder) ||
    r.tiebreakOrder.length !== 8 ||
    new Set(r.tiebreakOrder).size !== 8 ||
    r.tiebreakOrder.some((id) => !teamIds.has(id))
  )
    return false;
  if (
    !r.knockout ||
    !Array.isArray(r.knockout.semifinals) ||
    !stringIds(r.knockout.final) ||
    r.knockout.final.some((id) => !teamIds.has(id)) ||
    r.knockout.semifinals.some(
      (p) =>
        !stringIds(p) || p.length !== 2 || p.some((id) => !teamIds.has(id)),
    )
  )
    return false;
  if (
    (r.status === "semifinal" && r.knockout.semifinals.length !== 2) ||
    (r.status === "final" && r.knockout.final.length !== 2)
  )
    return false;
  if (
    !Array.isArray(r.results) ||
    !Number.isInteger(r.presentationCursor) ||
    r.presentationCursor < 0 ||
    r.presentationCursor > r.results.length ||
    (r.presentationEventCursor !== undefined &&
      (!Number.isInteger(r.presentationEventCursor) ||
        r.presentationEventCursor < 0 ||
        r.presentationEventCursor >
          (r.results
            .slice(r.presentationCursor)
            .find((m) => m.homeId === "user" || m.awayId === "user")?.events
            .length ?? 0)))
  )
    return false;
  return r.results.every(
    (m) =>
      teamIds.has(m.homeId) &&
      teamIds.has(m.awayId) &&
      m.homeId !== m.awayId &&
      ["groups", "semifinal", "final"].includes(m.stage) &&
      Number.isInteger(m.homeScore) &&
      Number.isInteger(m.awayScore) &&
      m.homeScore >= 0 &&
      m.awayScore >= 0 &&
      m.homeScore !== m.awayScore &&
      m.winnerId === (m.homeScore > m.awayScore ? m.homeId : m.awayId) &&
      Array.isArray(m.periods) &&
      m.periods.length >= 4 &&
      m.periods.every(
        (p) =>
          Number.isInteger(p.home) &&
          p.home >= 0 &&
          Number.isInteger(p.away) &&
          p.away >= 0,
      ) &&
      m.periods.reduce((s, p) => s + p.home, 0) === m.homeScore &&
      m.periods.reduce((s, p) => s + p.away, 0) === m.awayScore &&
      Array.isArray(m.events) &&
      m.events.every(
        (e) =>
          teamIds.has(e.teamId) &&
          ids.has(e.playerId) &&
          Number.isInteger(e.period) &&
          e.period >= 0 &&
          e.period < m.periods.length &&
          [0, 2, 3].includes(e.points) &&
          ["two", "three", "rebound", "turnover"].includes(e.kind),
      ) &&
      m.events
        .filter((e) => e.teamId === m.homeId)
        .reduce((s, e) => s + e.points, 0) === m.homeScore &&
      m.events
        .filter((e) => e.teamId === m.awayId)
        .reduce((s, e) => s + e.points, 0) === m.awayScore,
  );
}
export function loadRun(): Run | null {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw);
    if (
      r.rulesVersion !== RULES_VERSION ||
      r.catalogVersion !== CATALOG_VERSION
    ) {
      notice = "incompatible";
      return null;
    }
    if (!validRun(r)) {
      notice = "corrupt";
      return null;
    }
    return r;
  } catch {
    notice = "unavailable";
    return null;
  }
}
export function saveRun(run: Run): boolean {
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify(run));
    notice = null;
    return true;
  } catch {
    notice = "unavailable";
    return false;
  }
}
export function loadSettings(): Settings {
  const defaults: Settings = {
    locale:
      typeof navigator !== "undefined" &&
      navigator.language.toLowerCase().startsWith("pt")
        ? "pt-BR"
        : "en",
    muted: true,
    reducedMotion:
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    simulationSpeed: 1,
    tutorialSeen: false,
    schemaVersion: 1,
  };
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null");
    if (!s || s.schemaVersion !== 1) return defaults;
    return {
      ...defaults,
      locale: s.locale === "pt-BR" ? "pt-BR" : "en",
      muted: typeof s.muted === "boolean" ? s.muted : true,
      reducedMotion:
        typeof s.reducedMotion === "boolean"
          ? s.reducedMotion
          : defaults.reducedMotion,
      simulationSpeed: [1, 2, 4].includes(s.simulationSpeed)
        ? s.simulationSpeed
        : 1,
      tutorialSeen:
        typeof s.tutorialSeen === "boolean" ? s.tutorialSeen : false,
    };
  } catch {
    notice = "unavailable";
    return defaults;
  }
}
export function saveSettings(settings: Settings): boolean {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    notice = "unavailable";
    return false;
  }
}
