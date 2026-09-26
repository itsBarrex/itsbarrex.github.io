/**
 * Production build for GitHub Pages.
 *
 * Two things are correctness issues on Pages rather than polish, and both are
 * handled here so that `npm run build:pages` locally produces byte-for-byte
 * what CI publishes:
 *
 *   1. --base-href. The site is published to itsBarrex/itsbarrex.github.io,
 *      which is a **user-pages** repo: GitHub serves it from the domain root
 *      https://itsbarrex.github.io/, so the base href is "/". A *project* repo
 *      would be served from https://<user>.github.io/<repo>/ and would need
 *      "/<repo>/" instead — get that wrong in either direction and every hashed
 *      script and stylesheet 404s, so the page renders blank while the build
 *      reports success.
 *
 *   2. 404.html. Pages serves 404.html for any path it does not recognise.
 *      Copying the built index.html to 404.html means a deep link or a stale
 *      URL still loads the site instead of GitHub's error page. It must be
 *      copied *after* the build, because index.html references hashed
 *      filenames that only exist once the build has run.
 *
 * Set the path with the BASE_HREF environment variable. It defaults to "/",
 * which is correct for itsbarrex.github.io and for any custom domain. Override
 * it only for a project repo:
 *   BASE_HREF=/some-repo/ npm run build:pages
 */
import { spawnSync } from 'node:child_process';
import { copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'dist/itsbarrex/browser');

const baseHref = process.env.BASE_HREF ?? '/';
if (!baseHref.startsWith('/') || !baseHref.endsWith('/')) {
  console.error(
    `BASE_HREF must start and end with "/" (got "${baseHref}"). ` +
      'Use "/" for itsbarrex.github.io or a custom domain, or "/<repo-name>/" for a project repo.',
  );
  process.exit(1);
}

console.log(`Building with --base-href ${baseHref}`);

const build = spawnSync(
  process.execPath,
  [resolve(root, 'node_modules/@angular/cli/bin/ng.js'), 'build', '--base-href', baseHref],
  { cwd: root, stdio: 'inherit' },
);

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

await copyFile(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
// Stops Pages' Jekyll pass from dropping files and folders that start with "_".
await writeFile(resolve(outDir, '.nojekyll'), '');

console.log(`Wrote 404.html and .nojekyll to ${outDir}`);
