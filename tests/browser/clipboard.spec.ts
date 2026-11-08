import { test, expect } from "@playwright/test";
import {
  newRun,
  offerDraft,
  choosePlayer,
  startTournament,
  playNext,
} from "../../src/domain/game";

function finishedRun() {
  let run = newRun("http-copy");
  for (let i = 0; i < 5; i++) {
    run = offerDraft(run);
    run = choosePlayer(run, run.offeredPlayerIds[0]);
  }
  run = startTournament(run);
  while (run.status !== "ended") run = playNext(run);
  run.presentationCursor = run.results.length;
  run.presentationEventCursor = 0;
  return run;
}

for (const mode of ["legacy", "manual"] as const)
  test(`HTTP sharing uses ${mode} copying when native APIs are absent`, async ({
    page,
  }) => {
    await page.route("http://five-run.test/**", async (route) => {
      const url = new URL(route.request().url());
      url.host = "127.0.0.1:5174";
      await route.fulfill({ response: await route.fetch({ url: url.href }) });
    });
    await page.goto("http://five-run.test/");
    await page.evaluate((run) => {
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
    }, finishedRun());
    await page.reload();
    await page.evaluate((mode) => {
      Object.defineProperty(navigator, "share", {
        value: undefined,
        configurable: true,
      });
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });
      const original = document.execCommand.bind(document);
      document.execCommand = (command: string) => {
        const result = mode === "manual" ? false : original(command);
        (window as any).legacyCopyResult = result;
        return result;
      };
    }, mode);
    await page.locator("[data-action=continue]").click();
    await page.locator("[data-action=share]").click();
    if (mode === "legacy") {
      expect(await page.evaluate(() => (window as any).legacyCopyResult)).toBe(
        true,
      );
      await expect(page.locator(".toast")).toContainText("copied");
    } else {
      expect(await page.evaluate(() => (window as any).legacyCopyResult)).toBe(
        false,
      );
      await expect(page.locator(".manual-share-text")).toBeVisible();
      await expect(page.locator(".manual-share-text")).toHaveValue(/Five Run/);
      await expect(page.locator("[role=dialog]")).toContainText(
        "Select the text below",
      );
      await expect(page.locator(".toast")).toHaveCount(0);
    }
  });
