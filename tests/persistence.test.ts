import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  newRun,
  offerDraft,
  choosePlayer,
  startTournament,
  playNext,
} from "../src/domain/game.ts";
import {
  saveRun,
  loadRun,
  loadSettings,
  saveSettings,
  getStorageNotice,
} from "../src/persistence.ts";
const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });
});
test("Should_RestoreExactOfferedCardsAndComputedResults_When_Reloading", () => {
  let r = offerDraft(newRun("saved"));
  saveRun(r);
  assert.deepEqual(loadRun(), r);
  for (let i = 0; i < 5; i++) {
    r = offerDraft(r);
    r = choosePlayer(r, r.offeredPlayerIds[0]);
  }
  r = playNext(startTournament(r));
  saveRun(r);
  assert.deepEqual(loadRun(), r);
});
test("Should_RejectCorruptAndIncompatibleRunWithoutLosingSettings_When_Loading", () => {
  const s = loadSettings();
  s.locale = "pt-BR";
  saveSettings(s);
  store.set("five-run.run.v1", "{}");
  assert.equal(loadRun(), null);
  assert.equal(loadSettings().locale, "pt-BR");
  const r = newRun();
  r.rulesVersion = "future";
  saveRun(r);
  assert.equal(loadRun(), null);
  assert.equal(getStorageNotice(), "incompatible");
});
test("Should_RejectStructurallyInvalidRun_When_ParsingValidJson", () => {
  const r = newRun();
  (r as any).groups = { A: ["bad"] };
  saveRun(r);
  assert.equal(loadRun(), null);
  assert.equal(getStorageNotice(), "corrupt");
});
test("Should_KeepPlayingInMemory_When_StorageThrows", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw Error("storage denied");
    },
  });
  assert.equal(saveRun(newRun()), false);
  assert.equal(loadRun(), null);
  assert.equal(loadSettings().schemaVersion, 1);
  assert.equal(getStorageNotice(), "unavailable");
});
