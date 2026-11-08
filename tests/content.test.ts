import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { players } from "../src/content/catalog";
import { playerTag } from "../src/ui/player-tags";

test("Should_ProvideSourcedCareerFactsAndOriginalPortraitsForEveryAthlete_When_LoadingCatalog", () => {
  for (const player of players) {
    assert.equal(player.gender, "male", player.id);
    assert.equal(player.nbaExperience, true, player.id);
    assert.ok(
      player.sources.length > 0 &&
        player.sources.every(
          (source) =>
            /^https?:\/\//.test(source.url) &&
            Number.isFinite(Date.parse(source.accessedAt)) &&
            source.supports.trim().length > 0,
        ),
      player.id,
    );
    assert.ok(player.style.en && player.style["pt-BR"], player.id);
    assert.ok(
      player.careerHighlights.length >= 1 &&
        player.careerHighlights.length <= 3,
      player.id,
    );
    assert.ok(
      player.achievements.length >= 1 && player.achievements.length <= 3,
      player.id,
    );
    for (const stint of player.careerHighlights) {
      assert.ok(
        stint.team &&
          Number.isInteger(stint.from) &&
          Number.isInteger(stint.to) &&
          stint.from <= stint.to,
        player.id,
      );
      assert.match(stint.sourceUrl, /^https?:\/\//, player.id);
    }
    for (const feat of player.achievements) {
      assert.ok(
        feat.text.en && feat.text["pt-BR"] && Number.isInteger(feat.year),
        player.id,
      );
      assert.match(feat.sourceUrl, /^https?:\/\//, player.id);
    }
    assert.ok(
      existsSync(`public${player.portraitAsset}`),
      `Missing original portrait: ${player.id}`,
    );
    for (const locale of ["pt-BR", "en"] as const) {
      const tag = playerTag(player, locale);
      assert.ok(
        tag.split(/\s+/).length >= 2 && tag.split(/\s+/).length <= 5,
        `${player.id}: ${tag}`,
      );
    }
  }
  const identities = players.map((player) =>
    player.displayName
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase(),
  );
  assert.equal(
    new Set(identities).size,
    players.length,
    "Aliases must not create duplicate athletes",
  );
});
