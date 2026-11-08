# Five Run — weighted exposure v0.7

Requested product tuning on 2026-11-08. New runs use rules5/catalog4; the server is not restarted. An already open preview tab keeps its loaded bundle. Reloading after the update invalidates an older save through the existing compatibility check; no migration is attempted and preferences are retained.

The featured-slot and remaining five-slot draws both use seeded weighted sampling without replacement. Relative weights: Luka Dončić, Stephen Curry, LeBron James, Bam Adebayo and Giannis Antetokounmpo = 5; Michael Jordan = 0.02; every other player = 1. Luka and Bam join the featured curation, now 32 names (13 G / 12 F / 7 C). All six positions are shuffled, seen players remain excluded, and a featured option remains guaranteed each round. Weights are not literal multipliers of complete-draft probability.

Jordan's editorial product-tuned attributes are 97/99/97/99/85/99 in the standard attribute order. Existing group weights derive 97.20, displayed as 97, uniquely above the next highest overall of 95. No manual overall field or other player's ratings are changed. NBA sources substantiate career facts, not these product-tuned numbers.

`scripts/audit-weighted-draft.ts 100000` compares the previous v4 offer distribution with production v5, without simulating games. A complete draft excludes every offered card, so selection policy does not change these exposure probabilities.

| Player | Previous full-draft exposure | New exposure |
| --- | ---: | ---: |
| Luka Dončić | 5.059% | 58.577% |
| Stephen Curry | 21.030% | 59.255% |
| LeBron James | 20.941% | 59.199% |
| Bam Adebayo | 5.118% | 57.715% |
| Giannis Antetokounmpo | 21.148% | 59.435% |
| Michael Jordan | 21.033% | 0.343% |

All 500 appeared in the 100,000 seeded drafts. Jordan appeared 343 times; the least exposed other player appeared 4,707 times (4.707%), placing him below every other athlete in the batch. An exact weighted-category dynamic program gives Jordan 0.1494203% exposure in the first guard round. These are game distribution measurements, not NBA statistics or guarantees for an individual attempt.
