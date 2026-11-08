# Portrait assets

The game ships 500 original 64×64 pixel-art SVG portraits, one per catalog player, in `public/portraits/`. They are drawn with simple geometric primitives; no reference photographs or third-party logos are distributed. The portraits are stylized interpretations, not exact likenesses.

`scripts/portrait-config.json` records the individually authored appearance and jersey parameters. Run `python3 scripts/portraits.py` from the repository to regenerate the SVGs; regeneration has been checked byte for byte against the shipped set. The configuration's render group selects the illustration palette and need not equal the game roster group.

Reference photos were consulted for appearance, including official NBA and team images and identified news or sports archives. Individual reference URLs for the 120-player research cohort are in `src/content/portraitHints.json`; the final 25 are recorded in `scripts/portrait-references-batch08.json`. Earlier cohorts were researched from player and historical team profiles, but a complete individual image-reference manifest was not retained for them. References inform hair, facial hair and accessories; they are not copied into the artwork.

The small pixel format and shared drawing vocabulary constrain likeness. The artwork has not received independent artistic approval.


## Five Run sharing identity — 2026-11-08
Original geometric artwork in `public/branding`: a pixel numeral 5 and basketball, dark court background and orange/cream palette matching the game. Created locally in SVG/CSS and rendered with Playwright by `node scripts/branding.mjs`; no third-party logos or player photos are used in these assets. The source script is the editable design. Uses the existing Press Start 2P font under the recorded OFL terms. Outputs: SVG icon; 32/180/192/512 px PNG icons; 1200×630 Open Graph PNG; 600×315 thumbnail. This records provenance and does not choose a distribution license for the project.
