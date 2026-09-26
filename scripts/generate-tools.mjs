/**
 * Builds public/tools.json from itsBarrex's GitHub repositories.
 *
 * WHY THIS RUNS AT BUILD TIME AND NOT IN THE BROWSER
 *   Unauthenticated GitHub API calls are capped at 60 per hour **per visitor
 *   IP**, and one tool page needs several. A phone on a carrier NAT would share
 *   that budget with every other customer on the same egress address and see an
 *   empty grid. Crawlers do not run JavaScript at all, so the page would be
 *   blank in search results. Doing it here means every visitor gets one static
 *   file from the CDN and GitHub is called once per build, with the workflow's
 *   own token and a 5000/hour limit.
 *
 * HOW A TOOL OPTS IN
 *   Put the topic `barrex-tool` on a public repository. That is the whole
 *   contract. No topic, no listing — so a private or unfinished repo can never
 *   appear by accident.
 *
 *   A second topic sets the type: `streamerbot`, `obs` or `app`. Missing means
 *   "Tool".
 *
 *   An optional `tool.json` in the repo root supplies the German and English
 *   text, requirements, install steps and a screenshot. See tool.json.example.
 *   Without it the repo description and README are used, so a fresh repo still
 *   renders a correct plain card.
 *
 * FAILURE POLICY
 *   A broken GitHub call must never publish an empty site. If the repo listing
 *   fails, this leaves whatever public/tools.json already contains and exits 0 —
 *   the build continues with the last good data, or with the hand-written list
 *   in src/app/content/tools.ts. Only a *successful* listing overwrites the
 *   file. A single repo that errors is skipped with a warning; the others still
 *   publish.
 *
 * USAGE
 *   node scripts/generate-tools.mjs
 *     GITHUB_TOKEN   optional; without it you get the 60/hour anonymous limit
 *     TOOLS_OWNER    defaults to githubOwner in src/app/content/site.ts
 *     TOOLS_TOPIC    defaults to barrex-tool
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = resolve(root, 'public/tools.json');
const sitePath = resolve(root, 'src/app/content/site.ts');

const API = 'https://api.github.com';
const TOPIC = process.env.TOOLS_TOPIC || 'barrex-tool';
const CATEGORY_TOPICS = ['streamerbot', 'obs', 'app'];
const MAX_CHANGELOG_ENTRIES = 10;

/** Assets we would offer as "the download", best first. */
const ASSET_PRIORITY = ['.msi', '.exe', '.zip', '.7z', '.dll', '.obs-plugin'];

const owner = process.env.TOOLS_OWNER || (await readOwnerFromSite());

/** Reads `githubOwner` out of site.ts so the account is configured in one place. */
async function readOwnerFromSite() {
  try {
    const source = await readFile(sitePath, 'utf8');
    const match = source.match(/\n\s{2}githubOwner:\s*'([^']+)'/);
    if (match) {
      return match[1];
    }
  } catch {
    // Fall through to the default below.
  }
  return 'itsBarrex';
}

const headers = {
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  'user-agent': 'itsbarrex-site-build',
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

/**
 * One GitHub request.
 *
 * `allow404` is the difference between "this tool has no release" — a normal
 * state for most of his tools right now — and a real failure. A 404 on
 * /releases/latest is information, not an error.
 */
async function api(path, { allow404 = false, raw = false } = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: raw ? { ...headers, accept: 'application/vnd.github.raw' } : headers,
  });

  if (res.status === 404 && allow404) {
    return null;
  }
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    throw new Error(
      `GitHub rate limit or forbidden on ${path} (remaining: ${remaining ?? 'unknown'}). ` +
        'Set GITHUB_TOKEN to raise the limit from 60/hour to 5000/hour.',
    );
  }
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} on ${path}`);
  }
  return raw ? res.text() : res.json();
}

/** Every public repo on the account, paginated. Topics come back by default. */
async function listRepos() {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await api(`/users/${owner}/repos?type=owner&per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }
    repos.push(...batch);
    if (batch.length < 100) {
      break;
    }
  }
  // Archived and private repos are never listed: an archived tool is not one he
  // wants people downloading, and a private one is not ours to advertise.
  return repos.filter(
    (repo) => !repo.private && !repo.archived && (repo.topics ?? []).includes(TOPIC),
  );
}

