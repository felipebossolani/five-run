import { test, expect } from "@playwright/test";
import { newRun, offerDraft, choosePlayer, startTournament, nextOpponent, overall, playNext } from "../../src/domain/game";
import { effectivePlayerAttributes, DIFFICULTY_MODIFIERS } from "../../src/domain/difficulty";
import type { Difficulty, Run } from "../../src/domain/types";
import { players } from "../../src/content/catalog";

test("difficulty preference survives reload without changing an active run", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale: "pt-BR", muted: true, reducedMotion: true, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1 }));
  });
  await page.reload();
  await expect(page.getByRole("radio", { name: /Médio/ })).toBeChecked();
  await page.getByRole("radio", { name: /Difícil/ }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: /Difícil/ })).toBeChecked();
  await page.reload();
  await expect(page.getByRole("radio", { name: /Difícil/ })).toBeChecked();
  await page.locator("[data-action=new]").click();
  await expect(page.locator(".run-identity .difficulty-badge")).toContainText("Difícil");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("five-run.run.v1")!).difficulty)).toBe("hard");
  await page.locator("[data-action=home]").click();
  await page.getByRole("radio", { name: /Impossível/ }).check();
  await expect(page.locator(".hero-copy .difficulty-badge")).toContainText("Difícil");
  await page.reload();
  await expect(page.getByRole("radio", { name: /Impossível/ })).toBeChecked();
  await page.locator("[data-action=language]").click();
  await expect(page.getByRole("radio", { name: /Impossible/ })).toBeChecked();
  await expect(page.locator(".hero-copy .difficulty-badge")).toContainText("Hard");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator("[data-action=continue]").click();
  await expect(page.locator(".run-identity .difficulty-badge")).toContainText("Hard");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("five-run.run.v1")!).difficulty)).toBe("hard");
});

test("historical opponents show the challenge adjustment and effective ratings", async ({ page }) => {
  let run = newRun("difficulty-ui", "hard");
  for (let i = 0; i < 5; i++) { run = offerDraft(run); run = choosePlayer(run, run.offeredPlayerIds[0]); }
  run = startTournament(run);
  const opponent = nextOpponent(run)!;
  const player = players.find(p => p.id === opponent.playerIds[0])!;
  const expected = overall({ ...player, attributes: effectivePlayerAttributes(opponent, player) });
  await page.goto("/");
  await page.evaluate((saved) => {
    localStorage.setItem("five-run.run.v1", JSON.stringify(saved));
    localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale: "en", muted: true, reducedMotion: true, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1 }));
  }, run);
  await page.reload();
  await page.locator("[data-action=continue]").click();
  await page.locator(".historical-roster summary").click();
  await expect(page.locator(".difficulty-adjustment")).toHaveText("Challenge adjustment +6");
  await expect(page.locator(".historical-roster li").first()).toContainText(`${expected} OVR`);
  while (run.status !== "ended") run = playNext(run);
  run.presentationCursor = run.results.length;
  await page.evaluate((saved) => localStorage.setItem("five-run.run.v1", JSON.stringify(saved)), run);
  await page.reload();
  await page.evaluate(() => { Object.defineProperty(navigator, "share", { value: undefined, configurable: true }); Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }); document.execCommand = () => false; });
  await page.locator("[data-action=continue]").click();
  await page.locator("[data-action=share]").click();
  await expect(page.locator(".manual-share-text")).toHaveValue(/Difficulty: Hard/);
});

test("team name is saved for the next run and stays fixed in the current one", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale: "pt-BR", muted: true, reducedMotion: true, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1 }));
  });
  await page.reload();
  const name = '<img src=x onerror=alert(1)>';
  const field = page.getByRole("textbox", { name: /Nome do time/ });
  await field.fill(name);
  await page.reload();
  await expect(field).toHaveValue(name);
  await page.locator("[data-action=new]").click();
  await expect(page.locator(".run-identity")).toContainText(name);
  await expect(page.locator(".run-identity img")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("five-run.run.v1")!).userTeamName)).toBe(name);
  await page.locator("[data-action=home]").click();
  await field.fill("12345678901234567890123456789012");
  await page.locator("[data-action=language]").click();
  await expect(page.getByRole("textbox", { name: /Team name/ })).toHaveValue("12345678901234567890123456789012");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator("[data-action=continue]").click();
  await expect(page.locator(".run-identity")).toContainText(name);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("the saved team name appears in the tournament and shared result", async ({ page }) => {
  let run = newRun("team-name-ui", "hard", "Quadra 5");
  for (let i = 0; i < 5; i++) { run = offerDraft(run); run = choosePlayer(run, run.offeredPlayerIds[0]); }
  run = startTournament(run);
  await page.goto("/");
  await page.evaluate((saved) => {
    localStorage.setItem("five-run.run.v1", JSON.stringify(saved));
    localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale: "en", muted: true, reducedMotion: true, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1 }));
  }, run);
  await page.reload();
  await page.locator("[data-action=continue]").click();
  await expect(page.locator(".versus")).toContainText("Quadra 5");
  await expect(page.locator(".own-row")).toContainText("Quadra 5");
  while (run.status !== "ended") run = playNext(run);
  run.presentationCursor = run.results.length;
  await page.evaluate((saved) => localStorage.setItem("five-run.run.v1", JSON.stringify(saved)), run);
  await page.reload();
  await page.evaluate(() => { Object.defineProperty(navigator, "share", { value: undefined, configurable: true }); Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }); document.execCommand = () => false; });
  await page.locator("[data-action=continue]").click();
  await expect(page.locator(".run-identity")).toContainText("Quadra 5");
  await page.locator("[data-action=share]").click();
  await expect(page.locator(".manual-share-text")).toHaveValue(/Team: Quadra 5/);
});

