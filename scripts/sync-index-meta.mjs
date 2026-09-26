/**
 * Stamps `indexTitle` and `indexDescription` from src/app/content/site.ts into
 * src/index.html.
 *
 * Why this exists: search engines and link unfurlers (Discord, X, WhatsApp) read
 * the static HTML and never run the app, so the title and description have to be
 * present in index.html. But the content files are meant to be the only place
 * anyone edits. Rather than asking someone to keep two files in sync by hand,
 * this runs automatically before every build.
 *
 * The stamped text is German, because static HTML can only carry one language
 * and German is the default. The in-app title follows the language toggle — see
 * LanguageService.
 *
 * It is idempotent: if site.ts has not changed, index.html is untouched.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentPath = resolve(root, 'src/app/content/site.ts');
const indexPath = resolve(root, 'src/index.html');

/** Reads a top-level string literal out of site.ts without importing TypeScript. */
function readStringField(source, field) {
  const match = source.match(
    new RegExp(`\\n\\s{2}${field}:\\s*(?:\\r?\\n\\s*)?'((?:[^'\\\\]|\\\\.)*)'`),
  );
  if (!match) {
    throw new Error(`Could not find "${field}" in src/app/content/site.ts`);
  }
  return match[1].replace(/\\'/g, "'");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const source = await readFile(contentPath, 'utf8');
const title = escapeHtml(readStringField(source, 'indexTitle'));
const description = escapeHtml(readStringField(source, 'indexDescription'));

let html = await readFile(indexPath, 'utf8');
const before = html;

html = html
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/, `$1${description}$2`)
  .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/, `$1${title}$2`)
  .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/, `$1${description}$2`);

if (html === before) {
  console.log('sync-index-meta: index.html already matches site.ts');
} else {
  await writeFile(indexPath, html, 'utf8');
  console.log('sync-index-meta: updated src/index.html from site.ts');
}
