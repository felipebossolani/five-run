import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeTeamName } from "../src/domain/team-name.ts";
import { newRun, offerDraft } from "../src/domain/game.ts";
import { loadRun, loadSettings, saveRun } from "../src/persistence.ts";

test("Should_NormalizeNamesByUnicodeCodePointAndRemoveControls", () => {
  assert.equal(normalizeTeamName(null), "");
  assert.equal(normalizeTeamName("  Cafe\u0301\u0000\u202e FC\u2069  "), "Café FC");
  assert.equal(normalizeTeamName("🏀".repeat(34)), "🏀".repeat(32));
  assert.equal(normalizeTeamName("  <b>Five & Run</b>  "), "<b>Five & Run</b>");
  assert.equal(normalizeTeamName(" \u0000  "), "");
});
test("Should_KeepCustomNameAndDraftAcrossSaveAndDifficulty", () => {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) } });
  const named = offerDraft(newRun("team-name", "hard", "  Meu Café 🏀  "));
  const unnamed = offerDraft(newRun("team-name", "easy"));
  assert.equal(named.userTeamName, "Meu Café 🏀");
  assert.deepEqual(named.teams[0].name, { en: "Meu Café 🏀", "pt-BR": "Meu Café 🏀" });
  assert.deepEqual(named.offeredPlayerIds, unnamed.offeredPlayerIds);
  saveRun(named);
  assert.deepEqual(loadRun(), named);
  const tampered = structuredClone(named);
  tampered.teams[0].name.en = "Other";
  saveRun(tampered);
  assert.equal(loadRun(), null);
  (tampered as any).userTeamName = "  illegal  ";
  saveRun(tampered);
  assert.equal(loadRun(), null);
  store.set("five-run.settings.v1", JSON.stringify({ schemaVersion: 1, locale: "pt-BR", userTeamName: "  Cafe\u0301  " }));
  assert.equal(loadSettings().userTeamName, "Café");
  store.set("five-run.settings.v1", JSON.stringify({ schemaVersion: 1 }));
  assert.equal(loadSettings().userTeamName, "");
});