function finished(won: boolean): Run {
  const byId = new Map(players.map(player => [player.id, player]));
  for (let seed = 0; seed < 300; seed++) {
    let run = newRun(`progression-${seed}`, "easy", "Quadra 5");
    for (let i = 0; i < 5; i++) {
      run = offerDraft(run);
      const best = [...run.offeredPlayerIds].sort((a, b) => overall(byId.get(b)!) - overall(byId.get(a)!))[0];
      run = choosePlayer(run, best);
    }
    run = startTournament(run);
    while (run.status !== "ended") run = playNext(run);
    if ((run.knockout.champion === "user") === won) {
      run.presentationCursor = run.results.length;
      return run;
    }
  }
  throw new Error("Could not generate finished run");
}

async function load(page: import("@playwright/test").Page, run: Run, locale: "en" | "pt-BR") {
  await page.goto("/");
  await page.evaluate(({ run, locale }) => {
    localStorage.setItem("five-run.run.v1", JSON.stringify(run));
    localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale, muted: true, reducedMotion: true, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1 }));
  }, { run, locale });
  await page.reload();
  await page.locator("[data-action=continue]").click();
}

test("champion chooses a fresh next-level tournament with the same five and name", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const champion = finished(true);
  await load(page, champion, "pt-BR");
  await expect(page.locator("[data-action=next-difficulty]")).toContainText("Testar seu time no Médio");
  await expect(page.locator("[data-action=share]")).toBeVisible();
  await page.locator("[data-action=next-difficulty]").click();
  await expect(page.locator("[data-action=start]")).toBeVisible();
  const promoted = await page.evaluate(() => JSON.parse(localStorage.getItem("five-run.run.v1")!));
  expect(promoted.difficulty).toBe("medium");
  expect(promoted.status).toBe("review");
  expect(promoted.chosenPlayerIds).toEqual(champion.chosenPlayerIds);
  expect(promoted.seenPlayerIds).toEqual(champion.seenPlayerIds);
  expect(promoted.userTeamName).toBe("Quadra 5");
  expect(promoted.seed).not.toBe(champion.seed);
  expect(promoted.results).toEqual([]);
  await page.reload();
  await page.locator("[data-action=continue]").click();
  await expect(page.locator("[data-action=start]")).toBeVisible();
  await expect(page.locator(".run-identity")).toContainText("Quadra 5");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("next challenge is localized and absent after a loss or Impossible title", async ({ page }) => {
  const champion = finished(true);
  for (const [mode, label] of [["medium", "Test your team on Hard"], ["hard", "Test your team on Impossible"]] as const) {
    const run = structuredClone(champion);
    run.difficulty = mode;
    for (const team of run.teams) if (team.id !== "user") team.difficultyModifier = DIFFICULTY_MODIFIERS[mode];
    await load(page, run, "en");
    await expect(page.locator("[data-action=next-difficulty]")).toContainText(label);
  }
  const top = structuredClone(champion);
  top.difficulty = "impossible" as Difficulty;
  for (const team of top.teams) if (team.id !== "user") team.difficultyModifier = DIFFICULTY_MODIFIERS.impossible;
  await load(page, top, "en");
  await expect(page.locator("[data-action=next-difficulty]")).toHaveCount(0);
  await load(page, finished(false), "pt-BR");
  await expect(page.locator("[data-action=next-difficulty]")).toHaveCount(0);
});

test("reset settings restores browser defaults and preserves the saved run", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const run = offerDraft(newRun("reset-settings", "hard", "Quadra 5"));
  await page.goto("/");
  const expected = await page.evaluate(() => ({
    locale: navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  await page.evaluate(({ saved, locale, reducedMotion }) => {
    localStorage.setItem("five-run.run.v1", JSON.stringify(saved));
    localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale: locale === "en" ? "pt-BR" : "en", muted: false, reducedMotion: !reducedMotion, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1, difficulty: "impossible", userTeamName: "Another team" }));
  }, { saved: run, ...expected });
  await page.reload();
  const reset = page.locator("[data-action=reset-settings]");
  await expect(reset).toBeVisible();
  expect((await reset.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await reset.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".toast")).toHaveText(expected.locale === "pt-BR" ? "Configurações restauradas." : "Settings restored.");
  const state = await page.evaluate(() => ({ settings: JSON.parse(localStorage.getItem("five-run.settings.v1")!), run: JSON.parse(localStorage.getItem("five-run.run.v1")!) }));
  expect(state.settings).toMatchObject({ ...expected, muted: true, simulationSpeed: 1, tutorialSeen: false, difficulty: "medium", userTeamName: "" });
  expect(state.run).toEqual(run);
  await expect(page.locator('input[name="teamName"]')).toHaveValue("");
  await expect(page.locator('input[name="difficulty"][value="medium"]')).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator("[data-action=continue]").click();
  await expect(page.locator(".run-identity")).toContainText("Quadra 5");
  expect(await page.locator(".player-card").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id))).toEqual(run.offeredPlayerIds);
});
