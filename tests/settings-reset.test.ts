import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultSettings, loadSettings, saveRun, saveSettings } from "../src/persistence.ts";
import { newRun } from "../src/domain/game.ts";

test("Should_RestoreBrowserDefaultsWithoutChangingRun_When_ResettingSettings", () => {
  const previous = Object.getOwnPropertyDescriptors(globalThis);
  const store = new Map<string, string>();
  try {
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: { language: "pt-BR" } });
    Object.defineProperty(globalThis, "matchMedia", { configurable: true, value: () => ({ matches: true }) });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) } });
    saveRun(newRun("keep-run", "hard", "Meu time"));
    const savedRun = store.get("five-run.run.v1");
    saveSettings({ ...defaultSettings(), locale: "en", muted: false, reducedMotion: false, simulationSpeed: 4, tutorialSeen: true, difficulty: "impossible", userTeamName: "Outro" });
    const defaults = defaultSettings();
    assert.equal(defaults.locale, "pt-BR");
    assert.equal(defaults.reducedMotion, true);
    assert.equal(defaults.difficulty, "medium");
    assert.equal(defaults.userTeamName, "");
    assert.equal(saveSettings(defaults), true);
    assert.deepEqual(loadSettings(), defaults);
    assert.equal(store.get("five-run.run.v1"), savedRun);
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw Error("storage denied"); } });
    assert.equal(saveSettings(defaultSettings()), false);
    assert.deepEqual(loadSettings(), defaults);
  } finally {
    for (const key of ["navigator", "matchMedia", "localStorage"] as const) {
      const descriptor = previous[key];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
