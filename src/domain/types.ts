export type Difficulty = "easy" | "medium" | "hard" | "impossible";
export type Locale = "pt-BR" | "en";
export type Group = "G" | "F" | "C";
export type Attribute =
  | "shooting"
  | "finishing"
  | "playmaking"
  | "defense"
  | "rebounding"
  | "athleticism";
export type Attributes = Record<Attribute, number>;
export interface Player {
  id: string;
  displayName: string;
  group: Group;
  countryCode: string;
  careerRegions: string[];
  nbaExperience: boolean;
  gender: "male" | "female";
  peakStart: number;
  peakEnd: number;
  attributes: Attributes;
  portraitAsset: string;
  description: Record<Locale, string>;
  style: Record<Locale, string>;
  careerHighlights: {
    team: string;
    from: number;
    to: number;
    sourceUrl: string;
  }[];
  achievements: {
    text: Record<Locale, string>;
    year: number;
    sourceUrl: string;
  }[];
  sources: { url: string; accessedAt: string; supports: string }[];
  scoutNotes: string;
  confidence: "high" | "medium" | "low";
  catalogVersion: string;
}
export interface Team {
  difficultyModifier?: number;
  id: string;
  name: Record<Locale, string>;
  playerIds: string[];
  color: string;
  historical?: {
    year: number;
    label: Record<Locale, string>;
    sources: string[];
    rosterNotes: string;
  };
  attributeOverrides?: Record<
    string,
    {
      attributes: Attributes;
      year: number;
      sourceUrls: string[];
      notes: string;
    }
  >;
}
export interface MatchEvent {
  teamId: string;
  playerId: string;
  points: number;
  kind: "two" | "three" | "rebound" | "turnover";
  period: number;
}
export interface MatchResult {
  id: string;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  periods: { home: number; away: number }[];
  events: MatchEvent[];
  winnerId: string;
  stage: "groups" | "semifinal" | "final";
  round: number;
}
export interface Standing {
  teamId: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  difference: number;
}
export interface Run {
  userTeamName: string;
  difficulty: Difficulty;
  id: string;
  seed: string;
  rulesVersion: string;
  catalogVersion: string;
  status: "draft" | "review" | "groups" | "semifinal" | "final" | "ended";
  draftRound: number;
  offeredPlayerIds: string[];
  seenPlayerIds: string[];
  chosenPlayerIds: string[];
  teams: Team[];
  groups: { A: string[]; B: string[] };
  results: MatchResult[];
  groupRound: number;
  knockout: { semifinals: string[][]; final: string[]; champion?: string };
  tiebreakOrder: string[];
  presentationCursor: number;
  presentationEventCursor?: number;
  createdAt: string;
  updatedAt: string;
}
export interface Settings {
  userTeamName?: string;
  difficulty?: Difficulty;
  locale: Locale;
  muted: boolean;
  reducedMotion: boolean;
  simulationSpeed: number;
  tutorialSeen: boolean;
  schemaVersion: 1;
}
