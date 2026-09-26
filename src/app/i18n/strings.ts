/**
 * ============================================================================
 *  Every UI string on the site, in both languages
 * ============================================================================
 *
 *  German is the default and is written first. `en` must contain the same keys
 *  — it is typed as `UiStrings`, so leaving one out is a build error rather
 *  than an English page with a German word in the middle of it.
 *
 *  TO ADD A STRING
 *    1. Add the key to `de` below with the German text.
 *    2. Add the same key to `en` with the English text.
 *    3. Use it in a template as `{{ t().group.key }}`.
 *
 *  TO ADD A LANGUAGE
 *    See README.md — the short version is: add the code to `LANGUAGES` in
 *    language.ts, add an object here, and fill in the `de`/`en` maps in the
 *    content files. Tool copy lives in src/app/content/, not here.
 *
 *  Tool names, handles and URLs are NOT translated and are not in this file.
 */

/** Text shown for each tool category. Keys match `ToolCategory`. */
interface CategoryLabels {
  streamerbot: string;
  obs: string;
  app: string;
  tool: string;
}

/** Text shown for each release status. Keys match `ToolStatus`. */
interface StatusLabels {
  live: string;
  beta: string;
  development: string;
  unknown: string;
}

const de = {
  meta: {
    title: 'itsBarrex — Tools für Streamer',
    description:
      'Streamerbot-Erweiterungen, OBS-Plugins und Apps von itsBarrex. Kostenlos, quelloffen, direkt zum Download.',
  },

  header: {
    skipToContent: 'Zum Inhalt springen',
    backToTop: '— zurück nach oben',
    homeLabel: 'Startseite',
    navTools: 'Tools',
    navAbout: 'Was ist das',
    /** Accessible name of the language button. */
    languageLabel: 'Sprache wechseln',
    /** Visible text of the language button — the language it switches TO. */
    languageSwitchTo: 'EN',
    themeToDark: 'Zu dunklem Design wechseln',
    themeToLight: 'Zu hellem Design wechseln',
  },

  promo: {
    eyebrow: 'Streamerbot · OBS · Apps',
    /** One line on what he builds. */
    tagline: 'Ich baue Tools, die Streams besser aussehen und leichter laufen lassen.',
    ctaTwitch: 'Auf Twitch ansehen',
    ctaSite: 'barrex.stream',
    /**
     * The badge next to the buttons. It is a link to the channel, not a live
     * indicator: knowing whether a stream is actually live needs a Twitch API
     * credential, and this site has no backend and no secrets.
     */
    statusBadge: 'Stream-Status auf Twitch',
  },

  tools: {
    heading: 'Tools',
    blurb:
      'Alles kostenlos und direkt von GitHub. Wähle ein Tool für Systemvoraussetzungen, Installation und Download.',
    emptyHeading: 'Noch keine Tools veröffentlicht',
    emptyBody:
      'Hier erscheinen die Streamerbot-Erweiterungen und OBS-Plugins, sobald das erste Release online ist. Ankündigungen gibt es auf Discord.',
    loading: 'Tools werden geladen …',
    /**
     * Shown on a card we wrote ourselves to fill the grid before the first
     * release. It has to be unmistakable — our filler must never read as one of
     * his tools.
     */
    placeholderFlag: 'Beispiel — noch kein echtes Tool',
    /** Card action. */
    details: 'Details',
    download: 'Download',
    noRelease: 'Noch kein Release',
    version: 'Version',
    updated: 'Aktualisiert',
    category: 'Typ',
    status: 'Status',
    categories: {
      streamerbot: 'Streamerbot',
      obs: 'OBS-Plugin',
      app: 'App',
      tool: 'Tool',
    } satisfies CategoryLabels,
    statuses: {
      live: 'Live',
      beta: 'Beta',
      development: 'In Entwicklung',
      unknown: 'Unbekannt',
    } satisfies StatusLabels,
  },

  toolPage: {
    back: 'Alle Tools',
    breadcrumbLabel: 'Pfad',
    about: 'Worum es geht',
    requirements: 'Systemvoraussetzungen',
    requirementsEmpty: 'Keine besonderen Voraussetzungen angegeben.',
    install: 'Installation',
    installEmpty: 'Eine Installationsanleitung liegt im Repository.',
    downloadHeading: 'Download',
    downloadCta: 'Release herunterladen',
    /**
     * No release AND no public repository. It must not promise a source link,
     * because there is no button under it to deliver one — that was VEG-4
     * finding 1. Use `downloadNoneSource` when `repoUrl` is set.
     */
    downloadNone:
      'Für dieses Tool gibt es noch kein Release. Sobald die erste Version fertig ist, steht sie hier.',
    /** No release, but the repository is public — the source button follows. */
    downloadNoneSource:
      'Für dieses Tool gibt es noch kein Release. Der Quellcode ist trotzdem öffentlich.',
    sourceCta: 'Quellcode auf GitHub',
    /**
     * The action under `downloadNone` — nothing to download and no repository
     * either. Points at the Discord, which is where releases get announced, so
     * the panel always ends in something to do (VEG-4 finding 1).
     */
    notifyCta: 'Im Discord Bescheid bekommen',
    changelog: 'Änderungen',
    changelogEmpty: 'Noch keine Release-Notes.',
    support: 'Hilfe & Feedback',
    supportBody: 'Fragen, Bugs und Wünsche gehen am besten in den Discord.',
    supportCta: 'Discord öffnen',
    /**
     * "Schritte", not "Befehl": the button copies the numbered install steps as
     * prose, and no shell command appears anywhere on the page (VEG-4 finding 8).
     */
    copyStep: 'Schritte kopieren',
    copied: 'Kopiert',
    /** Clipboard denied, or an insecure context. Says what to do instead. */
    copyFailed: 'Kopieren nicht möglich — markiere die Schritte und kopiere sie von Hand.',
    notFoundHeading: 'Dieses Tool gibt es nicht',
    notFoundBody: 'Der Link ist alt oder das Tool wurde umbenannt. Hier sind alle aktuellen Tools.',
    screenshotAlt: 'Screenshot des Tools',
  },

  whatIsThis: {
    heading: 'Was ist das hier',
    /**
     * In his own voice. Tone reference is his Phantom Mirror page.
     * PLACEHOLDER-TONE: written to match his wording; have him confirm or
     * rewrite this paragraph before launch — it is the one bit of the page
     * that is supposed to sound like him and not like us.
     */
    body: 'Beim Streamen fehlt mir dauernd irgendein kleines Werkzeug. Also baue ich es. Was dabei herauskommt und stabil genug ist, landet hier: Streamerbot-Erweiterungen, OBS-Plugins und kleine Windows-Apps. Alles kostenlos, alles auf GitHub, alles ohne Account.',
  },

  embed: {
    /** Click-to-load placeholder. */
    loadHeading: 'Externes Video laden',
    loadBody:
      'Das Video kommt von einem fremden Server. Beim Laden werden Daten an den Anbieter übertragen.',
    loadCta: 'Video laden',
    provider: 'Anbieter',
  },

  footer: {
    socialsHeading: 'Überall sonst',
    linksHeading: 'Links',
    mainSite: 'barrex.stream',
    imprint: 'Impressum',
    copyright: '© {year} itsBarrex',
    builtBy: 'Seite von Vegapunk',
  },

  notFound: {
    heading: 'Seite nicht gefunden',
    body: 'Diese Adresse gibt es nicht. Vielleicht ist der Link alt.',
    cta: 'Zur Startseite',
  },
};

