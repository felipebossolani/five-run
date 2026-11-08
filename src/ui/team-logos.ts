// Official current franchise marks are referenced remotely, not redistributed.
const franchiseIds: Record<string, string> = {
  "chicago-1996": "1610612741",
  "golden-state-2017": "1610612744",
  "los-angeles-2001": "1610612747",
  "boston-1986": "1610612738",
  "san-antonio-2014": "1610612759",
  "miami-2013": "1610612748",
  "houston-1994": "1610612745",
  "detroit-2004": "1610612765",
  "philadelphia-1983": "1610612755",
  "new-york-1970": "1610612752",
  "los-angeles-1987": "1610612747",
  "milwaukee-1971": "1610612749",
};
export function officialTeamLogo(teamId: string): string | undefined {
  const id = franchiseIds[teamId];
  return id
    ? `https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`
    : undefined;
}
