# Five Run — NBA / featured draft v0.6

## Weighted featured draft v0.7
- [x] Apply separate offer weights: 5× for Luka, Curry, LeBron, Bam and Giannis; 0.02× for Jordan; 1× otherwise, in both pools.
- [x] Add Luka/Bam to recognition curation and set Jordan's product-tuned attributes to derived overall 97.
- [x] Verify seeded weighted sampling, 100,000 draft exposure comparisons, rarity against every other athlete, and unchanged no-repeat/role guarantees.
- [x] Update PT/EN explanations and versioned documentation; validate check/tests/build and delivered HTTP behavior without restarting the active server.

Version policy: new runs use rules5/catalog4. The open preview tab retains its loaded bundle; reloading after the build invalidates the prior save through the existing compatibility mechanism. No legacy migration is added.

## Draft discovery, balance and team logos

- [x] Research the official 7a0 experience and publicly served resources; distinguish observed mechanics from unconfirmed hypotheses.
- [x] Measure current star visibility, best-of-six roster strength and championship outcomes against historical opponents.
- [x] Approve a simple versioned draft/balance contract before changing algorithms; keep popularity separate from attributes.
- [x] Add sourced/authorized team logos or clearly original identity artwork and integrate them accessibly.
- [x] Verify draft invariants, deterministic saves, balance, mobile UI and delivered HTTP behavior; document findings and limits.

- [x] Preserve original PRD and record amendments v0.4/v0.5, including male NBA-only eligibility.
- [x] Produce 500 sourced male NBA records: 200 G / 200 F / 100 C, 3,000 editorial attributes, career facts and bilingual styles.
- [x] Produce 500 original individualized pixel portraits; preserve generator and provenance; remove excluded assets.
- [x] Integrate six-option draft, compact comparison and sourced career details in PT/EN.
- [x] Integrate 12 historical NBA opponents with coherent rosters and individual year snapshots.
- [x] Audit Jordan/role weights and add medium-distance shooting influence without inflating overall.
- [x] Preserve HTTP-compatible seeds, deterministic saves, playback cursors, audio and share/manual-copy fallback.
- [x] Pass type/build, 18 tests, 178,000 balance matches, eleven browser scenarios and actual delivered HTTP smoke checks.
- [x] Update README, CI and validation/source/asset evidence.

## Review

500 unique IDs and names, all explicitly male/NBA, with the required 200/200/100 distribution and 500 SVGs. Excluded WNBA/non-NBA research is outside production. Both executors finished; their source and visual corrections are integrated. Independent source audit covers 12 selected records rather than claiming exhaustive verification; 26 historical citations were refined. Individual photo-reference URLs are retained for 145 portraits, with earlier manifests incomplete.

First-screen interaction measured 1,124 ms and selection 4 ms under the documented simulated mobile conditions; home requests no portraits. Both delivered HTTP ports run rules 4 / catalog 3, reveal six cards and restore the same offers without page errors. Details and limits: `docs/validation.md`.

- [ ] Felipe/Gabriel editorial and artistic approval.
- [ ] Observed 5–10 minute ordinary campaign sessions.
- [ ] Physical iPhone Safari and Android Chrome checks; local WebKit native libraries are unavailable.
- [ ] Distribution license and hosting decisions. No deploy configured.

## v0.6 review

One curated featured name per round is now guaranteed; attributes and historical opponents are unchanged. The earlier invented marks were replaced after explicit correction with current official franchise logos referenced externally from the NBA CDN; roster years and logo vintage are distinguished, with network/CSP fallback. Official 7a0 observation: weighted team-era draws, not a confirmed guaranteed-star mechanism. The 12,000-tournament comparison shows increased title rates (max OVR 68.55%→79.00%; preferring featured 74.45%), an accepted discovery/fantasy tradeoff rather than a claim of solved competitive balance. Source evidence, scripts and results are in `docs/draft-research.md`. Both workers completed their scopes.

## Official logo correction

- [x] Verify official NBA source and 11 SVG endpoints for the 12 historical identities.
- [x] Replace invented emblems with external official logos, preserving appearance and text fallback.
- [x] Remove only the 12 obsolete generated logo files and record provenance/dependency.
- [x] Validate four widths, failed loading/CSP, actual HTTP URLs and production build.

Weighted v0.7 review: rules5/catalog4 built successfully; check and 21 tests passed, plus two focused browser regressions. The 100,000-draft audit confirms Jordan is rarer than every other player (0.343% vs next minimum4.707%), five requested players have higher exposure, all500 remain observed and Jordan derives97. Production4174 passed real HTTP Play/six-card/reload smoke with zero page errors; no server restart or legacy migration was performed.


## School playtest release — 2026-11-08
- [x] Prepare manual GitHub Pages publication with subdirectory-safe assets.
- [x] Create original Five Run icon and sharing image; wire static Open Graph metadata.
- [x] Verify public repository inputs, build, sharing metadata and mobile browser flow.
- [x] Present release preview and obtain final publication approval.

### Review
Felipe approved both artworks and authorized commit, push and GitHub Pages publication on 2026-11-08. Deployment verification is in progress; no paid service or project license selection.


## Installable school playtest — 2026-11-08
- [x] Commit and push the approved initial school release.
- [x] Enable GitHub Pages and verify the public game, portraits, reload and sharing cover.
- [x] Add manifest, service worker and scoped/versioned app-shell caching.
- [x] Verify installation metadata and offline saved-draft restoration.
- [x] Commit, publish and verify the PWA at the public URL.

### Review
Initial release e832762 published successfully at https://felipebossolani.github.io/five-run/. Mobile Chromium smoke: six portraits loaded, same offers after reload, no horizontal overflow or page errors; Open Graph image returns 200. PWA subsequently published from c42d75d; public HTTPS browser smoke confirmed standalone manifest, active controller and identical saved offers after offline reload. Physical-device installation remains a manual check.