/**
 * The shape both languages must have. Derived from the German map, so German
 * is the single source of truth for which keys exist.
 */
export type UiStrings = typeof de;

const en: UiStrings = {
  meta: {
    title: 'itsBarrex — tools for streamers',
    description:
      'Streamerbot extensions, OBS plugins and apps by itsBarrex. Free, open source, download straight from GitHub.',
  },

  header: {
    skipToContent: 'Skip to content',
    backToTop: '— back to top',
    homeLabel: 'Home',
    navTools: 'Tools',
    navAbout: 'What is this',
    languageLabel: 'Change language',
    languageSwitchTo: 'DE',
    themeToDark: 'Switch to dark theme',
    themeToLight: 'Switch to light theme',
  },

  promo: {
    eyebrow: 'Streamerbot · OBS · apps',
    tagline: 'I build tools that make streams look better and run easier.',
    ctaTwitch: 'Watch on Twitch',
    ctaSite: 'barrex.stream',
    statusBadge: 'Stream status on Twitch',
  },

  tools: {
    heading: 'Tools',
    blurb:
      'All free and straight from GitHub. Pick a tool for requirements, install steps and the download.',
    emptyHeading: 'Nothing released yet',
    emptyBody:
      'The Streamerbot extensions and OBS plugins show up here as soon as the first release is out. Announcements go to Discord.',
    loading: 'Loading tools …',
    placeholderFlag: 'Example — not a real tool yet',
    details: 'Details',
    download: 'Download',
    noRelease: 'No release yet',
    version: 'Version',
    updated: 'Updated',
    category: 'Type',
    status: 'Status',
    categories: {
      streamerbot: 'Streamerbot',
      obs: 'OBS plugin',
      app: 'App',
      tool: 'Tool',
    },
    statuses: {
      live: 'Live',
      beta: 'Beta',
      development: 'In development',
      unknown: 'Unknown',
    },
  },

  toolPage: {
    back: 'All tools',
    breadcrumbLabel: 'Breadcrumb',
    about: 'What it does',
    requirements: 'Requirements',
    requirementsEmpty: 'No specific requirements listed.',
    install: 'Install',
    installEmpty: 'Install instructions are in the repository.',
    downloadHeading: 'Download',
    downloadCta: 'Download the release',
    downloadNone:
      'There is no release for this tool yet. The first version shows up here once it is ready.',
    downloadNoneSource: 'There is no release for this tool yet. The source is public all the same.',
    sourceCta: 'Source on GitHub',
    notifyCta: 'Get notified on Discord',
    changelog: 'Changelog',
    changelogEmpty: 'No release notes yet.',
    support: 'Help & feedback',
    supportBody: 'Questions, bugs and requests are best raised on Discord.',
    supportCta: 'Open Discord',
    copyStep: 'Copy steps',
    copied: 'Copied',
    copyFailed: 'Could not copy — select the steps and copy them by hand.',
    notFoundHeading: 'No such tool',
    notFoundBody: 'The link is old or the tool was renamed. Here is everything that exists now.',
    screenshotAlt: 'Screenshot of the tool',
  },

  whatIsThis: {
    heading: 'What this is',
    body: 'While streaming I keep running into some small thing I need and do not have. So I build it. Whatever comes out of that and is stable enough ends up here: Streamerbot extensions, OBS plugins and small Windows apps. All free, all on GitHub, no account needed.',
  },

  embed: {
    loadHeading: 'Load external video',
    loadBody:
      'The video is served by a third party. Loading it sends data to that provider.',
    loadCta: 'Load video',
    provider: 'Provider',
  },

  footer: {
    socialsHeading: 'Everywhere else',
    linksHeading: 'Links',
    mainSite: 'barrex.stream',
    imprint: 'Imprint',
    copyright: '© {year} itsBarrex',
    builtBy: 'Site by Vegapunk',
  },

  notFound: {
    heading: 'Page not found',
    body: 'That address does not exist. The link may be out of date.',
    cta: 'Go to the start page',
  },
};

export const ui = { de, en };
