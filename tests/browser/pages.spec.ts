import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { newRun, offerDraft, choosePlayer, startTournament, playNext } from "../../src/domain/game";

let server: Server;
let origin: string;
let output: string;

test.beforeAll(async () => {
  output = mkdtempSync(join(tmpdir(), "five-run-pages-"));
  const build = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--outDir", output], {
    env: { ...process.env, VITE_BASE_PATH: "/five-run/" }, encoding: "utf8",
  });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);
  const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".png": "image/png" };
  server = createServer((req, res) => {
    const path = new URL(req.url!, "http://localhost").pathname;
    if (!path.startsWith("/five-run/") || path.includes("..")) { res.writeHead(404).end(); return; }
    const file = join(output, path.slice("/five-run/".length) || "index.html");
    try { res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream"); res.end(readFileSync(file)); }
    catch { res.writeHead(404).end(); }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No server address");
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  if (output) rmSync(output, { recursive: true, force: true });
});

test("Pages subpath loads portraits and font, survives reload, and shares its clean root", async ({ page }) => {
  await page.goto(`${origin}/five-run/?seed=private#run`);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale: "en", muted: true, reducedMotion: true, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1 })); });
  await page.reload();
  await page.locator("[data-action=new]").click();
  const cards = page.locator(".player-card");
  await expect(cards).toHaveCount(6);
  const offers = await cards.evaluateAll((elements) => elements.map((element) => (element as HTMLElement).dataset.id));
  const portraits = page.locator(".player-card .portrait img");
  await expect(portraits).toHaveCount(6);
  await expect.poll(() => portraits.evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0 && (image as HTMLImageElement).src.includes("/five-run/portraits/")))).toBe(true);
  await expect.poll(() => page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((font) => font.family === "Press Start 2P" && font.status === "loaded"); })).toBe(true);
  await page.reload();
  await page.locator("[data-action=continue]").click();
  expect(await cards.evaluateAll((elements) => elements.map((element) => (element as HTMLElement).dataset.id))).toEqual(offers);

  let run = newRun("pages-test");
  for (let i = 0; i < 5; i++) { run = offerDraft(run); run = choosePlayer(run, run.offeredPlayerIds[0]); }
  run = startTournament(run);
  while (run.status !== "ended") run = playNext(run);
  run.presentationCursor = run.results.length;
  run.presentationEventCursor = 0;
  await page.evaluate((saved) => localStorage.setItem("five-run.run.v1", JSON.stringify(saved)), run);
  await page.reload();
  await page.evaluate(() => { Object.defineProperty(navigator, "share", { value: undefined, configurable: true }); Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }); document.execCommand = () => false; });
  await page.locator("[data-action=continue]").click();
  await page.locator("[data-action=share]").click();
  const text = await page.locator(".manual-share-text").inputValue();
  expect(text).toContain(`${origin}/five-run/`);
  expect(text).not.toContain("seed=private");
  expect(text).not.toContain("#run");
});


test("Pages exposes crawler metadata and branding without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto(`${origin}/five-run/`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://felipebossolani.github.io/five-run/");
  for (const [property, content] of Object.entries({
    "og:url": "https://felipebossolani.github.io/five-run/",
    "og:image": "https://felipebossolani.github.io/five-run/branding/og-image.png",
    "og:image:width": "1200",
    "og:image:height": "630",
  })) await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute("content", content);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "/five-run/branding/icon.svg");
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute("href", "/five-run/branding/icon-32.png");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/five-run/branding/icon-180.png");
  for (const [name, width, height] of [["og-image.png", 1200, 630], ["icon-32.png", 32, 32], ["icon-180.png", 180, 180], ["icon-192.png", 192, 192], ["icon-512.png", 512, 512]] as const) {
    const image = await context.request.get(`${origin}/five-run/branding/${name}`);
    expect(image.status()).toBe(200);
    const bytes = await image.body();
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(bytes.readUInt32BE(16)).toBe(width);
    expect(bytes.readUInt32BE(20)).toBe(height);
  }
  await context.close();
});
