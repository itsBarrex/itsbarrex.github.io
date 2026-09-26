import { CuratedTool } from './tool.model';

/**
 * ============================================================================
 *  The tools — ONE OBJECT PER TOOL, NOTHING ELSE TO EDIT
 * ============================================================================
 *
 *  Adding a tool here is the manual route: one object in the array below and it
 *  appears on the grid and gets its own page at /tools/<slug>. No new
 *  component, no new route, no template change.
 *
 *  THE AUTOMATIC ROUTE IS USUALLY BETTER. Put the topic `barrex-tool` on a
 *  public GitHub repo and the build picks it up on its own — name, version,
 *  release date, changelog and download all come from the latest release, and
 *  a `tool.json` in the repo root supplies the German and English text. See
 *  README.md → "Adding a tool". Use this file for
 *
 *    - a tool that has no public repo yet (so the topic has nowhere to live),
 *    - better German copy than the repo's one-line GitHub description,
 *    - a placeholder, so the grid is not empty before the first release.
 *
 *  When both exist for the same `slug` they are merged: GitHub always wins on
 *  version, date, changelog and download; the repo's own `tool.json` wins on
 *  wording; otherwise the wording below wins. See mergeTools() in
 *  tool.model.ts.
 *
 *  EVERY user-visible string needs both `de` and `en`. If you only have German,
 *  write German in both — the reader sees German instead of an empty box, which
 *  is honest about the state of the translation.
 *
 *  Never link a binary stored in this repository. Downloads come from GitHub
 *  Releases so the site stays small and the release page keeps the checksums.
 */
export const curatedTools: CuratedTool[] = [
  {
    // ---------------------------------------------------------------------
    // Phantom Mirror — the one confirmed tool.
    //
    // Confirmed with the client: Windows, overlay app for streamers, takes
    // Spout2 and NDI input, status "In Entwicklung".
    //
    // PLACEHOLDER-COPY: the sentences below were written by us to match his
    // tone, not dictated by him. He needs to confirm or rewrite them, and to
    // give us the repository so the version, download and changelog start
    // filling themselves in.
    // ---------------------------------------------------------------------
    slug: 'phantom-mirror',
    name: 'Phantom Mirror',
    category: 'app',
    status: 'development',

    summary: {
      de: 'Spiegelt jede Spout2- oder NDI-Quelle als schwebendes Fenster auf deinen zweiten Monitor.',
      en: 'Mirrors any Spout2 or NDI source into a floating window on your second monitor.',
    },

    description: {
      de: [
        'Phantom Mirror nimmt eine Spout2- oder NDI-Quelle und zeigt sie als randloses Fenster an, das du frei positionieren kannst — ohne dafür eine zweite OBS-Instanz zu starten.',
        'Gedacht für alles, was du im Auge behalten musst, während du spielst: Alerts, Chat-Overlay, ein Kamerabild oder die Szene, die gerade live ist.',
        'Windows-App, läuft neben OBS, braucht keinen Account und schickt nichts ins Internet.',
      ],
      en: [
        'Phantom Mirror takes a Spout2 or NDI source and shows it as a borderless window you can place anywhere — without starting a second OBS instance for it.',
        'Meant for whatever you need to keep an eye on while you play: alerts, a chat overlay, a camera feed, or the scene that is actually live.',
        'A Windows app that runs alongside OBS. No account, nothing sent anywhere.',
      ],
    },

    requirements: {
      de: [
        'Windows 10 oder 11 (64-Bit)',
        'OBS Studio 30 oder neuer',
        'Eine Quelle per Spout2 (OBS-Plugin) oder NDI',
        'Zweiter Monitor empfohlen, aber nicht zwingend',
      ],
      en: [
        'Windows 10 or 11 (64-bit)',
        'OBS Studio 30 or newer',
        'A source over Spout2 (OBS plugin) or NDI',
        'A second monitor is recommended but not required',
      ],
    },

    install: {
      de: [
        'Lade die aktuelle Version herunter und entpacke sie in einen Ordner deiner Wahl.',
        'Richte in OBS eine Ausgabe ein: entweder das Spout2-Plugin oder den NDI-Output.',
        'Starte PhantomMirror.exe.',
        'Wähle die Quelle aus der Liste aus und zieh das Fenster auf den Monitor, auf dem du es haben willst.',
      ],
      en: [
        'Download the current version and unpack it wherever you like.',
        'Set up an output in OBS: either the Spout2 plugin or the NDI output.',
        'Run PhantomMirror.exe.',
        'Pick your source from the list and drag the window onto the monitor you want it on.',
      ],
    },

    // No public repository yet. The moment one exists and carries the
    // `barrex-tool` topic, the build fills in version, download and changelog
    // and this line can go.
    repoUrl: '',

    // PLACEHOLDER: no screenshot delivered yet. A tool page without one still
    // renders correctly — it just loses the visual.
    screenshot: null,
    video: null,
  },

  // =======================================================================
  // PLACEHOLDERS below this line.
  //
  // They exist so the grid, the cards and the tool page template can be seen
  // and reviewed before his real tool list arrives. Every one is marked
  // `placeholder: true`, which renders a visible "Beispiel / Example" flag on
  // the card so nobody mistakes them for his work.
  //
  // DELETE THIS WHOLE BLOCK once the real tools are in. Nothing else in the
  // code refers to them.
  // =======================================================================
  {
    slug: 'beispiel-streamerbot-aktion',
    name: 'Beispiel: Streamerbot-Aktion',
    category: 'streamerbot',
    status: 'beta',
    placeholder: true,
    summary: {
      de: 'Platzhalter. Hier steht später eine echte Streamerbot-Erweiterung.',
      en: 'Placeholder. A real Streamerbot extension goes here.',
    },
    description: {
      de: [
        'Dieser Eintrag ist ein Platzhalter, damit sich das Raster und die Tool-Seite vor dem Launch ansehen lassen.',
      ],
      en: [
        'This entry is a placeholder so the grid and the tool page can be reviewed before launch.',
      ],
    },
    requirements: {
      de: ['Streamerbot 0.2.5 oder neuer'],
      en: ['Streamerbot 0.2.5 or newer'],
    },
    install: {
      de: ['Import-String kopieren.', 'In Streamerbot unter Actions → Import einfügen.'],
      en: ['Copy the import string.', 'Paste it in Streamerbot under Actions → Import.'],
    },
  },
  {
    slug: 'beispiel-obs-plugin',
    name: 'Beispiel: OBS-Plugin',
    category: 'obs',
    status: 'development',
    placeholder: true,
    summary: {
      de: 'Platzhalter. Hier steht später ein echtes OBS-Plugin.',
      en: 'Placeholder. A real OBS plugin goes here.',
    },
    description: {
      de: ['Dieser Eintrag ist ein Platzhalter und wird vor dem Launch entfernt.'],
      en: ['This entry is a placeholder and will be removed before launch.'],
    },
    requirements: {
      de: ['OBS Studio 30 oder neuer', 'Windows 10 oder 11 (64-Bit)'],
      en: ['OBS Studio 30 or newer', 'Windows 10 or 11 (64-bit)'],
    },
    install: {
      de: ['Installer ausführen.', 'OBS neu starten.'],
      en: ['Run the installer.', 'Restart OBS.'],
    },
  },
];
