import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const cdp = await page.context().newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: 1600000 / 8,
  uploadThroughput: 750000 / 8,
});
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const portraits = [];
page.on("request", (r) => {
  if (r.url().includes("/portraits/")) portraits.push(r.url());
});
const started = performance.now();
await page.goto(process.env.PERF_URL ?? "http://127.0.0.1:4173", {
  waitUntil: "domcontentloaded",
});
await page.locator("[data-action=new]").waitFor();
const interactiveMs = Math.round(performance.now() - started),
  initialPortraitRequests = portraits.length;
await page.locator("[data-action=new]").click();
if (await page.locator("button[data-action=close-modal]").count())
  await page.locator("button[data-action=close-modal]").first().click();
await page.locator(".player-card").first().waitFor();
const selectionMs = await page.evaluate(async () => {
  const start = performance.now();
  document.querySelector(".player-card").click();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  return Math.round(performance.now() - start);
});
console.log(
  JSON.stringify(
    {
      browser: browser.version(),
      viewport: "390x844 @3x",
      network: "1.6Mbps down / 0.75Mbps up /150ms latency",
      cpuSlowdown: 4,
      interactiveMs,
      selectionMs,
      initialPortraitRequests,
    },
    null,
    2,
  ),
);
await browser.close();
if (interactiveMs > 3000 || selectionMs > 100 || initialPortraitRequests !== 0)
  process.exitCode = 1;