function categoryFrom(topics) {
  const found = CATEGORY_TOPICS.find((topic) => topics.includes(topic));
  return found ?? 'tool';
}

/**
 * Status when `tool.json` does not state one.
 *
 * A released tool is live; a pre-release is beta; nothing tagged yet means it is
 * still being built. This is a guess and the repo can always override it — which
 * matters for something like Phantom Mirror, which has releases but is still "In
 * Entwicklung" as far as he is concerned.
 */
function statusFrom(latestRelease) {
  if (!latestRelease) {
    return 'development';
  }
  if (latestRelease.prerelease) {
    return 'beta';
  }
  return 'live';
}

function pickAsset(release) {
  const assets = (release?.assets ?? []).filter((asset) => asset.state === 'uploaded');
  if (assets.length === 0) {
    return null;
  }
  const byPriority = [...assets].sort((a, b) => rank(a.name) - rank(b.name));
  const chosen = byPriority[0];
  return {
    url: chosen.browser_download_url,
    name: chosen.name,
    sizeBytes: typeof chosen.size === 'number' ? chosen.size : null,
  };
}

function rank(name) {
  const lower = name.toLowerCase();
  const index = ASSET_PRIORITY.findIndex((ext) => lower.endsWith(ext));
  return index === -1 ? ASSET_PRIORITY.length : index;
}

/** The repo's own tool.json, or null when it does not ship one. */
async function readToolJson(repo) {
  const text = await api(`/repos/${owner}/${repo.name}/contents/tool.json`, {
    allow404: true,
    raw: true,
  });
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    // A malformed tool.json is his typo, not a build failure. Warn loudly and
    // fall back to the repo description so the tool still lists.
    console.warn(`  ! ${repo.name}: tool.json is not valid JSON (${error.message}) — ignoring it`);
    return null;
  }
}

/**
 * First real paragraph of the README, used when there is no tool.json.
 *
 * Strips the things that open a README and mean nothing out of context: the
 * title, badge rows, HTML blocks and blockquotes. Crude on purpose — the good
 * path is a tool.json, and this only has to produce one readable sentence.
 */
function firstParagraph(readme) {
  if (!readme) {
    return '';
  }
  const lines = readme.replace(/\r\n/g, '\n').split('\n');
  const paragraph = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (paragraph.length) {
        break;
      }
      continue;
    }
    if (
      line.startsWith('#') ||
      line.startsWith('<') ||
      line.startsWith('>') ||
      line.startsWith('|') ||
      line.startsWith('---') ||
      /^\[!\[/.test(line) ||
      /^!\[/.test(line)
    ) {
      continue;
    }
    paragraph.push(line);
  }

  return paragraph
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .slice(0, 400)
    .trim();
}

/** Normalises a `{ de, en }` value from tool.json, dropping anything else. */
function localizedText(value) {
  if (typeof value === 'string') {
    return { de: value, en: value };
  }
  if (value && typeof value === 'object') {
    const out = {};
    if (typeof value.de === 'string') out.de = value.de;
    if (typeof value.en === 'string') out.en = value.en;
    return out;
  }
  return {};
}

function localizedList(value) {
  const asList = (input) => {
    if (Array.isArray(input)) {
      return input.filter((item) => typeof item === 'string');
    }
    return typeof input === 'string' ? [input] : null;
  };

  const direct = asList(value);
  if (direct) {
    return { de: direct, en: direct };
  }
  if (value && typeof value === 'object') {
    const out = {};
    const de = asList(value.de);
    const en = asList(value.en);
    if (de) out.de = de;
    if (en) out.en = en;
    return out;
  }
  return {};
}

function normaliseScreenshot(value) {
  if (!value || typeof value !== 'object' || typeof value.src !== 'string') {
    return null;
  }
  const alt = localizedText(value.alt);
  return { src: value.src, alt: { de: alt.de ?? '', en: alt.en ?? alt.de ?? '' } };
}

function normaliseVideo(value) {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string') {
    return null;
  }
  const kind = value.kind === 'twitch-clip' ? 'twitch-clip' : 'youtube';
  const title = localizedText(value.title);
  return { kind, id: value.id, title: { de: title.de ?? '', en: title.en ?? title.de ?? '' } };
}

