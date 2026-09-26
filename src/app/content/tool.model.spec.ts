import generatedFixture from '../../../fixtures/tools.example.json';
import { LANGUAGES } from '../i18n/language';
import {
  CuratedTool,
  GeneratedTool,
  GeneratedToolsFile,
  TOOL_CATEGORIES,
  TOOL_STATUSES,
  mergeTools,
  parseNotes,
  resolveCurated,
} from './tool.model';
import { curatedTools } from './tools';

/**
 * The contract between scripts/generate-tools.mjs and the app.
 *
 * The generator runs in CI against the live GitHub API, so nothing here can
 * call it. What it *can* do is pin the shape: fixtures/tools.example.json is
 * maintained as a copy of the generator's real output, and the compiler checks
 * it against `GeneratedToolsFile` on import. If the generator's output changes,
 * the fixture changes, and these tests fail until the app agrees.
 */
const fixture: GeneratedToolsFile = generatedFixture as unknown as GeneratedToolsFile;

describe('generated tools.json contract', () => {
  it('parses as the shape the app consumes', () => {
    expect(fixture.owner).toBeTruthy();
    expect(fixture.topic).toBeTruthy();
    expect(Number.isNaN(Date.parse(fixture.generatedAt))).toBe(false);
    expect(fixture.tools.length).toBeGreaterThan(0);
  });

  it('only uses categories and statuses the UI has labels for', () => {
    // A category the UI does not know renders as a blank chip with no icon.
    for (const tool of fixture.tools) {
      expect(TOOL_CATEGORIES, `category of ${tool.slug}`).toContain(tool.category);
      expect(TOOL_STATUSES, `status of ${tool.slug}`).toContain(tool.status);
    }
  });

  it('gives every tool a routable slug', () => {
    for (const tool of fixture.tools) {
      expect(tool.slug, `slug of ${tool.name}`).toMatch(/^[a-z0-9][a-z0-9._-]*$/);
    }
  });

  it('covers both of the cases that matter: a full repo and a bare one', () => {
    // A bare repo — no tool.json, no release — is the state every new tool is
    // in on day one. If the fixture only held complete tools, the fallbacks
    // below would never be exercised.
    expect(fixture.tools.some((tool) => tool.hasToolJson && tool.release)).toBe(true);
    expect(fixture.tools.some((tool) => !tool.hasToolJson && !tool.release)).toBe(true);
  });

  it('points every download at a GitHub release asset, never at this repo', () => {
    // No binaries in the site repo — the download always resolves to GitHub.
    for (const tool of fixture.tools) {
      const url = tool.release?.download?.url;
      if (url) {
        expect(url, `download of ${tool.slug}`).toMatch(
          /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//,
        );
      }
    }
  });
});

describe('mergeTools', () => {
  const curated: CuratedTool[] = [
    {
      slug: 'widget',
      name: 'Widget',
      category: 'obs',
      status: 'live',
      summary: { de: 'Handgeschrieben', en: 'Hand written' },
      repoUrl: 'https://github.com/itsBarrex/widget',
    },
  ];

  const generated = (overrides: Partial<GeneratedTool> = {}): GeneratedTool => ({
    slug: 'widget',
    name: 'Widget',
    category: 'app',
    status: 'beta',
    repoUrl: 'https://github.com/itsBarrex/widget',
    summary: { de: 'Aus dem Repo', en: 'From the repo' },
    description: {},
    requirements: {},
    install: {},
    screenshot: null,
    video: null,
    release: {
      version: 'v1.2.0',
      publishedAt: '2026-09-20T10:00:00Z',
      url: 'https://github.com/itsBarrex/widget/releases/tag/v1.2.0',
      download: null,
    },
    changelog: [],
    hasToolJson: false,
    ...overrides,
  });

  it('lets GitHub win on the release, because only GitHub knows the version', () => {
    // A hand-written version number goes stale the first time he tags a release
    // and then lies to every visitor.
    const [tool] = mergeTools(curated, [generated()]);
    expect(tool.release?.version).toBe('v1.2.0');
    expect(tool.category).toBe('app');
    expect(tool.status).toBe('beta');
  });

  it('keeps our copy when the repo has no tool.json', () => {
    // A bare repo's GitHub description is usually English and written for
    // developers, so it loses to the German copy we wrote.
    const [tool] = mergeTools(curated, [generated({ hasToolJson: false })]);
    expect(tool.summary.de).toBe('Handgeschrieben');
  });

  it("prefers the repo's own tool.json over our copy", () => {
    // That file is him editing his own tool, which outranks us.
    const [tool] = mergeTools(curated, [generated({ hasToolJson: true })]);
    expect(tool.summary.de).toBe('Aus dem Repo');
  });

  it('clears the placeholder flag once GitHub confirms the tool is real', () => {
    const placeholder: CuratedTool[] = [{ slug: 'widget', name: 'Widget', placeholder: true }];
    const [tool] = mergeTools(placeholder, [generated()]);
    expect(tool.placeholder).toBe(false);
  });

  it('includes a tool that exists in only one source', () => {
    const merged = mergeTools(curated, [generated({ slug: 'other', name: 'Other' })]);
    expect(merged.map((tool) => tool.slug).sort()).toEqual(['other', 'widget']);
  });

  it('sorts real tools before placeholders, newest release first', () => {
    const merged = mergeTools(
      [
        { slug: 'filler', name: 'Filler', placeholder: true },
        { slug: 'old', name: 'Old' },
      ],
      [
        generated({ slug: 'old', name: 'Old', release: null }),
        generated({
          slug: 'new',
          name: 'New',
          release: {
            version: 'v2',
            publishedAt: '2026-09-25T10:00:00Z',
            url: 'https://github.com/itsBarrex/new/releases/tag/v2',
            download: null,
          },
        }),
      ],
    );
    expect(merged.map((tool) => tool.slug)).toEqual(['new', 'old', 'filler']);
  });

  it('falls back to the other language rather than rendering an empty card', () => {
    // A tool with only German copy shows German to an English reader. An empty
    // card looks broken; a German sentence looks like a pending translation,
    // which is the truth.
    const [tool] = mergeTools([], [generated({ hasToolJson: true, summary: { de: 'Nur DE' } })]);
    expect(tool.summary.en).toBe('Nur DE');
  });

  it('never leaves a UI field undefined', () => {
    // Every template reads these unconditionally, so a missing one is a
    // runtime error rather than a blank space.
    const [tool] = mergeTools([], [generated()]);
    for (const lang of LANGUAGES) {
      expect(typeof tool.summary[lang]).toBe('string');
      expect(Array.isArray(tool.description[lang])).toBe(true);
      expect(Array.isArray(tool.requirements[lang])).toBe(true);
      expect(Array.isArray(tool.install[lang])).toBe(true);
    }
    expect(Array.isArray(tool.changelog)).toBe(true);
  });
});

