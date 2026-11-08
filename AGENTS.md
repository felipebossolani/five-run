# Five Run contributor instructions
The specification is `docs/prd/FIVE-RUN-PRD-v0.md`.
Apply subsequent amendments in order: `docs/prd/FIVE-RUN-EXPANSION-v0.4.md`, then `docs/prd/FIVE-RUN-NBA-v0.5.md`. The active scope is 500 male NBA players, six draft options and historical NBA franchise opponents only.
`docs/prd/FIVE-RUN-DRAFT-v0.6.md` adds one featured recognition-pool name per round plus five full-pool uniform options, with shuffled positions and unchanged attributes/opponents.

Sol coordinates and owns domain contracts/integration. Economical executors own bounded files. Astra advises on critical contracts and engine balance. Available routing maps old skill aliases to `gpt-6.1-sol`, `gpt-6.1-terra`, `gpt-6-luna`, `gpt-6-astra`; do not claim unavailable models ran.

Use TypeScript, Vite and static browser storage; no backend. Domain modules are pure and deterministic. Separate draft/opponent/match RNG streams. Save options/results before presenting. Derived overall never drives matches.

Commands: `npm ci`, `npm run dev`, `npm run check`, `npm test`, `npm run balance`, `npm run build`, `npx playwright test`.

One owner per file. No shell chaining, unrelated refactors, secrets, deployment or license selection. Ratings are editorial; source facts honestly. Record art provenance in `docs/assets.md`. Record validation and remaining human review in tasks/todo.md.

`docs/prd/FIVE-RUN-DRAFT-v0.7.md` supersedes draft exposure weights and Jordan product ratings for new rules5/catalog4 runs.
