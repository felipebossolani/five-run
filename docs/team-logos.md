# Official franchise logos

The game references current official franchise SVGs directly from the NBA CDN. No official logo binaries are copied into the repository. Sources were checked on 2026-11-02 against [NBA Teams](https://www.nba.com/teams) and [NBA Terms of Use](https://www.nba.com/termsofuse). A public image URL establishes provenance, not an open redistribution license; no project license or NBA endorsement is asserted.

The year shown in Five Run identifies the historical roster. The image is the current franchise logo, not a claim to reproduce its logo in that historical season. Both Lakers seasons therefore share the same current official mark. Colors and aspect ratios are preserved with `object-fit: contain`; images are not recolored or redrawn.

| Historical identity | Official NBA franchise ID |
| --- | --- |
| Chicago Bulls 1996 | 1610612741 |
| Golden State Warriors 2017 | 1610612744 |
| Los Angeles Lakers 2001 / 1987 | 1610612747 |
| Boston Celtics 1986 | 1610612738 |
| San Antonio Spurs 2014 | 1610612759 |
| Miami Heat 2013 | 1610612748 |
| Houston Rockets 1994 | 1610612745 |
| Detroit Pistons 2004 | 1610612765 |
| Philadelphia 76ers 1983 | 1610612755 |
| New York Knicks 1970 | 1610612752 |
| Milwaukee Bucks 1971 | 1610612749 |

Each URL follows `https://cdn.nba.com/logos/nba/<franchiseId>/primary/L/logo.svg`; the explicit mapping is in `src/ui/team-logos.ts`. All 11 distinct remote SVGs serve the 12 historical identities. The previous invented emblems were removed.

Logos depend on access to the external NBA CDN. Team names remain visible, images are decorative to screen readers, and initials provide a fallback when loading is blocked or fails. The user's Five Run identity remains its own mark. Gameplay, player attributes, draft rules and saved-run compatibility are unchanged.

## Verification

All 11 distinct official endpoints returned HTTP 200 and valid SVG. Normal Chromium 156 (headed under Xvfb) loaded the real CDN assets on the delivered HTTP origins at ports 4174 and 5174 at 360, 390, 430 and 1280 px, without horizontal overflow or page errors. Screenshots: `/tmp/five-run-official-logos-360.png` and `/tmp/five-run-official-logos-1280.png`.

Headless Chromium on this host reports `ERR_HTTP2_PROTOCOL_ERROR` against the NBA CDN, while normal headed Chromium loads it. No transport flags or proxy were added to the app. Default CI therefore tests URL mapping/layout with a deterministic external-CDN test double; separate blocked-network and CSP cases verify initials/names fallback. The real-network headed check is reproducible with `LIVE_NBA_LOGOS=1 xvfb-run -a npx playwright test tests/browser/branding.spec.ts --headed`. This distinction avoids claiming that a CI fixture proves live CDN availability.
