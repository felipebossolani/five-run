# GitHub Pages release

The expected address for the `felipebossolani/five-run` repository is https://felipebossolani.github.io/five-run/. This configuration does not publish automatically.

After approval to publish:

1. Push the reviewed changes to the repository.
2. In Settings → Pages, set Build and deployment → Source to **GitHub Actions**.
3. In Actions, select **Deploy to GitHub Pages**, run the workflow manually on the intended branch, and confirm the deployment succeeds.
4. Open the expected address and verify the game, portraits, font, sharing and reload on a phone.

The workflow uses `/five-run/` as the Vite base path and deploys its build artifact. Local development and builds default to `/`; set `VITE_BASE_PATH` when building for another subpath. Pages settings and deployment are external changes and are not performed by preparing this repository.

## Sharing preview

The static HTML declares Open Graph and Twitter cards, an absolute canonical URL and a 1200×630 image at the expected public URL. These work without JavaScript after publication. While only the Tailscale preview is available, social crawlers cannot reach it; an actual WhatsApp/iMessage preview and their caches must be checked after the public release. Icons and image assets are previewable under `/branding/` locally. The icon and cover are original Five Run artwork; franchise logos remain external official NBA CDN assets.

School playtest feedback can be collected manually; this release does not introduce analytics, student accounts or a feedback service. Saved attempts remain in each browser and are not synchronized.


## Install and offline use

On Android, open the published HTTPS site in Chrome and use the browser menu's **Install app** or **Add to Home screen**. On iPhone, open it in Safari, tap Share → **Add to Home Screen**, then Add. Menu wording varies by browser version.

Open the game online first and allow its service worker to finish installing. The shell and previously viewed portraits can then load offline; new portraits require a connection and use their initials as a fallback. Official NBA CDN logos require a connection. Progress stays in local browser storage. A new version waits until existing game tabs close before activating; open tabs keep their current version, without forced reloads or clearing progress. Check installation, offline behavior, and updates on actual Android and iPhone devices before relying on them for a session.
