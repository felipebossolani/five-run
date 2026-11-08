# Five Run validation — featured draft v0.6 / rules 4

Validated on 2026-11-02, Linux x64 / Node.js 22.23.3. Active scope: `docs/prd/FIVE-RUN-DRAFT-v0.6.md`, preserving NBA v0.5 eligibility; earlier PRDs remain the decision history. No deployment or project distribution license configured.

## Delivered content and rules

- 500 distinct male players with NBA experience: 200 G, 200 F, 100 C. Every record has six editorial attributes (3,000 total), a selected peak window, bilingual style, sourced career highlights and dated achievements. Explicit male/NBA eligibility, IDs and normalized names pass validation.
- Six distinct offers per round: one from the editorial featured pool and five uniform full-pool options, shuffled together, five rounds G/G/F/F/C, no rerolls or repeated offered athletes. Cards show a short style tag and all six compact attributes; details show the full style and linked career facts.
- Twelve historical NBA identities; seven are selected and saved per run. Examples: Chicago Bulls 1996, Golden State Warriors 2017, Los Angeles Lakers 2001, Boston Celtics 1986 and Detroit Pistons 2004. All five players belong to the specified roster year and satisfy G/G/F/F/C. Individual year-specific snapshots drive both team profiles and event attribution.
- Rules version 4 / catalog version 3 invalidates incompatible runs with an explanation while keeping preferences. Draft, opponents and matches have separate seeded RNG namespaces. Options and complete results are saved before presentation. Event cursors survive reload, pause off-tab, and never affect results.
- Approved overall weights remain unchanged. Jordan remains 92 (unrounded 91.50). Two-point accuracy now uses finishing 0.45 plus shooting 0.20, preserving the original 0.65 total skill coefficient and adding medium-distance influence. The aggregate arcade model does not reproduce exact historical shot-location percentages.

## Verification

`npm run check`, `npm test` (18/18), `npm run balance` (178,000 matches), `npm run build` and `npm run e2e` (11/11 Chromium scenarios) passed. Browser coverage includes PT/EN full campaigns, six cards at 360/390/430/1280 px, long names, keyboard-accessible confirmation after scrolling, corrupt/unavailable storage, failed images, restored draft/final/event cursors, off-tab pause, language/speed/skip invariance and sharing.

Both delivered HTTP ports 4174 and 5174 were checked through the actual network origin: rules 4 / catalog 3, six cards with featured names in all five rounds and loaded team marks, seven historical opponents, identical offers after reload, insecure context and zero page errors. Seeds use `crypto.getRandomValues`, not secure-context-only `randomUUID`. Sharing tries native sharing, clipboard API, legacy copy with a checked return value, then exposes selectable text with translated instructions. Both absent APIs and failed legacy copy are covered.

| Controlled scenario | Home wins | Away wins |
| --- | ---: | ---: |
| Identical teams, 10,000 per side | 50.54% | 51.60% |
| +15 shooting | 74.69% | 74.44% |
| +15 finishing | 66.86% | 67.53% |
| +15 playmaking | 73.29% | 73.72% |
| +15 defense | 72.41% | 71.90% |
| +15 rebounding | 65.62% | 65.19% |
| +15 athleticism | 65.76% | 65.52% |
| +15 all six | 99.87% | 99.93% |

Equal-budget comparisons (3,000 alternating-side games each) range from 45.30% to 53.40%; no tested specialist dominates. This finite regression does not prove every possible roster balanced.

Production synthetic mobile profile: Chromium 156.0.8078.4; 390×844 at 3×, CPU 4× slowdown, 1.6 Mbps down / 0.75 Mbps up / 150 ms latency. First interactive screen: 1,124 ms; selection response to the next frame: 4 ms; zero initial portrait requests. Build JavaScript: 803.98 kB / 102.63 kB gzip. These are local simulated measurements, not physical-device or hosted-origin results.

## Featured discovery and team marks

Rules 4 guarantees an editorial featured name among six options each round, without changing any attribute or saved opponent strength. All 500 players remain reachable; 1,000 complete draft checks cover every record and validate no repeats, a featured name every round, shuffled placement and immutable ratings. The 30-name intergenerational pool and reasons are in the v0.6 PRD; it is independent of overall, not an external popularity ranking.

The official 7a0 research and 12,000 full-tournament comparison are in `docs/draft-research.md` and `docs/draft-audit-v4.json`. In 2,000 runs per scenario, maximum-OVR selection won 68.55% of baseline tournaments versus 79.00% with the featured draft; preferring featured names reached 74.45%, random choice 30.80%. Full-five-round featured availability rose from 0.2716% theoretically to 100% by construction. This improves fantasy roster discovery and makes the game easier; it does not establish competitive balance or reproduce human play.

