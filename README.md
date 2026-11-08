# Five Run

Browser basketball arcade with 500 male NBA players: compare six draft options, choose five legends and challenge historical NBA champions in a short eight-team tournament. Portuguese and English, local saves, original pixel portraits, synthesized audio, no account or backend.
Each round includes a featured name from an editorial recognition pool; the other five options remain open to the full eligible catalog. Featured status changes exposure, never attributes. Official current franchise logos are referenced from the NBA CDN; their historical year identifies the roster, not the logo vintage. Loading them requires access to that external service. See the [draft research](docs/draft-research.md), [current draft rules](docs/prd/FIVE-RUN-DRAFT-v0.7.md) and [logo provenance](docs/team-logos.md).

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. `npm run build` creates static files in `dist/`; `npm run preview` serves that build.

Validation commands:

```sh
npm run check
npm test
npm run balance
npm run build
npx playwright install chromium
npm run e2e
```

With the production preview running, `npm run performance` measures a simulated mobile profile. Set `PERF_URL` if the preview uses another port. Vite/TypeScript provide the static build and checks; tsx runs domain tests; Playwright verifies browser behavior. There are no runtime dependencies.

The versioned engine, RNG, draft and tournament are in `src/domain/`. Content, localization, persistence and presentation have separate modules. The simulation uses attributes directly; overall is derived only for display. Clearing browser data removes progress. A failed storage write leaves the current session playable in memory.

Read the [active NBA scope](docs/prd/FIVE-RUN-NBA-v0.5.md), [original PRD](docs/prd/FIVE-RUN-PRD-v0.md), [validation and decisions](docs/validation.md), [scout notes](docs/scout.md) and [asset provenance](docs/assets.md). Ratings are editorial estimates supported by career sources; Felipe and Gabriel's review and observed 5–10 minute sessions remain release gates. Real iPhone Safari and Android device checks remain pending. No project distribution license has been chosen; the bundled font retains its own OFL license.

## GitHub Pages

The GitHub Actions workflow is prepared for manual deployment to GitHub Pages. See [release instructions](docs/release.md) for setup and publication. The expected URL is https://felipebossolani.github.io/five-run/; it is not yet published by this configuration.
