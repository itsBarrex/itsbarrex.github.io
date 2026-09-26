import { Lang, Localized } from '../i18n/language';

/**
 * The tool data model, and the rule for combining the two places tool data
 * comes from.
 *
 * There are two sources on purpose:
 *
 *   1. **tools.ts** — hand-written, typed, in this repo. German and English
 *      copy we control. This is what renders with no network at all, which is
 *      why the grid and a full tool page work in tests and offline.
 *
 *   2. **tools.json** — generated at build time by scripts/generate-tools.mjs
 *      from his GitHub repos carrying the `barrex-tool` topic. This is the only
 *      thing that can know the current version, the release date, the release
 *      notes and the download URL, so for those fields it always wins.
 *
 * Nothing calls the GitHub API from the browser: unauthenticated requests are
 * capped at 60/hour per visitor IP, and a crawler would index an empty page.
 */

export type ToolCategory = 'streamerbot' | 'obs' | 'app' | 'tool';
export type ToolStatus = 'live' | 'beta' | 'development' | 'unknown';

export const TOOL_CATEGORIES: readonly ToolCategory[] = ['streamerbot', 'obs', 'app', 'tool'];
export const TOOL_STATUSES: readonly ToolStatus[] = ['live', 'beta', 'development', 'unknown'];

export interface ToolScreenshot {
  /** Absolute URL, or a path inside `public/` relative to the base href. */
  src: string;
  alt: Localized<string>;
}

export type ToolVideoKind = 'youtube' | 'twitch-clip';

export interface ToolVideo {
  kind: ToolVideoKind;
  /** YouTube video id, or Twitch clip slug. Not a full URL. */
  id: string;
  title: Localized<string>;
}

export interface ToolDownload {
  url: string;
  /** Asset filename, shown on the button. */
  name: string;
  /** Bytes, or null when GitHub did not report a size. */
  sizeBytes: number | null;
}

export interface ToolRelease {
  /** Tag name as published, e.g. "v0.3.1". */
  version: string;
  /** ISO 8601 date. Rendered in the reader's locale. */
  publishedAt: string;
  /** Link to the release page on GitHub. */
  url: string;
  /** The primary downloadable asset, or null for a source-only release. */
  download: ToolDownload | null;
}

export interface ChangelogEntry {
  version: string;
  /** ISO 8601 date. */
  date: string;
  url: string;
  /** Release body as published. Rendered as plain text and bullets, never HTML. */
  notes: string;
}

/** A tool as the UI consumes it: every field resolved, nothing optional. */
export interface Tool {
  /** URL segment. `/tools/<slug>`. Lowercase, hyphenated. */
  slug: string;
  /** Product name. Not translated. */
  name: string;
  category: ToolCategory;
  status: ToolStatus;
  /** One line, shown on the grid card. */
  summary: Localized<string>;
  /** Two or three sentences, shown on the tool page. */
  description: Localized<string[]>;
  requirements: Localized<string[]>;
  /** Numbered, copy-pasteable. */
  install: Localized<string[]>;
  screenshot: ToolScreenshot | null;
  video: ToolVideo | null;
  /** Source repository, or '' when the tool has no public repo yet. */
  repoUrl: string;
  release: ToolRelease | null;
  /** Newest first. */
  changelog: ChangelogEntry[];
  /**
   * True when nothing in this entry came from GitHub — i.e. it is a
   * placeholder we wrote, not a real published tool. The card marks it so
   * nobody mistakes our filler for his work.
   */
  placeholder: boolean;
}

/**
 * A tool as written by hand in tools.ts. Everything except the identity is
 * optional, because the generator fills most of it in.
 */
export interface CuratedTool {
  slug: string;
  name: string;
  category?: ToolCategory;
  status?: ToolStatus;
  summary?: Localized<string>;
  description?: Localized<string[]>;
  requirements?: Localized<string[]>;
  install?: Localized<string[]>;
  screenshot?: ToolScreenshot | null;
  video?: ToolVideo | null;
  repoUrl?: string;
  /** Set true for content we invented to fill the grid. */
  placeholder?: boolean;
}

/** One entry in the generated tools.json. Mirrors generate-tools.mjs output. */
export interface GeneratedTool {
  slug: string;
  name: string;
  category: ToolCategory;
  status: ToolStatus;
  repoUrl: string;
  /** Repo description, used only when nothing better exists. */
  summary: Partial<Localized<string>>;
  description: Partial<Localized<string[]>>;
  requirements: Partial<Localized<string[]>>;
  install: Partial<Localized<string[]>>;
  screenshot: ToolScreenshot | null;
  video: ToolVideo | null;
  release: ToolRelease | null;
  changelog: ChangelogEntry[];
  /** True when the repo shipped a tool.json we could read. */
  hasToolJson: boolean;
}

export interface GeneratedToolsFile {
  /** ISO timestamp of the build that produced it. */
  generatedAt: string;
  owner: string;
  topic: string;
  tools: GeneratedTool[];
}

const EMPTY_TEXT: Localized<string> = { de: '', en: '' };
const EMPTY_LIST: Localized<string[]> = { de: [], en: [] };

function localizedText(
  preferred: Partial<Localized<string>> | undefined,
  fallback: Partial<Localized<string>> | undefined,
): Localized<string> {
  const pickOne = (lang: Lang) => preferred?.[lang]?.trim() || fallback?.[lang]?.trim() || '';
  // A tool with only German copy shows the German text to an English reader
  // rather than an empty card. An empty card looks broken; a German sentence
  // looks like a translation that has not happened yet, which is the truth.
  const de = pickOne('de') || pickOne('en');
  const en = pickOne('en') || pickOne('de');
  return { de, en };
}

