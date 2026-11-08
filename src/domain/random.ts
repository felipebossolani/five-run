export function random(seed: string): () => number {
  let a = 2166136261;
  for (const c of seed) a = Math.imul(a ^ c.charCodeAt(0), 16777619);
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function weightedSample<T>(
  items: readonly T[],
  count: number,
  weight: (item: T) => number,
  rng: () => number,
): T[] {
  if (!Number.isInteger(count) || count < 0 || count > items.length)
    throw Error("Invalid sample size");
  const pool = items.map((item) => ({ item, weight: weight(item) }));
  if (pool.some((entry) => !Number.isFinite(entry.weight) || entry.weight <= 0))
    throw Error("Weights must be finite and positive");
  const selected: T[] = [];
  for (let draw = 0; draw < count; draw++) {
    let target = rng() * pool.reduce((sum, entry) => sum + entry.weight, 0);
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      target -= pool[i].weight;
      if (target < 0) {
        index = i;
        break;
      }
    }
    selected.push(pool.splice(index, 1)[0].item);
  }
  return selected;
}
