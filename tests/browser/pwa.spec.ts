import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

let server: Server;
let output: string;
let origin: string;
let workerRevision = "";
test.beforeAll(async () => {
  output = mkdtempSync(join(tmpdir(), "five-run-pwa-"));
  const build = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--outDir", output], { env: { ...process.env, VITE_BASE_PATH: "/five-run/" }, encoding: "utf8" });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);
  const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".png": "image/png", ".webmanifest": "application/manifest+json" };
  server = createServer((req, res) => {
    const path = new URL(req.url!, "http://localhost").pathname;
    if (!path.startsWith("/five-run/") || path.includes("..")) { res.writeHead(404).end(); return; }
    const file = join(output, path.slice("/five-run/".length) || "index.html");
    try { res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream"); res.setHeader("Cache-Control", "no-store"); const bytes = readFileSync(file);
      if (workerRevision && path.endsWith("/sw.js")) res.end(bytes.toString().replace(/const CACHE = PREFIX \+ "[a-f0-9]+";/, 'const CACHE = PREFIX + "test-update";') + workerRevision);
      else if (workerRevision && (path === "/five-run/" || path.endsWith("/index.html"))) res.end(bytes.toString().replace("</head>", '<meta name="test-update" content="new"></head>'));
      else res.end(bytes); } catch { res.writeHead(404).end(); }
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No server address");
  origin = `http://127.0.0.1:${address.port}`;
});
test.afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  if (output) rmSync(output, { recursive: true, force: true });
});

test("installed shell preserves saved draft offline and caches only viewed portraits", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/five-run/`);
  const manifest = await (await context.request.get(`${origin}/five-run/manifest.webmanifest`)).json();
  expect(manifest).toMatchObject({ name: "Five Run", id: "./", start_url: "./", scope: "./", display: "standalone" });
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(["192x192", "512x512"]);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("five-run.settings.v1", JSON.stringify({ locale: "en", muted: true, reducedMotion: true, simulationSpeed: 4, tutorialSeen: true, schemaVersion: 1 })); });
  await page.reload();
  await page.locator("[data-action=new]").click();
  const cards = page.locator(".player-card");
  await expect(cards).toHaveCount(6);
  const ids = await cards.evaluateAll(elements => elements.map(element => (element as HTMLElement).dataset.id));
  await expect.poll(() => page.evaluate(async () => { const entries = await Promise.all((await caches.keys()).map(async key => (await caches.open(key)).keys())); return entries.flat().filter(request => new URL(request.url).pathname.includes("/portraits/")).length; })).toBe(6);
  const cacheUrls = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async key => (await caches.open(key)).keys()))).flat().map(request => request.url));
  expect(cacheUrls.every(url => new URL(url).origin === origin)).toBe(true);
  await context.setOffline(true);
  await page.goto(`${origin}/five-run/?offline=1`);
  await page.locator("[data-action=continue]").click();
  await expect(cards).toHaveCount(6);
  expect(await cards.evaluateAll(elements => elements.map(element => (element as HTMLElement).dataset.id))).toEqual(ids);
  await expect.poll(() => page.locator(".player-card .portrait img").evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await context.close();
});


test("an updated service worker waits while the existing game tab remains open", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/five-run/`);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  workerRevision = "\n// test update";
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
  await expect.poll(() => page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; return registration.waiting?.state; })).toBe("installed");
  expect(await page.evaluate(() => navigator.serviceWorker.controller?.state)).toBe("activated");
  await page.reload();
  await expect(page.locator('meta[name="test-update"]')).toHaveCount(0);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('meta[name="test-update"]')).toHaveCount(0);
  await context.setOffline(false);
  await page.close();
  await expect.poll(async () => {
    for (const worker of context.serviceWorkers()) {
      try { if (await worker.evaluate(() => self.registration.waiting === null)) return true; } catch { /* Worker may terminate during activation. */ }
    }
    return false;
  }).toBe(true);
  const next = await context.newPage();
  await next.goto(`${origin}/five-run/`);
  await expect(next.locator('meta[name="test-update"]')).toHaveAttribute("content", "new");
  workerRevision = "";
  await context.close();
});
