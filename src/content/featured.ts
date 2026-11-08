// Editorial recognition curation, independent of attributes and derived overall.
export const FEATURED_PLAYER_IDS = [
  "michael-jordan",
  "kobe-bryant",
  "magic-johnson",
  "stephen-curry",
  "oscar-robertson",
  "jerry-west",
  "dwyane-wade",
  "allen-iverson",
  "james-harden",
  "steve-nash",
  "jason-kidd",
  "john-stockton",
  "luka-doncic",
  "lebron-james",
  "larry-bird",
  "kevin-durant",
  "giannis-antetokounmpo",
  "tim-duncan",
  "dirk-nowitzki",
  "charles-barkley",
  "scottie-pippen",
  "kawhi-leonard",
  "julius-erving",
  "karl-malone",
  "kevin-garnett",
  "kareem-abdul-jabbar",
  "wilt-chamberlain",
  "bill-russell",
  "shaquille-o-neal",
  "hakeem-olajuwon",
  "nikola-jokic",
  "bam-adebayo",
] as const;
export const FEATURED_PLAYER_SET = new Set<string>(FEATURED_PLAYER_IDS);
export const BOOSTED_PLAYER_IDS = [
  "luka-doncic",
  "stephen-curry",
  "lebron-james",
  "bam-adebayo",
  "giannis-antetokounmpo",
] as const;
const boosted = new Set<string>(BOOSTED_PLAYER_IDS);
export function offerWeight(playerId: string): number {
  return playerId === "michael-jordan" ? 0.02 : boosted.has(playerId) ? 5 : 1;
}
