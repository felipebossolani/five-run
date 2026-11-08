import { test } from "node:test";
import assert from "node:assert/strict";
import { historicalTeams } from "../src/content/historicalTeams";
import { officialTeamLogo } from "../src/ui/team-logos";

test("Should_ReferenceOfficialCurrentFranchiseAssets_When_RenderingHistoricalTeamIdentities", () => {
  const urls = historicalTeams.map((team) => officialTeamLogo(team.id));
  assert.equal(urls.length, 12);
  assert.equal(new Set(urls).size, 11);
  for (const url of urls)
    assert.match(
      url!,
      /^https:\/\/cdn\.nba\.com\/logos\/nba\/\d+\/primary\/L\/logo\.svg$/,
    );
  assert.equal(
    officialTeamLogo("los-angeles-1987"),
    officialTeamLogo("los-angeles-2001"),
  );
  assert.equal(officialTeamLogo("unknown"), undefined);
});