describe('the hand-written tool list', () => {
  it('has a unique, routable slug per tool', () => {
    const slugs = curatedTools.map((tool) => tool.slug);
    expect(new Set(slugs).size, 'duplicate slug').toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9][a-z0-9._-]*$/);
    }
  });

  it('resolves to a complete Tool with no network at all', () => {
    // This is what makes the grid render on the first frame and what makes a
    // tool page work for a visitor who never reaches tools.json.
    for (const entry of curatedTools) {
      const tool = resolveCurated(entry);
      expect(tool.name.length, `${entry.slug} has no name`).toBeGreaterThan(0);
      expect(TOOL_CATEGORIES).toContain(tool.category);
      expect(TOOL_STATUSES).toContain(tool.status);
    }
  });

  it('never invents a repository URL for filler', () => {
    // Our filler must never read as his work, and it must never point at a
    // GitHub URL we made up — that would 404 for every visitor who clicked it.
    for (const entry of curatedTools) {
      if (entry.placeholder) {
        expect(entry.repoUrl ?? '', `${entry.slug} is filler but claims a repo`).toBe('');
      }
    }
  });
});

describe('parseNotes', () => {
  it('renders release notes as blocks, never as HTML', () => {
    // Release notes are arbitrary text from whoever can publish a release, so
    // innerHTML would be an injection path. Everything degrades to text.
    const blocks = parseNotes('## Fixed\n- <img src=x onerror=alert(1)>\n\nPlain line.');
    expect(blocks).toEqual([
      { kind: 'heading', text: 'Fixed' },
      { kind: 'list', items: ['<img src=x onerror=alert(1)>'] },
      { kind: 'paragraph', text: 'Plain line.' },
    ]);
  });

  it('handles the markdown a changelog actually uses', () => {
    const blocks = parseNotes(
      '# Neu\n* Erstes\n* Zweites\n\nEin **wichtiger** Satz mit `code`.\n\n1. Schritt eins',
    );
    expect(blocks).toEqual([
      { kind: 'heading', text: 'Neu' },
      { kind: 'list', items: ['Erstes', 'Zweites'] },
      { kind: 'paragraph', text: 'Ein wichtiger Satz mit code.' },
      { kind: 'list', items: ['Schritt eins'] },
    ]);
  });

  it('keeps a link readable once the markup is gone', () => {
    const [block] = parseNotes('See [the docs](https://example.com/docs).');
    expect(block).toEqual({
      kind: 'paragraph',
      text: 'See the docs (https://example.com/docs).',
    });
  });

  it('returns nothing for an empty release body', () => {
    // GitHub allows a release with no notes at all; the UI shows its own
    // "no release notes yet" copy for this, so it must not get a blank block.
    expect(parseNotes('')).toEqual([]);
    expect(parseNotes('\n\n   \n')).toEqual([]);
  });

  it('survives Windows line endings', () => {
    expect(parseNotes('- eins\r\n- zwei')).toEqual([{ kind: 'list', items: ['eins', 'zwei'] }]);
  });
});
