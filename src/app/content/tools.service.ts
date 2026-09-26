import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

import { GeneratedTool, GeneratedToolsFile, Tool, mergeTools } from './tool.model';
import { curatedTools } from './tools';

/** Where the generated file lands in the bundle, relative to the base href. */
export const TOOLS_JSON = 'tools.json';

/**
 * Supplies the tool list to the UI.
 *
 * It starts from the hand-written list in tools.ts, so the grid and every tool
 * page render on the very first frame with no request at all. Then it reads the
 * generated `tools.json` and merges the GitHub-derived version, date, changelog
 * and download on top.
 *
 * Failure is not an error state here. If `tools.json` is missing (nobody has run
 * the generator yet), unreachable (offline visitor), or malformed (a GitHub API
 * shape change), the site keeps the hand-written list and says nothing. The
 * alternative — an error banner on the main page of a promo site because a
 * version number could not be refreshed — would be worse than slightly stale
 * data.
 */
@Injectable({ providedIn: 'root' })
export class ToolsService {
  private readonly document = inject(DOCUMENT);

  private readonly generated = signal<GeneratedTool[]>([]);
  private readonly fetching = signal(true);

  /** Every tool, ready to render. Real tools first, placeholders last. */
  readonly tools = computed<Tool[]>(() => mergeTools(curatedTools, this.generated()));

  /** True only while the first load is in flight AND there is nothing to show. */
  readonly loading = computed(() => this.fetching() && this.tools().length === 0);

  /** When the tool data was generated, or null if it is the hand-written list. */
  readonly generatedAt = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  byslug(slug: string): Tool | undefined {
    return this.tools().find((tool) => tool.slug === slug);
  }

  private async load(): Promise<void> {
    try {
      // Resolved against <base href> so it works at the domain root and under
      // a /<repo>/ path prefix without a code change.
      const url = new URL(TOOLS_JSON, this.document.baseURI).href;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as GeneratedToolsFile;
      if (!Array.isArray(data?.tools)) {
        return;
      }
      this.generated.set(data.tools.filter(isUsable));
      this.generatedAt.set(typeof data.generatedAt === 'string' ? data.generatedAt : null);
    } catch {
      // Offline, blocked, or not built yet. The hand-written list stands.
    } finally {
      this.fetching.set(false);
    }
  }
}

/**
 * Drops entries we could not route to. A generated tool without a slug would
 * render a card whose link goes nowhere, which is worse than not listing it.
 */
function isUsable(tool: GeneratedTool): boolean {
  return typeof tool?.slug === 'string' && /^[a-z0-9][a-z0-9._-]*$/i.test(tool.slug);
}