function localizedList(
  preferred: Partial<Localized<string[]>> | undefined,
  fallback: Partial<Localized<string[]>> | undefined,
): Localized<string[]> {
  const pickOne = (lang: Lang) => {
    const value = preferred?.[lang]?.filter((line) => line.trim().length > 0);
    if (value?.length) {
      return value;
    }
    return fallback?.[lang]?.filter((line) => line.trim().length > 0) ?? [];
  };
  const de = pickOne('de').length ? pickOne('de') : pickOne('en');
  const en = pickOne('en').length ? pickOne('en') : pickOne('de');
  return { de, en };
}

/** Fills a hand-written entry out into a complete Tool. */
export function resolveCurated(curated: CuratedTool): Tool {
  return {
    slug: curated.slug,
    name: curated.name,
    category: curated.category ?? 'tool',
    status: curated.status ?? 'unknown',
    summary: localizedText(curated.summary, EMPTY_TEXT),
    description: localizedList(curated.description, EMPTY_LIST),
    requirements: localizedList(curated.requirements, EMPTY_LIST),
    install: localizedList(curated.install, EMPTY_LIST),
    screenshot: curated.screenshot ?? null,
    video: curated.video ?? null,
    repoUrl: curated.repoUrl ?? '',
    release: null,
    changelog: [],
    placeholder: curated.placeholder ?? false,
  };
}

/**
 * Combines the hand-written list with the generated one.
 *
 * Field precedence, and why:
 *
 * - **Release, changelog, repo URL** — generated always wins. Only GitHub
 *   knows the current version and the asset URL; a hand-written version number
 *   goes stale the first time he tags a release and then lies to visitors.
 * - **Copy (summary, description, requirements, install)** — a repo's own
 *   `tool.json` wins, because that is him editing his own tool. Otherwise our
 *   hand-written German wins over the repo's one-line GitHub description,
 *   which is usually English and written for developers.
 * - **Category and status** — the repo's topics win when it carries them,
 *   since that is the documented opt-in mechanism.
 *
 * A tool present in only one source is included as-is. Sorting is: real tools
 * before placeholders, then most recently released first, then by name.
 */
export function mergeTools(curated: CuratedTool[], generated: GeneratedTool[]): Tool[] {
  const byslug = new Map<string, Tool>();

  for (const entry of curated) {
    byslug.set(entry.slug, resolveCurated(entry));
  }

  for (const entry of generated) {
    const hand = byslug.get(entry.slug);
    const handCopy = hand && !hand.placeholder ? hand : undefined;
    // A repo's own tool.json outranks our copy; a bare repo does not.
    const preferRepoCopy = entry.hasToolJson;

    byslug.set(entry.slug, {
      slug: entry.slug,
      name: entry.name || hand?.name || entry.slug,
      category: entry.category,
      status: entry.status,
      summary: preferRepoCopy
        ? localizedText(entry.summary, handCopy?.summary)
        : localizedText(handCopy?.summary, entry.summary),
      description: preferRepoCopy
        ? localizedList(entry.description, handCopy?.description)
        : localizedList(handCopy?.description, entry.description),
      requirements: preferRepoCopy
        ? localizedList(entry.requirements, handCopy?.requirements)
        : localizedList(handCopy?.requirements, entry.requirements),
      install: preferRepoCopy
        ? localizedList(entry.install, handCopy?.install)
        : localizedList(handCopy?.install, entry.install),
      screenshot: entry.screenshot ?? hand?.screenshot ?? null,
      video: entry.video ?? hand?.video ?? null,
      repoUrl: entry.repoUrl || hand?.repoUrl || '',
      release: entry.release,
      changelog: entry.changelog,
      // Anything GitHub confirmed is a real tool, whatever we had written.
      placeholder: false,
    });
  }

  return [...byslug.values()].sort(compareTools);
}

function compareTools(a: Tool, b: Tool): number {
  if (a.placeholder !== b.placeholder) {
    return a.placeholder ? 1 : -1;
  }
  const aDate = a.release?.publishedAt ?? '';
  const bDate = b.release?.publishedAt ?? '';
  if (aDate !== bDate) {
    return bDate.localeCompare(aDate);
  }
  return a.name.localeCompare(b.name);
}

/**
 * Turns a release body into blocks we can render with Angular's own template
 * escaping.
 *
 * Deliberately not a markdown library and deliberately not `innerHTML`:
 * release notes are arbitrary text from a GitHub API response, so rendering
 * them as HTML would be an injection path for anything that can publish a
 * release. Headings, bullets and paragraphs cover what a changelog actually
 * uses; everything else degrades to a plain line.
 */
export type NotesBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

export function parseNotes(notes: string): NotesBlock[] {
  const blocks: NotesBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: 'list', items: list });
      list = [];
    }
  };

  for (const raw of notes.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'heading', text: stripInline(heading[1]) });
      continue;
    }

    const bullet = line.match(/^(?:[-*+]|\d+\.)\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list.push(stripInline(bullet[1]));
      continue;
    }

    flushList();
    paragraph.push(stripInline(line));
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** Removes the markdown punctuation that would otherwise be read literally. */
function stripInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|$|[.,;:!?)])/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .trim();
}
