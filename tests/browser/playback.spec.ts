import { test, expect } from "@playwright/test";
import {
  newRun,
  offerDraft,
  choosePlayer,
  startTournament,
  playNext,
} from "../../src/domain/game";
test("event playback saves its cursor, pauses off-tab and skip preserves the result", async ({
  page,
}) => {
  let run = newRun("event-playback");
  for (let i = 0; i < 5; i++) {
    run = offerDraft(run);
    run = choosePlayer(run, run.offeredPlayerIds[0]);
  }
  run = playNext(startTournament(run));
  await page.goto("/");
  await page.evaluate((r) => {
    localStorage.clear();
    localStorage.setItem("five-run.run.v1", JSON.stringify(r));
    localStorage.setItem(
      "five-run.settings.v1",
      JSON.stringify({
        locale: "en",
        muted: true,
        reducedMotion: false,
        simulationSpeed: 1,
        tutorialSeen: true,
        schemaVersion: 1,
      }),
    );
  }, run);
  await page.reload();
  await page.locator("[data-action=continue]").click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("five-run.run.v1")!)
            .presentationEventCursor ?? 0,
      ),
    )
    .toBeGreaterThan(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const paused = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("five-run.run.v1")!)
        .presentationEventCursor,
  );
  await page.waitForTimeout(900);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("five-run.run.v1")!)
          .presentationEventCursor,
    ),
  ).toBe(paused);
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("five-run.run.v1")!)
          .presentationEventCursor,
    ),
  ).toBe(paused);
  await page.locator("[data-action=continue]").click();
  await page.locator("[data-action=language]").click();
  await page.locator("[data-action=skip]").click();
  await expect(page.locator("[data-action=dismiss-match]")).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("five-run.run.v1")!).results,
    ),
  ).toEqual(run.results);
  await page.screenshot({
    animations: "disabled",
    path: "test-results/event-result-390.png",
    fullPage: true,
  });
});