The 12 historical identities reference 11 distinct current official franchise SVGs from the NBA CDN, preserving colors and aspect ratio. No logo binaries are stored in the repository. The historical year identifies the roster rather than the logo vintage; provenance and the primary rights source are in `docs/team-logos.md`. Adjacent names and fallback initials keep the interface usable when network access or CSP blocks the CDN. Mobile checks cover 360/390/430/1280 px, loaded images and no horizontal overflow. Screenshots: `test-results/logos-360.png` and `test-results/draft-360.png`.

## Sources, artwork and limits

All 500 records contain source URLs and editorial notes. Research performed during construction is separate from independent audit: `docs/scout-audit-v3.md` checks selected facts in 12 records, not all 500. A further sweep replaced 26 generic championship-index citations with verified specific sources. Facts, subjective ratings and human approval must not be conflated; see `docs/scout.md` and `docs/ratings-audit.md`.

All 500 original SVG portraits exist, are individual and can be regenerated byte for byte with `scripts/portraits.py`. No reference photographs or official logos/uniforms are distributed. Individual photo-reference URLs were retained for 145 athletes; earlier reference manifests are incomplete. Original-art provenance and the bundled font's OFL license are documented in `docs/assets.md`. The contact sheet is `docs/portraits-contact-sheet.png`.

Remaining human/environment checks: Felipe/Gabriel editorial and artistic approval; observed ordinary campaigns against the 5–10 minute target; physical iPhone Safari and Android Chrome. Playback presents actual events at 700 ms each with acceleration/skip and no artificial minimum duration. Playwright WebKit could not run because this host lacks native libraries including libevent, GStreamer and flite. Chromium mobile viewport tests do not substitute for real devices. Distribution license and eventual hosting/domain remain undecided.

## Routing

Sol coordinated domain/integration; two Terra workers researched bounded data/assets scopes; Astra advised on contracts and balance. Available IDs were used through native collaboration, explicitly mapping unavailable older skill aliases. A temporary coordinator capacity error was resumed without restarting research. No monetary cost metrics were exposed. Both workers completed their final scopes; no worker remains assigned unfinished implementation.

Official-logo correction: all 11 distinct NBA SVG endpoints were verified; focused logo unit/build checks and four browser cases passed. Real-network tests used normal headed Chromium and actual Tailscale origins at all four widths. Default headless CI uses a CDN test double because this host encounters an HTTP/2 error for those remote images. Source, dependency and commands are in `docs/team-logos.md`; draft and simulation rules were unchanged.

Weighted exposure v0.7 (2026-11-08): check, 21 tests, two focused browser cases and build passed. A 100,000-draft comparison is documented in `docs/prd/FIVE-RUN-DRAFT-v0.7.md`; Jordan is uniquely overall97 and observed in0.343%of drafts, below every other athlete. ProductionHTTP4174 serves rules5/catalog4 and restores identical six-card offers with no page errors. The already loaded preview bundle is unaffected; reload invalidates prior saves through the existing version check.


## School release preparation — 2026-11-08
21 domain/content tests and production build passed. Two focused Pages browser tests passed: the /five-run/ build loads six portraits and the local pixel font, preserves saved offers on reload, and shares the clean application URL; static HTML metadata are available with JavaScript disabled, with HTTP-verified PNG signatures and dimensions (1200×630 OG, icons 32/180/192/512). Icon and OG/thumbnail were visually inspected. Public repository visibility was confirmed; Pages was not enabled and no commit, push or deployment was performed. The social crawler preview remains pending the first public deployment.
Release-input review: 593 candidate files, 2.44 MB total, largest 286 KB; no detected secret patterns or private-network addresses. Added log exclusions to .gitignore. This pattern-based review does not certify the absence of all possible sensitive content. NBA logos remain remote references and the font OFL is retained.


## PWA — 2026-11-08
Manifest uses standalone display and relative scope/start URL; icons are the approved 192/512 artwork. Production-only service-worker registration preserves ordinary HTTP play. TypeScript check, Pages two browser tests and PWA two browser tests passed. Tests verify offline restoration of the same six saved offers, only visited portraits cached (no NBA CDN), cache prefixes separated by base path, old shell online/offline while an update waits, and the new shell after closing its predecessor tab. Installation UI and standalone behavior on physical iPhone/Android remain manual checks. Public verification follows deployment.
Public release c42d75d deployed successfully (GitHub Actions 42522643126). On https://felipebossolani.github.io/five-run/, Chromium confirmed the active service worker, manifest name Five Run/display standalone, six cached draft portraits and identical offered IDs after an offline reload; no page errors. The application and social cover are publicly accessible without Tailscale.
The first full PWA CI exposed a routed-HTTP test teardown race (response disposed while route handler was pending). HTTP and clipboard tests now wait for in-flight route handlers before page/context disposal; nine repeated focused executions passed locally. This changes test cleanup, not the deployed application.
