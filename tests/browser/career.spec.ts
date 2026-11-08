import { test, expect } from "@playwright/test";
import { newRun } from "../../src/domain/game";
import { players } from "../../src/content/catalog";

test("six long-name cards and career confirmation remain reachable on mobile by keyboard", async ({
  page,
}) => {
  const run = newRun("long-career");
  run.offeredPlayerIds = players
    .filter((p) => p.group === "G")
    .sort((a, b) => b.displayName.length - a.displayName.length)
    .slice(0, 6)
    .map((p) => p.id);
  run.offeredPlayerIds[5] = "michael-jordan";
  run.seenPlayerIds = [...run.offeredPlayerIds];
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
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
  }, run);
  await page.reload();
  await page.locator("[data-action=continue]").click();
  await expect(page.locator(".player-card")).toHaveCount(6);
  await page.locator(".player-card").first().click();
  await expect(page.locator(".career-detail")).toBeVisible();
  await expect(page.locator(".career-detail a").first()).toHaveAttribute(
    "href",
    /^https?:\/\//,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (let index = 0; index < 30; index++) {
    await page.keyboard.press("Tab");
    if (
      await page
        .locator("[data-action=confirm-player]")
        .evaluate((button) => button === document.activeElement)
    )
      break;
  }
  await expect(page.locator("[data-action=confirm-player]")).toBeFocused();
  await expect(page.locator("[data-action=confirm-player]")).toBeInViewport();
  expect(
    await page.locator("[data-action=confirm-player]").evaluate((button) => {
      const bounds = button.getBoundingClientRect();
      return (
        bounds.height >= 44 && bounds.top >= 0 && bounds.bottom <= innerHeight
      );
    }),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/career-long-360.png",
    animations: "disabled",
  });
  await page.keyboard.press("Enter");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("five-run.run.v1")!).draftRound,
    ),
  ).toBe(1);
});
