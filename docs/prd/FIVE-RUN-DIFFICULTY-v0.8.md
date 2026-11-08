# Five Run — difficulty v0.8

A new run chooses easy, medium, hard, or impossible, defaulting to medium. The selected difficulty remains fixed for that run. Settings remember the choice; existing or invalid preferences fall back to medium. Rules version 6 invalidates older runs through the existing incompatible-save notice; catalog version remains 4.

Each historical opponent receives a fixed modifier to every match attribute: easy −4, medium 0, hard +6, impossible +12. Apply the modifier after resolving the historical season snapshot (or the catalog attributes when there is no snapshot), and clamp each result to 40–99. These are explicit game mechanics, not changes to the underlying editorial ratings. They affect both team profiles and individual event selection weights. The user's team is unmodified.

Difficulty does not alter draft offers, opponent selection, random streams, or force results. The selected difficulty and the modifier for each opponent are persisted when the run is created and validated on load. Match outcomes remain probabilistic; impossible is intentionally difficult, not an automatic loss.

Before starting a run, a player may choose a team name. The preference is normalized by removing control and bidirectional embedding/isolation characters, applying Unicode NFC, trimming whitespace, and limiting the name to 32 Unicode code points. An empty name uses the existing localized default. The normalized name is saved with the run, stays fixed throughout it, and is rendered as text. It has no effect on draft or match randomness. Older or invalid settings normalize to an empty preference.

A champion may choose to take the same named quintet into a new tournament at the next difficulty (easy to medium, medium to hard, hard to impossible). This starts at team review, retaining the original draft history and players while drawing new opponents and groups and clearing results. The original run is unchanged until the new run is saved. A loss never promotes a team, and impossible has no next difficulty; promotion is always an explicit choice.