const VALID_CATEGORIES = new Set([...CATEGORY_TOPICS, 'tool']);
const VALID_STATUSES = new Set(['live', 'beta', 'development', 'unknown']);

/** Slug rules match the router: lowercase, hyphenated, no surprises. */
function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function buildTool(repo) {
  const topics = repo.topics ?? [];
  const [latest, releases, toolJson, readme] = await Promise.all([
    api(`/repos/${owner}/${repo.name}/releases/latest`, { allow404: true }),
    api(`/repos/${owner}/${repo.name}/releases?per_page=${MAX_CHANGELOG_ENTRIES}`, {
      allow404: true,
    }),
    readToolJson(repo),
    api(`/repos/${owner}/${repo.name}/readme`, { allow404: true, raw: true }).catch(() => null),
  ]);

  const summary = localizedText(toolJson?.summary);
  const repoDescription = (repo.description ?? '').trim();

  // The repo description is the same text in both languages — it is the only
  // thing available, and a German reader seeing his English one-liner is better
  // than an empty card.
  if (!summary.de && !summary.en && repoDescription) {
    summary.de = repoDescription;
    summary.en = repoDescription;
  }

  const description = localizedList(toolJson?.description);
  if (!description.de && !description.en) {
    const paragraph = firstParagraph(readme) || repoDescription;
    if (paragraph) {
      description.de = [paragraph];
      description.en = [paragraph];
    }
  }

  const category = VALID_CATEGORIES.has(toolJson?.category)
    ? toolJson.category
    : categoryFrom(topics);
  const status = VALID_STATUSES.has(toolJson?.status) ? toolJson.status : statusFrom(latest);

  const release = latest
    ? {
        version: latest.tag_name ?? latest.name ?? '',
        publishedAt: latest.published_at ?? latest.created_at ?? '',
        url: latest.html_url ?? repo.html_url,
        download: pickAsset(latest),
      }
    : null;

  const changelog = (Array.isArray(releases) ? releases : [])
    .filter((entry) => !entry.draft)
    .map((entry) => ({
      version: entry.tag_name ?? entry.name ?? '',
      date: entry.published_at ?? entry.created_at ?? '',
      url: entry.html_url ?? repo.html_url,
      notes: (entry.body ?? '').trim(),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    slug: slugify(typeof toolJson?.slug === 'string' ? toolJson.slug : repo.name),
    name: typeof toolJson?.name === 'string' ? toolJson.name : repo.name,
    category,
    status,
    repoUrl: repo.html_url,
    summary,
    description,
    requirements: localizedList(toolJson?.requirements),
    install: localizedList(toolJson?.install),
    screenshot: normaliseScreenshot(toolJson?.screenshot),
    video: normaliseVideo(toolJson?.video),
    release,
    changelog,
    hasToolJson: toolJson !== null,
  };
}

// --- main -------------------------------------------------------------------

console.log(`Collecting tools for ${owner} with topic "${TOPIC}"`);
if (!process.env.GITHUB_TOKEN) {
  console.warn('No GITHUB_TOKEN set — using the anonymous 60/hour rate limit.');
}

let repos;
try {
  repos = await listRepos();
} catch (error) {
  // The whole point of the failure policy: keep the last good file.
  console.warn(`Could not list repositories: ${error.message}`);
  console.warn(`Leaving ${outPath} as it is. The site falls back to the hand-written tool list.`);
  process.exit(0);
}

console.log(`Found ${repos.length} repo(s) carrying the topic.`);

const tools = [];
for (const repo of repos) {
  try {
    const tool = await buildTool(repo);
    tools.push(tool);
    console.log(
      `  ✓ ${tool.slug} (${tool.category}, ${tool.status})` +
        `${tool.release ? ` ${tool.release.version}` : ' no release'}` +
        `${tool.hasToolJson ? ' +tool.json' : ''}`,
    );
  } catch (error) {
    // One bad repo must not cost us the other tools.
    console.warn(`  ! ${repo.name}: skipped (${error.message})`);
  }
}

const file = {
  generatedAt: new Date().toISOString(),
  owner,
  topic: TOPIC,
  tools,
};

await writeFile(outPath, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
console.log(`Wrote ${tools.length} tool(s) to ${outPath}`);
