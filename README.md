# itsBarrex — tools site

The tech hub for **itsBarrex**: Streamerbot extensions, OBS plugins and apps,
with a short promo block on top. German by default with an English switch.

Angular 22, standalone components, Tailwind + SCSS tokens, **no backend and no
API key**. Published as a static site on GitHub Pages by GitHub Actions.

Built by [Vegapunk](https://barrex.stream).

> **Setting this up for the first time?** The step-by-step publishing guide is in
> German in **[ANLEITUNG.md](ANLEITUNG.md)**. Read that first. This file is the
> maintenance reference.

---

## The one idea to understand

**The tool list builds itself from your GitHub repositories.** You do not add
tools to this repo.

Put the topic **`barrex-tool`** on a public repository and it appears on the
site. Publish a GitHub Release on that repo and the version, date, changelog and
download button fill themselves in. That is the whole contract.

```
topic: barrex-tool           required — this is what opts the repo in
topic: streamerbot | obs | app   optional — sets the type shown on the card
```

No topic, no listing — a private or unfinished repo can never show up by
accident. The list is refreshed on every push, every 6 hours, and whenever you
press **Run workflow** in the Actions tab.

To write proper German copy, requirements and install steps for a tool, put a
**`tool.json`** in that tool's own repository root. Copy
[`tool.json.example`](tool.json.example) as your starting point. It is optional:
without it the site falls back to the repo description and the first paragraph of
the README, so a fresh repo still renders a correct, plain card.

**Never put a version number, release date or download URL in `tool.json`.**
Those come from GitHub Releases automatically and therefore cannot go stale.

---

## Editing the site's own text

Three files, and nothing else. No sentence and no URL is written into a
component, so you never have to read Angular code to change what the site says.

| File | What is in it |
| --- | --- |
| [`src/app/i18n/strings.ts`](src/app/i18n/strings.ts) | Every UI string, German and English |
| [`src/app/content/site.ts`](src/app/content/site.ts) | Links, handles, socials, the tab title |
| [`src/app/content/tools.ts`](src/app/content/tools.ts) | Hand-written tool copy and placeholders |

Change the text between the quote marks, keep the quote marks and the trailing
commas, commit, push. The site republishes itself in a couple of minutes.

### Both languages or the build fails

`strings.ts` holds a German map and an English map. The English one is typed
against the German one, so **a key you add to one and forget in the other is a
build error**, not an English word in the middle of a German page. Add the
string to both.

### Placeholders you need to replace

Search the content files for **`PLACEHOLDER`**. Every line we wrote that is
waiting on your real content is marked with it, including:

- `PLACEHOLDER-TONE` in `strings.ts` — the "Was ist das hier" paragraph. It is
  written to sound like you, but it is our wording. Rewrite it in your own words.
- `PLACEHOLDER-COPY` in `tools.ts` — the Phantom Mirror text, same situation.
- The two `Beispiel:` entries in `tools.ts` are filler so the grid is not empty
  before your first release. They render a visible "not a real tool yet" flag.
  **Delete both once you have two real tagged repos.**

> **Never put a password, token or API key in any of these files.** Everything
> here is published publicly as part of the site.

---

## Running it locally

Requires Node 22 or newer.

```bash
npm install
npm start              # dev server on http://localhost:4200/
npm test               # unit tests (49, Vitest on jsdom)
npm run build:pages    # production build, exactly as CI does it
node scripts/verify-pages.mjs   # serves the build the way Pages does and checks it
```

The tool list needs no network to work on: the hand-written list in `tools.ts`
renders on the first frame. To work on the release, changelog and download UI
with realistic data, copy the fixture over the generated file:

```bash
cp fixtures/tools.example.json public/tools.json    # do not commit this copy
```

To fetch the real list from GitHub yourself:

```bash
npm run tools                       # 60 requests/hour anonymously
GITHUB_TOKEN=... npm run tools      # 5000/hour with any read-only token
```

---

## Deploying

**Pushing to `main` publishes the site.** There is no manual deploy step and no
server to log into.

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on every push
to `main`, every 6 hours on a schedule, and on demand from the **Actions** tab.
It installs dependencies, runs the tests, collects the tool list from GitHub,
builds, verifies the build serves correctly under the Pages base href, scans the
output for anything that looks like a leaked credential, and publishes.

The tests and the verification gate run **before** it publishes, so a change that
breaks a link or drops a translation fails the deploy instead of shipping.

### One-time repository setup

See [ANLEITUNG.md](ANLEITUNG.md) for the full walkthrough. The two things that
are easy to miss:

1. **Settings → Pages → Source = GitHub Actions.** Without this the workflow runs
   green and nothing is ever served.
2. **`BASE_HREF` in the workflow must match the repository name.** See below.

### `BASE_HREF` — the one setting that must be right

This is the single most common way a Pages deploy fails, because it fails
*silently*: a wrong base href 404s every script and stylesheet and publishes a
blank white page **while the build still reports success**.

| Your repository | Served at | `BASE_HREF` |
| --- | --- | --- |
| `itsBarrex/itsbarrex.github.io` | `https://itsbarrex.github.io/` | `/` |
| a custom domain (e.g. `tools.barrex.stream`) | the domain root | `/` |
| any other name, e.g. `itsBarrex/tools` | `https://itsbarrex.github.io/tools/` | `/tools/` |

The workflow ships with `BASE_HREF: /`, which is correct for a
`<user>.github.io` repo and for a custom domain. If you use any other repository
name, change that one line in `.github/workflows/deploy.yml`.

`scripts/verify-pages.mjs` exists to catch exactly this mistake: it serves the
build the way Pages does and requests every asset the HTML and CSS reference, so
a base-href error fails CI instead of reaching visitors.

### Things that quietly break a deploy

These are handled already — this list is here so nobody "fixes" them back.

- **`404.html`.** Pages serves it for any path it does not recognise.
  `scripts/build-pages.mjs` copies the built `index.html` over it, so a deep link
  to `/tools/phantom-mirror` still loads the site instead of GitHub's error page.
  It has to be copied *after* the build, because `index.html` references hashed
  filenames that do not exist until then.
- **`.nojekyll`.** Stops Pages' Jekyll pass from dropping files that begin with
  an underscore.
- **Twitch `parent`.** Twitch refuses to render an embed unless the hostname
  serving the page is listed in the iframe's `parent` parameter — and it fails by
  showing a *blank box* with no error anywhere. `src/app/embed.ts` reads the real
  hostname at runtime, so localhost and the live URL both work with no
  configuration. Only add to `extraTwitchParents` in `site.ts` if some *other*
  domain will embed this page too.
- **Fonts are self-hosted** in `src/styles/fonts/` rather than loaded from
  Google. Hotlinking Google Fonts sends every visitor's IP address to Google,
  which a German court held unlawful under the GDPR — and this is a German site
  with an Impressum. Do not swap them for a `fonts.googleapis.com` link.
- **Embeds are click-to-load.** A Twitch or YouTube iframe rendered on page load
  contacts the provider and sets cookies before the visitor has chosen anything,
  which needs a consent banner. Nothing loads until a deliberate click, so the
  site needs no cookie banner at all. Do not render an embed eagerly.
- **No GitHub API calls from the browser.** Anonymous calls are capped at 60 per
  hour *per visitor IP*, and crawlers do not run JavaScript, so the page would be
  blank in search results. The API is called once per build instead.

---

## Project layout

```
src/app/i18n/strings.ts        ← every UI string, DE + EN (edit this)
src/app/i18n/language.ts       the language toggle
src/app/content/site.ts        ← links, handles, socials (edit this)
src/app/content/tools.ts       ← hand-written tool copy (edit this)
src/app/content/tool.model.ts  the tool model + how GitHub data is merged in
src/app/content/tools.service.ts  loads the generated tools.json
src/app/pages/                 home, /tools/:slug, 404
src/app/sections/              promo block, tool grid, tool card, "what is this"
src/app/layout/                header and footer
src/app/ui/                    click-to-load embeds, icons, formatting
src/app/embed.ts               Twitch/YouTube iframe URLs (parent params)
src/app/theme.ts               light/dark toggle
src/styles/_tokens.scss        design tokens — colour, type, spacing
src/styles/_fonts.scss         self-hosted Rajdhani + Space Grotesk
scripts/generate-tools.mjs     GitHub → public/tools.json (runs in CI)
scripts/build-pages.mjs        production build + 404.html + .nojekyll
scripts/verify-pages.mjs       proves the build works under the real base href
scripts/sync-index-meta.mjs    copies the title/description into index.html
fixtures/tools.example.json    the generator's output shape, used by the tests
tool.json.example              template for a tool repo's own tool.json
```

Colour, type and spacing all come from `src/styles/_tokens.scss` and are the
brand tokens from [barrex.stream](https://barrex.stream), so both sites match.
Components read those custom properties and hard-code nothing, which means a
restyle is an edit to that one file.

Tailwind is wired to the same tokens in `src/tailwind.css`, so a utility class
and a hand-written component style resolve to the same colour and both follow
the light/dark toggle.

---

## Adding a language later

v1 is a **runtime toggle**: one build, one URL, the choice remembered in
`localStorage`. The trade-off is that the language is not in the URL, so a shared
link opens in the reader's own last choice and search engines only index the
German copy.

Putting the language in the URL (`/de/`, `/en/`) needs Angular's build-time i18n
and one bundle per locale. That is a post-launch change, not a setting.

To add a third language to the current setup: add its code to `LANGUAGES` in
`src/app/i18n/language.ts`, add a matching map to `strings.ts`, and add the key
to every `{ de, en }` object in the content files. The compiler will list
everything you still have to fill in.
