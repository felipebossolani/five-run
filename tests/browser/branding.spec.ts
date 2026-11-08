import { test, expect } from "@playwright/test";
import {
  newRun,
  offerDraft,
  choosePlayer,
  startTournament,
} from "../../src/domain/game";

const liveOfficialLogos = process.env.LIVE_NBA_LOGOS === "1";
function tournamentRun() {
  let run = newRun("logo-mobile");
  for (let i = 0; i < 5; i++) {
    run = offerDraft(run);
    run = choosePlayer(run, run.offeredPlayerIds[0]);
  }
  return startTournament(run);
}
test(
  liveOfficialLogos
    ? "official franchise logos load live without mobile overflow"
    : "official logo URLs and layout work with a deterministic CDN test double",
  async ({ page }) => {
    if (!liveOfficialLogos)
      await page.route("https://cdn.nba.com/logos/nba/**", (route) =>
        route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="#d8dcdf"/></svg>',
        }),
      );
    await page.goto("/");
    for (const width of [360, 390, 430, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate((run) => {
        localStorage.clear();
        localStorage.setItem("five-run.run.v1", JSON.stringify(run));
        localStorage.setItem(
          "five-run.settings.v1",
          JSON.stringify({
            locale: "pt-BR",
            muted: true,
            reducedMotion: true,
            simulationSpeed: 4,
            tutorialSeen: true,
            schemaVersion: 1,
          }),
        );
      }, tournamentRun());
      await page.reload();
      await page.locator("[data-action=continue]").click();
      const logo = page.locator(".next-game .team-logo img");
      await expect(logo).toHaveCount(1);
      await expect
        .poll(() =>
          logo.evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
        )
        .toBe(true);
      await expect(logo).toHaveAttribute("alt", "");
      await expect(logo).toHaveAttribute(
        "src",
        /^https:\/\/cdn\.nba\.com\/logos\/nba\//,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/logos-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      await page.locator("[data-action=play-match]").click();
      await expect(page.locator(".scoreboard .team-logo")).toHaveCount(2);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .locator("[data-action=skip]")
        .evaluate((button: HTMLElement) => button.click());
      await expect(page.locator("[data-action=dismiss-match]")).toBeVisible();
    }
  },
);
test("rules migration explains the discarded run and preserves language and sound preferences", async ({
  page,
}) => {
  await page.goto("/");
  const old = offerDraft(newRun("migration"));
  old.rulesVersion = "3";
  await page.evaluate((run) => {
    localStorage.clear();
    localStorage.setItem("five-run.run.v1", JSON.stringify(run));
    localStorage.setItem(
      "five-run.settings.v1",
      JSON.stringify({
        locale: "pt-BR",
        muted: false,
        reducedMotion: true,
        simulationSpeed: 2,
        tutorialSeen: true,
        schemaVersion: 1,
      }),
    );
  }, old);
  await page.reload();
  await expect(page.locator(".toast")).toBeVisible();
  await expect(page.locator("[data-action=continue]")).toHaveCount(0);
  await expect(page.locator("[data-action=language]")).toHaveText("PT");
  await page.locator("[data-action=new]").click();
  await expect(page.locator(".player-card")).toHaveCount(6);
  await expect(
    page.locator(".player-card[data-featured=true]").first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("five-run.settings.v1")!).muted,
    ),
  ).toBe(false);
});

for (const failure of ["network", "csp"] as const)
  test(`team names and initials survive ${failure} blocking official logos`, async ({
    page,
  }) => {
    if (failure === "network")
      await page.route("https://cdn.nba.com/logos/nba/**", (route) =>
        route.abort(),
      );
    else
      await page.route("http://127.0.0.1:5174/", async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: {
            ...response.headers(),
            "content-security-policy": "img-src 'self' data:",
          },
        });
      });
    await page.goto("/");
    await page.evaluate((run) => {
      localStorage.clear();
      localStorage.setItem("five-run.run.v1", JSON.stringify(run));
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
    }, tournamentRun());
    await page.reload();
    await page.locator("[data-action=continue]").click();
    await expect(page.locator(".next-game .team-logo img")).toBeHidden();
    await expect(page.locator(".next-game .team-logo-fallback")).toBeVisible();
    await expect(page.locator(".next-game .team-logo-fallback")).not.toHaveText(
      "",
    );
    await page.locator("[data-action=play-match]").click();
    await expect(page.locator(".scoreboard")).toBeVisible();
  });
