import { players } from "../src/content/catalog.ts";
import { choosePlayer, newRun, offerDraft, overall, playNext, startTournament } from "../src/domain/game.ts";
import type { Difficulty } from "../src/domain/types.ts";
const catalog = new Map(players.map((p) => [p.id, p]));
const count = Number(process.argv[2] ?? 1000);
const modes = ["easy", "medium", "hard", "impossible"] as Difficulty[];
const selected = process.argv[3] ? modes.filter((mode) => mode === process.argv[3]) : modes;
function wilson(successes: number, total: number) {
  const p = successes / total, z = 1.96, d = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / d;
  const margin = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / d;
  return [center - margin, center + margin];
}
for (const mode of selected) {
  let titles = 0, wins = 0, games = 0;
  for (let i = 0; i < count; i++) {
    let run = newRun(`difficulty-audit-${i}`, mode);
    for (let round = 0; round < 5; round++) {
      run = offerDraft(run);
      const best = [...run.offeredPlayerIds].sort((a, b) => overall(catalog.get(b)!) - overall(catalog.get(a)!))[0];
      run = choosePlayer(run, best);
    }
    run = startTournament(run);
    while (run.status !== "ended") run = playNext(run);
    titles += Number(run.knockout.champion === "user");
    const played = run.results.filter((m) => m.homeId === "user" || m.awayId === "user");
    games += played.length;
    wins += played.filter((m) => m.winnerId === "user").length;
  }
  const titleRate = titles / count;
  const gameRate = wins / games;
  console.log(JSON.stringify({ mode, runs: count, titles, titleRate, titleWilson95Pct: wilson(titles, count), games, wins, gameRate }));
}
