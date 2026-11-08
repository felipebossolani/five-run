# Ratings audit: Michael Jordan and role weights

Reviewed 2026-11-02 against the catalog and the weights in PRD §5. Ratings are editorial estimates, not measurements. The catalog's Jordan window is 1990–1992; the figures below compare different players' catalog peak windows and therefore are not a season-by-season ranking.

| Player | Group / window | Shooting | Finishing | Playmaking | Defense | Rebounding | Athleticism | Overall |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Michael Jordan | G / 1990–92 | 88 | 99 | 88 | 99 | 70 | 99 | 92 |
| Kobe Bryant | G / 2006–08 | 93 | 97 | 86 | 88 | 65 | 95 | 90 |
| Stephen Curry | G / 2015–17 | 99 | 91 | 94 | 74 | 55 | 88 | 89 |
| Magic Johnson | G / 1987–89 | 82 | 91 | 99 | 77 | 78 | 88 | 88 |
| LeBron James | F / 2012–14 | 86 | 99 | 97 | 95 | 82 | 99 | 93 |
| Hakeem Olajuwon | C / 1993–95 | 80 | 99 | 77 | 99 | 96 | 97 | 95 |
| Shaquille O'Neal | C / 1999–2001 | 45 | 99 | 78 | 92 | 96 | 99 | 90 |

Jordan's unrounded G score is 91.50: shooting 22.00, finishing 14.85, playmaking 26.40, defense 14.85, rebounding 3.50 and athleticism 9.90. The G weights are 25/15/30/15/5/10. Rounding gives 92, not 99. Comparing different positional overalls also compares different weights; it does not establish a cross-position rank.

- **Shooting conflates skills.** The PRD describes medium and long range together, while the match engine uses `shooting` for three-point frequency and accuracy. NBA's account reports 27% from three in 1991–92 and describes his six first-half threes in the 1992 Finals as an exceptional game ([NBA](https://www.nba.com/news/history-finals-moments-michael-jordan-shrug-game-1992)). His 88 is not evidence of a Curry-like three-point skill; lowering or raising it without separating medium and long distance would trade one distortion for another. Compare era-adjusted volume and accuracy, including midrange evidence, before changing this attribute.
- **Creation favors point-guard duties.** Playmaking is 30% of every G's overall, including shooting guards. Jordan's 88 reflects meaningful creation (Chicago's 1992 Finals account records 11 assists in Game 1), but a single game cannot calibrate it against Magic's 99 ([Bulls](https://www.nba.com/bulls/history/no-2-top-20-moments-1991-92-season.html)). Compare creation load, assists, turnovers and teammate context across whole windows before proposing a number. Role-weight changes need independent design and balance work; no weight changes are made here.
- **Defense and athleticism have ceiling compression.** Both are 99 for Jordan. Chicago documents his defensive assignment against Mark Price in the 1992 conference finals ([Bulls](https://www.nba.com/bulls/history/no-12-top-20-moments-1991-92-season.html)); this supports exceptional perimeter defense, not a measured 99 or a claim that it equals every center's rim protection. Awards, team context and film should be compared before any numeric revision. The same caveat applies to the athleticism maximum.
- **Finishing and rebounding represent different roles.** Jordan led the league in scoring at 30.1 points per game in 1991–92 ([NBA season review](https://api-hub.nba.com/news/history-season-review-1991-92)); scoring alone does not isolate finishing at the rim, and the 99 still needs shot-location or film support. His 70 rebounding should be compared with other guards after adjusting for role and era, not treated as equivalent to a center's 70.
- **Centers are scored on a different mix.** C weights are 10/25/5/25/25/10: finishing, defense and rebounding total 75%, versus 35% for G. Hakeem's 95 does not by itself prove a better all-around player than Jordan's 92; this model values center responsibilities differently. Likewise, center playmaking has only 5% influence on the displayed number even though the simulation consumes all six attributes.

Recommendation: retain the current six values pending a documented comparative scout. Prioritize resolving the shooting-to-three-point mismatch and defining role-aware comparison cohorts before changing ratings; do not force an overall of 99. No catalog ratings or simulation rules were changed by this audit.

## Implementation follow-up — rules version 2

The integration addresses medium-distance shooting without adding another attribute: two-point accuracy now allocates its original 0.65 offensive skill coefficient between finishing (0.45) and shooting (0.20). Three-point behavior remains an arcade approximation driven by the aggregate shooting attribute; it does not reproduce Jordan's historical three-point percentage or any full shot-location profile. The approved overall weights and Jordan's six editorial ratings remain unchanged.

The 178,000-match regression passes after this change. Identical teams win 51.01% and 51.15% across starting sides, within the 47–53% tolerance. Increasing any single attribute improves expected wins. Equal-budget pairwise comparisons range from 44.03% to 54.00%, without a dominant specialist in the tested cohorts.

## Product calibration — catalog version 4, 2026-11-08

At Felipe's request, Jordan's six editorial game values are now shooting 97, finishing 99, playmaking 97, defense 99, rebounding 85 and athleticism 99. The unchanged guard weights produce 97.20 before rounding and 97 overall. This is an intentional product calibration; the sources above substantiate career context and honors, not these numerical values. The earlier audit and its 92 overall describe catalog version 3 and remain historical context. Historical opponent season snapshots are separate and were not changed by this calibration.
