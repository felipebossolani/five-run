import {
  newRun,
  offerDraft,
  choosePlayer,
  startTournament,
  playNext,
  standings,
  nextOpponent,
  teamProfile,
  overall,
} from "../domain/game";
import { players } from "../content/catalog";
import { FEATURED_PLAYER_SET } from "../content/featured";
import {
  loadRun,
  saveRun,
  loadSettings,
  saveSettings,
  getStorageNotice,
} from "../persistence";
import type {
  Attribute,
  MatchResult,
  Player,
  Run,
  Settings,
  Team,
} from "../domain/types";
import { translate, type MessageKey } from "./i18n";
import { sound, pauseAudio } from "./audio";
import { playerTag } from "./player-tags";
import { officialTeamLogo } from "./team-logos";
import { copyText } from "./clipboard";
import { assetUrl, appUrl } from "./assetUrl";
import "./style.css";

const attributes: Attribute[] = [
  "shooting",
  "finishing",
  "playmaking",
  "defense",
  "rebounding",
  "athleticism",
];
const slots = ["G", "G", "F", "F", "C"] as const;
const byId = new Map<string, Player>(players.map((p: Player) => [p.id, p]));
const esc = (value: unknown): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] || c,
  );

export function mountApp(root: HTMLElement): void {
  let run: Run | null = loadRun();
  let settings: Settings = loadSettings();
  let screen: "home" | "game" = "home";
  let modal: "tutorial" | "abandon" | "player" | "share" | null = null;
  let selected: string | null = null;
  let shownEvents = run?.presentationEventCursor || 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let busy = false;
  let toast = "";
  let shareText = "";
  let returnFocus: { action: string; id?: string } | null = null;
  const t = (key: MessageKey) => translate(settings.locale, key);
  const player = (id: string) => byId.get(id);
  const team = (id: string) => run?.teams.find((item) => item.id === id);
  const teamName = (id: string) =>
    id === "user"
      ? t("userTeam")
      : `${team(id)?.name[settings.locale] || t("noOpponent")}${team(id)?.historical ? ` · ${team(id)!.historical!.year}` : ""}`;
  const teamMark = (
    id: string,
    size: "large" | "small" | "score" = "small",
  ) => {
    if (id === "user")
      return `<span class="team-logo team-logo-${size} own-team-logo" aria-hidden="true">5</span>`;
    const item = team(id);
    const officialLogo = officialTeamLogo(id);
    const fallback = (item?.name[settings.locale] || "?")
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("");
    return `<span class="team-logo team-logo-${size}" aria-hidden="true">${officialLogo ? `<img src="${esc(officialLogo)}" alt="" loading="lazy" onload="this.nextElementSibling.hidden=true" onerror="this.style.display='none'">` : ""}<span class="team-logo-fallback">${esc(fallback)}</span></span>`;
  };
  const groupName = (group: string) =>
    t(group === "G" ? "guard" : group === "F" ? "forward" : "center");
  const persist = () => {
    if (run && !saveRun(run)) toast = t("storageUnavailable");
  };
  const saveOptions = () => {
    if (!saveSettings(settings)) toast = t("storageUnavailable");
  };
  const pendingMatch = (): MatchResult | undefined =>
    run?.results
      .slice(run.presentationCursor)
      .find((m) => m.homeId === "user" || m.awayId === "user");
  const portrait = (p: Player, large = false) =>
    `<span class="portrait ${large ? "portrait-large" : ""}"><img src="${esc(assetUrl(p.portraitAsset))}" alt="" loading="lazy" onload="this.nextElementSibling.hidden=true" onerror="this.style.display='none'"><span class="portrait-fallback" aria-hidden="true">${esc(
      p.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join(""),
    )}</span></span>`;
  const roster = () =>
    `<div class="roster">${slots
      .map((slot, index) => {
        const p = player(run?.chosenPlayerIds[index] || "");
        return `<div class="roster-slot ${p ? "filled" : ""}"><span class="slot-label">${slot}</span><span>${p ? esc(p.displayName) : t("empty")}</span>${p ? `<b>${overall(p)}</b>` : ""}</div>`;
      })
      .join("")}</div>`;
  const brand = () =>
    `<div class="brand" aria-label="Five Run"><span>FIVE</span><strong>RUN<span class="brand-dot">.</span></strong></div>`;
  const header = () =>
    `<header class="topbar"><button class="logo-button" data-action="home" aria-label="${t("home")}">${brand()}</button><div class="top-actions"><button class="icon-button language" data-action="language" aria-label="${t("language")}">${settings.locale === "en" ? "EN" : "PT"}</button><button class="icon-button" data-action="sound" aria-label="${settings.muted ? t("soundOff") : t("soundOn")}" title="${settings.muted ? t("soundOff") : t("soundOn")}">${settings.muted ? "♫̸" : "♫"}</button></div></header>`;
  const button = (action: string, label: string, secondary = false) =>
    `<button class="button ${secondary ? "button-secondary" : "button-primary"}" data-action="${action}">${label}<span aria-hidden="true">${secondary ? "" : " ↗"}</span></button>`;
  const home = () =>
    `<main class="home-screen"><div class="hero"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> ${t("arcade")} <span> / </span> 01</div><h1>${t("heroYour")}<br><em>${t("heroFive")}.</em><br>${t("heroYour")}<br>${t("heroRun")}<span class="orange">.</span></h1><p>${t("tagline")}</p><div class="hero-actions">${run ? `${button("continue", t("continue"))}<button class="text-button" data-action="new">${t("playAgain")} →</button>` : button("new", t("play"))}${button("tutorial", t("how"), true)}</div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="ball"><i></i></div><span class="art-star star-one">✦</span><span class="art-star star-two">✳</span><div class="art-label">${t("fivePlayers")}<br><b>${t("oneTitle")}</b></div><span class="art-number">05</span></div></div><div class="home-footer"><span>${t("footerMotto")}</span><span>EST. 2026</span></div><p class="storage-note">${t("storage")}</p></main>`;
  const card = (p: Player, index: number) =>
    `<button class="player-card ${selected === p.id ? "is-selected" : ""}" data-action="inspect" data-id="${esc(p.id)}" data-featured="${FEATURED_PLAYER_SET.has(p.id)}" aria-label="${esc(p.displayName)}, ${groupName(p.group)}, ${t("overall")} ${overall(p)}${FEATURED_PLAYER_SET.has(p.id) ? `, ${t(p.id === "michael-jordan" ? "rareFeatured" : "featured")}` : ""}"><span class="card-top"><span>${String(index + 1).padStart(2, "0")} / ${t("pickLabel")}</span><span>✦</span></span>${portrait(p)}<span class="card-bottom"><span class="card-role">${p.group} / ${esc(p.countryCode)}</span><strong>${esc(p.displayName)}</strong><span class="card-style">${esc(playerTag(p, settings.locale))}</span><span class="card-stats">${attributes.map((a) => `<span aria-label="${t(a)} ${p.attributes[a]}"><small>${t(`${a}Short` as MessageKey)}</small><b>${p.attributes[a]}</b></span>`).join("")}</span><span class="card-overall"><b>${overall(p)}</b> ${t("overall")}</span><span class="featured-label">${FEATURED_PLAYER_SET.has(p.id) ? t(p.id === "michael-jordan" ? "rareFeatured" : "featured") : ""}</span></span></button>`;
  const draft = () => {
    if (!run) return "";
    const round = Math.min(run.draftRound + 1, 5);
    return `<main class="content"><div class="section-heading"><div><div class="eyebrow orange">${t("draft")} / 0${round}</div><h1>${t("pick")}<span class="orange">.</span></h1><p>${t("draftHint")}</p></div><div class="round-badge"><span>${t("round")}</span><b>${String(round).padStart(2, "0")}<small>/05</small></b></div></div><div class="progress-steps" aria-label="${t("round")} ${round} / 5">${slots.map((s, i) => `<span class="${i < round ? "active" : ""}">${s}</span>`).join("")}</div><div class="draft-cards">${run.offeredPlayerIds
      .map((id, i) => {
        const p = player(id);
        return p ? card(p, i) : "";
      })
      .join(
        "",
      )}</div><div class="section-label"><span>${t("yourFive")}</span><span>${run.chosenPlayerIds.length} / 5</span></div>${roster()}<p class="footnote">${t("estimated")}</p></main>`;
  };
  const review = () => {
    if (!run) return "";
    const profile = teamProfile(run.teams.find((x) => x.id === "user")!);
    const sorted = [...attributes].sort((a, b) => profile[b] - profile[a]);
    return `<main class="content"><div class="eyebrow orange">${t("draftComplete")} / 05</div><h1>${t("review")}<span class="orange">.</span></h1><p class="lede">${t("reviewSubtitle")}</p><div class="review-grid"><section><div class="section-label"><span>${t("yourFive")}</span><span>05 / 05</span></div>${roster()}</section><section class="profile-panel"><div class="section-label"><span>${t("teamProfile")}</span><span>${t("teamOverall")} · ${Math.round(run.chosenPlayerIds.reduce((sum, id) => sum + overall(player(id)!), 0) / run.chosenPlayerIds.length)}</span></div>${attributes.map((a) => `<div class="stat-row"><span>${t(a)}</span><div class="stat-track"><i style="width:${profile[a]}%"></i></div><b>${Math.round(profile[a])}</b></div>`).join("")}<div class="strengths"><div><small>${t("strength")}</small><b>${t(sorted[0])}</b></div><div><small>${t("weakness")}</small><b>${t(sorted[5])}</b></div></div></section></div><div class="action-row">${button("start", t("start"))}</div></main>`;
  };
  const standingsTable = (g: "A" | "B") =>
    `<section class="table-panel"><div class="section-label"><span>${t("group")} ${g}</span><span>✳</span></div><table><thead><tr><th>#</th><th>${t("team")}</th><th>${t("wins")}</th><th>${t("losses")}</th><th>${t("diff")}</th><th>${t("points")}</th></tr></thead><tbody>${
      run
        ? standings(run, g)
            .map(
              (s, i) =>
                `<tr class="${s.teamId === "user" ? "own-row" : ""}"><td>${i + 1}</td><td><span class="team-identity">${teamMark(s.teamId)}<span>${esc(teamName(s.teamId))}</span></span></td><td>${s.wins}</td><td>${s.losses}</td><td>${s.difference > 0 ? "+" : ""}${s.difference}</td><td>${s.pointsFor}</td></tr>`,
            )
            .join("")
        : ""
    }</tbody></table></section>`;
  const bracket = () =>
    `<section class="bracket-panel"><div class="section-label"><span>${t("bracket")}</span><span>✳</span></div><div class="bracket-games">${(run?.knockout.semifinals || []).map((pair) => `<div><small>${t("semifinal")}</small>${pair.map((id) => `<p><span class="team-identity">${teamMark(id)}<span>${esc(teamName(id))}</span></span></p>`).join("")}</div>`).join("")}<div><small>${t("final")}</small>${(run?.knockout.final || []).length ? run!.knockout.final.map((id) => `<p><span class="team-identity">${teamMark(id)}<span>${esc(teamName(id))}</span></span></p>`).join("") : `<p>—</p><p>—</p>`}</div></div></section>`;
  const tournament = () => {
    if (!run) return "";
    const opponent = nextOpponent(run);
    const userResults = run.results.filter(
      (m) => m.homeId === "user" || m.awayId === "user",
    );
    const wins = userResults.filter((m) => m.winnerId === "user").length;
    return `<main class="content"><div class="section-heading"><div><div class="eyebrow orange">${t("road")}</div><h1>${t("tournament")}<span class="orange">.</span></h1></div><div class="round-badge"><span>${t("record")}</span><b>${wins}<small>–${userResults.length - wins}</small></b></div></div><section class="next-game"><div class="section-label"><span>${t("next")}</span><span>${run.status === "groups" ? `${t("group")} / ${run.groupRound + 1}` : t(run.status === "semifinal" ? "semifinal" : "final")}</span></div><div class="versus"><div>${teamMark("user", "large")}<b>${t("userTeam")}</b></div><strong>VS</strong><div>${teamMark(opponent?.id || "", "large")}<b>${esc(opponent?.name[settings.locale] || t("noOpponent"))}</b></div></div>${
      opponent?.historical
        ? `<details class="historical-roster"><summary>${t("historicalRoster")} · ${opponent.historical.year}</summary><p>${t("snapshotNotice")}</p><ul>${opponent.playerIds
            .map((id) => {
              const p = player(id);
              const snapshot = opponent.attributeOverrides?.[id];
              return p
                ? `<li><b>${p.group}</b> · ${esc(p.displayName)} <strong>${overall({ ...p, attributes: snapshot?.attributes ?? p.attributes })} ${t("overall")}</strong></li>`
                : "";
            })
            .join(
              "",
            )}</ul>${opponent.historical.sources.map((url) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${t("source")}</a>`).join(" · ")}</details>`
        : ""
    }${button("play-match", t("playMatch"))}</section><div class="section-label main-label"><span>${t("standings")}</span><span>01 — 02</span></div><div class="tables">${standingsTable("A")}${standingsTable("B")}</div><p class="footnote">${t("rules")}</p>${bracket()}</main>`;
  };
  const matchView = (match: MatchResult) => {
    const events = match.events.slice(0, shownEvents);
    const done = shownEvents >= match.events.length;
    const currentPeriod = events.at(-1)?.period ?? 0;
    const hs = events
      .filter((e) => e.teamId === match.homeId)
      .reduce((sum, e) => sum + e.points, 0);
    const as = events
      .filter((e) => e.teamId === match.awayId)
      .reduce((sum, e) => sum + e.points, 0);
    const last = events.at(-1);
    const actionKey: Record<string, MessageKey> = {
      two: "eventTwo",
      three: "eventThree",
      rebound: "eventRebound",
      turnover: "eventTurnover",
    };
    const action = last
      ? t(actionKey[last.kind])
          .replace("{player}", player(last.playerId)?.displayName || "")
          .replace("{team}", teamName(last.teamId))
      : t("tipoff");
    const scorer = new Map<string, number>();
    events.forEach((e) => {
      const key = `${e.teamId}|${e.playerId}`;
      scorer.set(key, (scorer.get(key) || 0) + e.points);
    });
    const leader = [...scorer].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0];
    return `<main class="content match-content"><div class="eyebrow orange">${done ? t("result") : t("match")} / ${match.stage === "groups" ? t("group") : t(match.stage)}</div><div class="scoreboard"><div class="score-team"><div class="score-team-identity">${teamMark(match.homeId, "score")}<span>${esc(teamName(match.homeId))}</span></div><strong>${hs}</strong></div><div class="score-middle"><span>${done ? t("finalLabel") : currentPeriod >= 4 ? t("overtime") : t("quarter")}</span><b>${done ? "✳" : currentPeriod >= 4 ? currentPeriod - 3 : currentPeriod + 1}</b></div><div class="score-team"><div class="score-team-identity">${teamMark(match.awayId, "score")}<span>${esc(teamName(match.awayId))}</span></div><strong>${as}</strong></div></div><div class="court"><div class="court-center"></div><div class="court-ring left"></div><div class="court-ring right"></div><span>FIVE RUN</span></div><p class="match-event" aria-live="off">${esc(action)}</p><div class="periods">${match.periods.map((p, i) => `<div><small>${i < 4 ? `${t("quarterShort")}${i + 1}` : `${t("overtimeShort")}${i - 3}`}</small><b>${done || i < currentPeriod ? `${p.home} – ${p.away}` : "—"}</b></div>`).join("")}</div>${done ? `<section class="highlights"><div class="section-label"><span>${t("highlights")}</span><span>✳</span></div>${leader && leader[1] > 0 ? `<p>${t("topScorer")} <b>${esc(player(leader[0].split("|")[1])?.displayName || "")} (${esc(teamName(leader[0].split("|")[0]))}) · ${leader[1]} ${t("scored")}</b></p>` : ""}<p>${t("madeThrees")} <b>${events.filter((e) => e.kind === "three").length}</b></p><p>${t("rebounds")} <b>${events.filter((e) => e.kind === "rebound").length}</b></p></section>${button("dismiss-match", t("nextStep"))}` : `<div class="match-controls"><button class="button button-secondary" data-action="speed">${t("speed")} · ${settings.simulationSpeed}×</button>${button("skip", t("skip"))}</div>`}</main>`;
  };
  const ending = () => {
    if (!run) return "";
    const won = run.knockout.champion === "user";
    const games = run.results.filter(
      (m) => m.homeId === "user" || m.awayId === "user",
    );
    const victories = games.filter((m) => m.winnerId === "user").length;
    const scorers = new Map<string, number>();
    games
      .flatMap((m) => m.events)
      .filter((e) => e.teamId === "user")
      .forEach((e) =>
        scorers.set(e.playerId, (scorers.get(e.playerId) || 0) + e.points),
      );
    const leader = [...scorers].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0];
    return `<main class="content end-screen"><div class="end-emblem">${won ? "★" : "✳"}</div><div class="eyebrow orange">${won && victories === 5 && games.length === 5 ? t("perfect") : "FIVE RUN / 01"}</div><h1>${t(won ? "champion" : "eliminated")}</h1><p class="lede">${t(won ? "championText" : "eliminatedText")}</p><div class="record-box"><span>${t("record")}</span><b>${victories} – ${games.length - victories}</b></div>${leader && leader[1] > 0 ? `<div class="end-leader"><span>${t("topScorer")}</span><b>${esc(player(leader[0])?.displayName || "")} · ${leader[1]} ${t("scored")}</b></div>` : ""}<div class="section-label"><span>${t("yourFive")}</span><span>05 / 05</span></div>${roster()}<div class="end-actions">${button("share", t("share"), true)}${button("new", t("again"))}</div></main>`;
  };
  const playerModal = () => {
    const p = selected && player(selected);
    if (!p) return "";
    let country = p.countryCode;
    try {
      country =
        new Intl.DisplayNames([settings.locale], { type: "region" }).of(
          p.countryCode,
        ) || p.countryCode;
    } catch {
      /* Country code is a usable fallback. */
    }
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal player-modal" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="player-title"><button class="modal-close" data-action="close-modal" aria-label="${t("close")}">×</button><div class="player-detail-head">${portrait(p, true)}<div><div class="eyebrow orange">${groupName(p.group)} / ${esc(country)}</div><h2 id="player-title">${esc(p.displayName)}</h2><div class="detail-overall"><b>${overall(p)}</b><span>${t("overall")}</span></div></div></div>${p.description[settings.locale].trim() !== p.style[settings.locale].trim() ? `<p class="player-description">${esc(p.description[settings.locale])}</p>` : ""}<p class="peak">${t("peak")} · ${p.peakStart}–${p.peakEnd}</p><section class="career-detail"><h3>${t("playingStyle")}</h3><p>${esc(p.style?.[settings.locale] ?? p.description[settings.locale])}</p><h3>${t("careerHighlights")}</h3><ul>${(p.careerHighlights ?? []).map((stint) => `<li><b>${esc(stint.team)}</b> · ${stint.from === stint.to ? stint.from : `${stint.from}–${stint.to}`} <a href="${esc(stint.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t("source")}</a></li>`).join("")}</ul><h3>${t("achievements")}</h3><ul>${(p.achievements ?? []).map((achievement) => `<li><b>${achievement.year}</b> · ${esc(achievement.text[settings.locale])} <a href="${esc(achievement.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t("source")}</a></li>`).join("")}</ul></section><div class="detail-stats">${attributes.map((a) => `<div class="stat-row"><span>${t(a)}</span><div class="stat-track"><i style="width:${p.attributes[a]}%"></i></div><b>${p.attributes[a]}</b></div>`).join("")}</div>${button("confirm-player", t("confirm"))}</section></div>`;
  };
  const shareModal = () =>
    `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="share-title"><button class="modal-close" data-action="close-modal" aria-label="${t("close")}">×</button><h2 id="share-title">${t("share")}</h2><p id="manual-copy-hint">${t("manualCopy")}</p><textarea class="manual-share-text" readonly rows="7" aria-label="${t("share")}" aria-describedby="manual-copy-hint">${esc(shareText)}</textarea></section></div>`;
  const modalView = () =>
    modal === "share"
      ? shareModal()
      : modal === "player"
        ? playerModal()
        : modal === "tutorial"
          ? `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="${t("close")}">×</button><div class="eyebrow orange">${t("playbook")} / 01</div><h2 id="modal-title">${t("tutorialTitle")}<span class="orange">.</span></h2><ol class="tutorial-list">${[1, 2, 3, 4].map((n) => `<li><span>0${n}</span>${t(`tutorial${n}` as MessageKey)}</li>`).join("")}</ol>${button("close-modal", t("gotIt"))}</section></div>`
          : modal === "abandon"
            ? `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="modal-title"><div class="eyebrow orange">FIVE RUN / !</div><h2 id="modal-title">${t("abandonTitle")}</h2><p>${t("abandonBody")}</p><div class="modal-actions">${button("close-modal", t("cancel"), true)}${button("start-new", t("abandon"))}</div></section></div>`
            : "";
  const render = () => {
    document.documentElement.lang = settings.locale;
    document.documentElement.classList.toggle(
      "reduce-motion",
      settings.reducedMotion,
    );
    const match = screen === "game" ? pendingMatch() : undefined;
    root.innerHTML = `${header()}${screen === "home" ? home() : match ? matchView(match) : !run ? home() : run.status === "draft" ? draft() : run.status === "review" ? review() : run.status === "ended" ? ending() : tournament()}<footer class="site-footer"><span>FIVE RUN © 2026</span><button data-action="motion">${t("motion")}: ${t(settings.reducedMotion ? "on" : "off")}</button></footer>${toast || getStorageNotice() ? `<div class="toast" role="status">${esc(toast || t(getStorageNotice() === "incompatible" ? "incompatible" : getStorageNotice() === "corrupt" ? "corrupt" : "storageUnavailable"))}</div>` : ""}${modalView()}`;
  };
  const schedule = () => {
    clearTimeout(timer);
    const m = pendingMatch();
    if (
      screen !== "game" ||
      !m ||
      shownEvents >= m.events.length ||
      document.hidden
    )
      return;
    timer = setTimeout(
      () => {
        if (!run || document.hidden) return;
        shownEvents++;
        run.presentationEventCursor = shownEvents;
        persist();
        if (shownEvents % 8 === 0) sound("ball", settings.muted);
        const focusedAction = (document.activeElement as HTMLElement | null)
          ?.dataset.action;
        render();
        if (focusedAction === "speed" || focusedAction === "skip")
          root
            .querySelector<HTMLElement>(`[data-action="${focusedAction}"]`)
            ?.focus();
        schedule();
      },
      settings.reducedMotion ? 20 : 700 / Math.max(1, settings.simulationSpeed),
    );
  };
  const begin = () => {
    run = offerDraft(newRun());
    persist();
    selected = null;
    shownEvents = 0;
    modal = settings.tutorialSeen ? null : "tutorial";
    screen = "game";
    sound("electronic", settings.muted);
  };
  root.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-action]",
    );
    if (!target || busy) return;
    if (target.classList.contains("modal-backdrop") && event.target !== target)
      return;
    const action = target.dataset.action;
    if (action === "inspect" || action === "tutorial" || action === "new")
      returnFocus = { action, id: target.dataset.id };
    toast = "";
    if (action === "inspect") {
      if (modal) return;
      selected = target.dataset.id || null;
      modal = "player";
      const selectedId = selected;
      root
        .querySelectorAll(".player-card.is-selected")
        .forEach((card) => card.classList.remove("is-selected"));
      target.classList.add("is-selected");
      requestAnimationFrame(() =>
        setTimeout(() => {
          if (
            modal !== "player" ||
            selected !== selectedId ||
            screen !== "game" ||
            !target.isConnected
          )
            return;
          root.insertAdjacentHTML("beforeend", playerModal());
          root.querySelector<HTMLElement>("[role=dialog]")?.focus();
          sound("shoe", settings.muted);
        }, 0),
      );
      return;
    }
    if (action === "language") {
      settings.locale = settings.locale === "en" ? "pt-BR" : "en";
      saveOptions();
    } else if (action === "sound") {
      settings.muted = !settings.muted;
      saveOptions();
      sound("electronic", settings.muted);
    } else if (action === "motion") {
      settings.reducedMotion = !settings.reducedMotion;
      saveOptions();
    } else if (action === "home") {
      clearTimeout(timer);
      screen = "home";
      modal = null;
    } else if (action === "continue") {
      screen = "game";
      shownEvents = run?.presentationEventCursor || 0;
      schedule();
    } else if (action === "new") {
      if (run && run.status !== "ended") modal = "abandon";
      else begin();
    } else if (action === "start-new") begin();
    else if (action === "tutorial") modal = "tutorial";
    else if (action === "close-modal") {
      if (modal === "tutorial") {
        settings.tutorialSeen = true;
        saveOptions();
      }
      modal = null;
    } else if (action === "confirm-player" && run && selected) {
      busy = true;
      run = choosePlayer(run, selected);
      if (run.status === "draft") run = offerDraft(run);
      persist();
      selected = null;
      modal = null;
      sound("electronic", settings.muted);
      busy = false;
    } else if (action === "start" && run) {
      run = startTournament(run);
      persist();
      sound("crowd", settings.muted);
    } else if (action === "play-match" && run && !pendingMatch()) {
      busy = true;
      run = playNext(run);
      shownEvents = 0;
      run.presentationEventCursor = 0;
      persist();
      sound("crowd", settings.muted);
      busy = false;
      schedule();
    } else if (action === "skip") {
      const m = pendingMatch();
      if (m && run) {
        shownEvents = m.events.length;
        run.presentationEventCursor = shownEvents;
        persist();
      }
      clearTimeout(timer);
    } else if (action === "speed") {
      settings.simulationSpeed =
        settings.simulationSpeed >= 4 ? 1 : settings.simulationSpeed * 2;
      saveOptions();
      schedule();
    } else if (action === "dismiss-match" && run) {
      run.presentationCursor = run.results.length;
      run.presentationEventCursor = 0;
      persist();
      shownEvents = 0;
      clearTimeout(timer);
    } else if (action === "share" && run) {
      const games = run.results.filter(
        (m) => m.homeId === "user" || m.awayId === "user",
      );
      const w = games.filter((m) => m.winnerId === "user").length;
      const text = `${t(run.knockout.champion === "user" ? "shareChampion" : "shareEliminated")}\n${t("shareRecord")}: ${w}–${games.length - w}\n${t("shareRoster")}: ${run.chosenPlayerIds
        .map((id) => player(id)?.displayName)
        .filter(Boolean)
        .join(", ")}
${appUrl()}`;
      try {
        if (navigator.share) {
          try {
            await navigator.share({ text });
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError")
              throw error;
            if (!(await copyText(text)))
              throw new Error("Clipboard unavailable");
            toast = t("copied");
          }
        } else {
          if (!(await copyText(text))) throw new Error("Clipboard unavailable");
          toast = t("copied");
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          modal = "share";
        shareText = text;
        toast = "";
      }
    }
    render();
    if (modal) root.querySelector<HTMLElement>("[role=dialog]")?.focus();
    else if (action === "close-modal" && returnFocus) {
      const selector = `[data-action="${returnFocus.action}"]${returnFocus.id ? `[data-id="${CSS.escape(returnFocus.id)}"]` : ""}`;
      root.querySelector<HTMLElement>(selector)?.focus();
      returnFocus = null;
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timer);
      pauseAudio();
    } else schedule();
  });
  document.addEventListener("keydown", (e) => {
    if (!modal) return;
    if (e.key === "Escape") {
      modal = null;
      render();
      if (returnFocus) {
        const selector = `[data-action="${returnFocus.action}"]${returnFocus.id ? `[data-id="${CSS.escape(returnFocus.id)}"]` : ""}`;
        root.querySelector<HTMLElement>(selector)?.focus();
        returnFocus = null;
      }
      return;
    }
    if (e.key === "Tab") {
      const controls = [
        ...root.querySelectorAll<HTMLElement>(
          "[role=dialog] button:not([disabled])",
        ),
      ];
      if (!controls.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement?.getAttribute("role") === "dialog")
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  render();
}
