import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

// Runs for every Vite production build, including builds with a custom outDir.
export function serviceWorker() {
  let base;
  return {
    name: "five-run-service-worker",
    apply: "build",
    configResolved(config) { base = config.base; },
    generateBundle(_options, bundle) {
      const publicFiles = ["manifest.webmanifest", "fonts/PressStart2P-Regular.ttf", "branding/icon.svg", "branding/icon-32.png", "branding/icon-180.png", "branding/icon-192.png", "branding/icon-512.png"];
      const files = Object.keys(bundle).filter((name) => name === "index.html" || /\.(?:js|css)$/.test(name)).sort();
      const hash = createHash("sha256");
      hash.update(readFileSync(new URL(import.meta.url)));
      hash.update(base);
      for (const name of files) {
        const item = bundle[name];
        hash.update(name).update(item.type === "chunk" ? item.code : item.source);
      }
      for (const name of publicFiles) hash.update(name).update(readFileSync(`public/${name}`));
      // Portraits are lazy-cached, but changes must still invalidate an old cache.
      for (const name of readdirSync("public/portraits").sort()) hash.update(name).update(readFileSync(`public/portraits/${name}`));
      const version = hash.digest("hex").slice(0, 16);
      const precache = [base, ...files.filter((name) => name !== "index.html").map((name) => base + name), ...publicFiles.map((name) => base + name)];
      const source = `const PREFIX = "five-run-" + encodeURIComponent(${JSON.stringify(base)}) + "-";
const CACHE = PREFIX + ${JSON.stringify(version)};
const BASE = ${JSON.stringify(base)};
const PRECACHE = ${JSON.stringify(precache)};
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (request.mode === "navigate" && (url.pathname === BASE || url.pathname === BASE + "index.html")) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(BASE).then(cached => cached || fetch(request))));
    return;
  }
  if (PRECACHE.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname).then(cached => cached || fetch(request))));
    return;
  }
  if (url.pathname.startsWith(BASE + "portraits/")) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }));
  }
});`;
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}
