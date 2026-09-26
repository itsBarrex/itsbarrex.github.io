/**
 * Serves the production build exactly the way GitHub Pages will — under the
 * configured base href, with 404.html as the fallback for unknown paths — then
 * requests every asset the built HTML and CSS reference.
 *
 * This is the check that catches the single most common way a Pages deploy
 * fails: a base-href mistake makes every hashed script and stylesheet 404, and
 * the site renders as a blank white page. It is verifiable over plain HTTP, so
 * it needs no browser.
 *
 * Run after a build:  npm run build:pages && node scripts/verify-pages.mjs
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, posix } from 'node:path';

const ROOT = new URL('../dist/itsbarrex/browser/', import.meta.url).pathname;
const ORIGIN = 'http://localhost:8099';

/**
 * Must match the BASE_HREF the build used, so CI checks the real path rather
 * than a hard-coded one. "/" — itsbarrex.github.io, or a custom domain — has no
 * prefix at all; a project repo has "/<repo>".
 */
const BASE_HREF = process.env.BASE_HREF ?? '/';
if (!BASE_HREF.startsWith('/') || !BASE_HREF.endsWith('/')) {
  console.error(`BASE_HREF must start and end with "/" (got "${BASE_HREF}").`);
  process.exit(1);
}
const PREFIX = BASE_HREF === '/' ? '' : BASE_HREF.slice(0, -1);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(PREFIX)) {
    // Anything outside the base href would be served by GitHub's own 404, not us.
    res.writeHead(404, { 'content-type': 'text/plain' }).end('outside base href');
    return;
  }
  path = path.slice(PREFIX.length) || '/';
  if (path.endsWith('/')) path += 'index.html';

  const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    const body = await readFile(join(ROOT, '404.html'));
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  }
});

await new Promise((r) => server.listen(8099, r));

const failures = [];
const checked = [];

async function expect(url, wanted, what) {
  const res = await fetch(url, { redirect: 'manual' });
  const ok = res.status === wanted;
  checked.push(`${ok ? 'ok  ' : 'FAIL'} ${res.status} ${what} ${url.replace(ORIGIN, '')}`);
  if (!ok) failures.push(`${what}: wanted ${wanted}, got ${res.status} for ${url}`);
  return res;
}

// 1. The page itself.
const indexRes = await expect(`${ORIGIN}${PREFIX}/`, 200, 'index');
const html = await indexRes.text();

const base = (html.match(/<base href="([^"]*)"/) ?? [])[1];
if (base !== `${PREFIX}/`) failures.push(`base href is "${base}", expected "${PREFIX}/"`);
checked.push(`${base === `${PREFIX}/` ? 'ok  ' : 'FAIL'}     base href ${base}`);

// 2. Everything index.html references, resolved against the base href the
//    browser would actually use.
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !/^(https?:|mailto:|data:|#)/.test(u) && u !== `${PREFIX}/`);

for (const ref of new Set(refs)) {
  const resolved = ref.startsWith('/') ? ref : posix.join(`${PREFIX}/`, ref);
  await expect(`${ORIGIN}${resolved}`, 200, 'index ref');
}

// 3. Everything the stylesheet references (the self-hosted fonts). Relative
//    url()s resolve against the stylesheet's own directory, not the page.
const cssHref = refs.find((r) => r.endsWith('.css'));
if (!cssHref) {
  failures.push('no stylesheet referenced from index.html');
} else {
  const css = await (await fetch(`${ORIGIN}${posix.join(`${PREFIX}/`, cssHref)}`)).text();
  const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)]
    .map((m) => m[1])
    .filter((u) => !/^(https?:|data:)/.test(u));
  if (!urls.length) failures.push('stylesheet references no local url() assets (fonts missing?)');
  for (const u of new Set(urls)) {
    await expect(`${ORIGIN}${posix.join(`${PREFIX}/`, u)}`, 200, 'css asset');
  }
}

// 4. The SPA fallback: an unknown deep link must still serve the app shell.
const fallback = await expect(`${ORIGIN}${PREFIX}/deep/link/that/does/not/exist`, 404, 'fallback');
const fallbackHtml = await fallback.text();
if (!fallbackHtml.includes('<app-root')) {
  failures.push('404.html does not contain <app-root> — deep links will not load the site');
}
checked.push(
  `${fallbackHtml.includes('<app-root') ? 'ok  ' : 'FAIL'}     404.html serves the app shell`,
);

// 5. .nojekyll must exist or Pages drops underscore-prefixed files.
await expect(`${ORIGIN}${PREFIX}/.nojekyll`, 200, '.nojekyll');

// 6. tools.json. Nothing in the HTML references it — the app fetches it at
//    runtime against <base href> — so the crawl above cannot catch a missing or
//    misplaced one. Without this check a build that dropped it would publish
//    green and silently serve the hand-written fallback list for ever.
const toolsRes = await expect(`${ORIGIN}${PREFIX}/tools.json`, 200, 'tools.json');
try {
  const tools = JSON.parse(await toolsRes.text());
  const ok = Array.isArray(tools.tools);
  checked.push(`${ok ? 'ok  ' : 'FAIL'}     tools.json has a tools array`);
  if (!ok) failures.push('tools.json does not contain a "tools" array');
} catch (error) {
  failures.push(`tools.json is not valid JSON: ${error.message}`);
}

server.close();

console.log(checked.join('\n'));
console.log(`\n${checked.length} checks, ${failures.length} failure(s)`);
if (failures.length) {
  console.error(`\n${failures.join('\n')}`);
  process.exit(1);
}
