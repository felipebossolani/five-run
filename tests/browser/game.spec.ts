import { test, expect } from "@playwright/test";
import {
  newRun,
  offerDraft,
  choosePlayer,
  startTournament,
  playNext,
  overall,
} from "../../src/domain/game";
import { players } from "../../src/content/catalog";
test("full campaign survives reloads in both locales and keeps all six cards visible", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const locale of ["en", "pt-BR"]) {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    await page.evaluate((l) => {
      localStorage.clear();
      localStorage.setItem(
        "five-run.settings.v1",
        JSON.stringify({
          locale: l,
          muted: true,
          reducedMotion: true,
          simulationSpeed: 4,
          tutorialSeen: true,
          schemaVersion: 1,
        }),
      );
    }, locale);
    await page.reload();
    await expect(page.locator(".hero")).toBeVisible();
    await page.locator("[data-action=new]").click();
    for (let round = 0; round < 5; round++) {
      await expect(page.locator(".player-card")).toHaveCount(6);
      await expect(
        page.locator(".player-card[data-featured=true]").first(),
      ).toBeVisible();
      const offers = await page
        .locator(".player-card")
        .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.id));
      await page.reload();
      await page.locator("[data-action=continue]").click();
      await expect(page.locator(".player-card")).toHaveCount(6);
      expect(
        await page
          .locator(".player-card")
          .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.id)),
      ).toEqual(offers);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      await page.locator(".player-card").first().click();
      await page.locator("[data-action=confirm-player]").click();
    }
    await expect(page.locator("[data-action=start]")).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: `test-results/${locale}-review-360.png`,
      fullPage: true,
    });
    await page.locator("[data-action=start]").click();
    let games = 0;
    while (await page.locator("[data-action=play-match]").count()) {
      await page.locator("[data-action=play-match]").click();
      games++;
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("five-run.run.v1")!).results,
      );
      await page.reload();
      await page.locator("[data-action=continue]").click();
      expect(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("five-run.run.v1")!).results,
        ),
      ).toEqual(saved);

      await expect(page.locator("[data-action=dismiss-match]")).toBeVisible();
      await page.screenshot({
        animations: "disabled",
        path: `test-results/${locale}-match-360.png`,
        fullPage: true,
      });
      await page.locator("[data-action=dismiss-match]").click();
    }
    expect(games).toBeGreaterThanOrEqual(3);
    expect(games).toBeLessThanOrEqual(5);
    await expect(page.locator(".end-screen")).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: `test-results/${locale}-end-360.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  }
});
test("responsive home and draft fit 360 390 430 and desktop", async ({
  page,
}) => {
  for (const width of [360, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.screenshot({
      animations: "disabled",
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.locator("[data-action=new]").click();
    if (await page.locator("[data-action=close-modal]").count())
      await page.locator("button[data-action=close-modal]").first().click();
    await page.screenshot({
      animations: "disabled",
      path: `test-results/draft-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    for (const card of await page.locator(".player-card").all()) {
      const b = await card.boundingBox();
      expect(b!.x).toBeGreaterThanOrEqual(0);
      expect(b!.x + b!.width).toBeLessThanOrEqual(width);
    }
  }
});
test("corrupted storage and failed images never prevent a fresh draft", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "five-run.run.v1",
      '{"rulesVersion":"1","catalogVersion":"1","status":"draft"}',
    ),
  );
  await page.reload();
  await expect(page.locator(".hero")).toBeVisible();
  await page.route("**/portraits/**", (r) => r.abort());
  await page.locator("[data-action=new]").click();
  if (await page.locator("[data-action=close-modal]").count())
    await page.locator("button[data-action=close-modal]").first().click();
  await page.locator(".player-card").first().click();
  await expect(page.locator("[data-action=confirm-player]")).toBeVisible();
});
test("championship final restores from saved result and shares its campaign", async ({
  page,
}) => {
  let champion;
  for (let seed = 0; seed < 200 && !champion; seed++) {
    let r = newRun(`champion-${seed}`);
    for (let i = 0; i < 5; i++) {
      r = offerDraft(r);
      const id = [...r.offeredPlayerIds].sort(
        (a, b) =>
          overall(players.find((p) => p.id === b)!) -
          overall(players.find((p) => p.id === a)!),
      )[0];
      r = choosePlayer(r, id);
    }
    r = startTournament(r);
    while (r.status !== "ended") r = playNext(r);
    if (r.knockout.champion === "user") {
      r.presentationCursor = r.results.length - 1;
      champion = r;
    }
  }
  expect(champion).toBeTruthy();
  await page.goto("/");
  await page.evaluate((r) => {
    localStorage.clear();
    localStorage.setItem("five-run.run.v1", JSON.stringify(r));
    localStorage.setItem(
      "five-run.settings.v1",
      JSON.stringify({
        locale: "en",
        muted: true,
        reducedMotion: true,
        simulationSpeed: 4,
        tutorialSeen: true,
        schemaVersion: 1,
      }),
    );
  }, champion);
  await page.reload();
  await page.locator("[data-action=continue]").click();
  await expect(page.locator(".scoreboard")).toBeVisible();

  await expect(page.locator("[data-action=dismiss-match]")).toBeVisible();
  await page.locator("[data-action=dismiss-match]").click();
  await expect(page.locator(".end-screen")).toContainText("CHAMPION");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as any).sharedText = text;
        },
      },
      configurable: true,
    });
  });
  await page.locator("[data-action=share]").click();
  expect(await page.evaluate(() => (window as any).sharedText)).toContain(
    "Five Run",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    animations: "disabled",
    path: "test-results/champion-1280.png",
    fullPage: true,
  });
});
