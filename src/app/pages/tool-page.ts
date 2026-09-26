import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { site } from '../content/site';
import { Tool, parseNotes } from '../content/tool.model';
import { ToolsService } from '../content/tools.service';
import { EmbedService } from '../embed';
import { LanguageService } from '../i18n/language';
import { DocumentMeta } from '../meta';
import { ClickToLoad } from '../ui/click-to-load';
import { formatBytes, formatDate } from '../ui/format';

/**
 * One template for every tool. `/tools/:slug`.
 *
 * Nothing here is per-tool code: adding a tool is one object in tools.ts or one
 * GitHub topic, never a new component. That is the constraint that keeps the
 * site maintainable by someone who is not us.
 *
 * Every section degrades on its own, because early on most tools will be missing
 * most of this:
 *   - no release        → the download block offers the source repo instead
 *   - no repo           → the source link is simply absent, not a dead link
 *   - no changelog      → a line saying so
 *   - no screenshot/clip → the media block is skipped entirely
 *   - unknown slug      → the not-found panel with a link back to the grid
 */
@Component({
  selector: 'app-tool-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ClickToLoad],
  templateUrl: './tool-page.html',
  styleUrl: './tool-page.scss',
})
export class ToolPage {
  /** Bound from the route parameter by `withComponentInputBinding()`. */
  readonly slug = input<string>('');

  private readonly language = inject(LanguageService);
  private readonly toolsService = inject(ToolsService);
  private readonly embed = inject(EmbedService);
  private readonly meta = inject(DocumentMeta);
  private readonly document = inject(DOCUMENT);

  protected readonly t = this.language.t;
  protected readonly supportUrl = site.supportUrl;

  protected readonly tool = computed<Tool | undefined>(() => this.toolsService.byslug(this.slug()));

  protected readonly description = computed(() => this.localizedList((tool) => tool.description));
  protected readonly requirements = computed(() => this.localizedList((tool) => tool.requirements));
  protected readonly install = computed(() => this.localizedList((tool) => tool.install));

  protected readonly released = computed(() =>
    formatDate(this.tool()?.release?.publishedAt ?? '', this.language.lang()),
  );

  protected readonly downloadSize = computed(() =>
    formatBytes(this.tool()?.release?.download?.sizeBytes ?? null, this.language.lang()),
  );

  /** Newest first, each body pre-parsed into renderable blocks. */
  protected readonly changelog = computed(() =>
    (this.tool()?.changelog ?? []).map((entry) => ({
      ...entry,
      date: formatDate(entry.date, this.language.lang()),
      blocks: parseNotes(entry.notes),
    })),
  );

  protected readonly screenshotAlt = computed(() => {
    const shot = this.tool()?.screenshot;
    return shot ? this.language.pick(shot.alt) : this.t().toolPage.screenshotAlt;
  });

  protected readonly videoTitle = computed(() => {
    const video = this.tool()?.video;
    return video ? this.language.pick(video.title) : '';
  });

  protected readonly videoSrc = computed(() => {
    const video = this.tool()?.video;
    if (!video) {
      return null;
    }
    return video.kind === 'youtube'
      ? this.embed.youtubeUrl(video.id)
      : this.embed.twitchClipUrl(video.id);
  });

  protected readonly videoProvider = computed(() => {
    const video = this.tool()?.video;
    return video ? this.embed.providerHost(video.kind) : '';
  });

  protected readonly copyState = signal<'idle' | 'copied' | 'failed'>('idle');

  constructor() {
    // The tab title, the meta description and the og:* tags all have to follow
    // both the tool and the language toggle. We hand the service what this page
    // *is*; it owns every tag, so nothing can clobber the tool name the way the
    // language service used to (VEG-4 findings 4 and 5).
    effect(() => {
      const tool = this.tool();
      this.meta.setPage(tool ? { name: tool.name, description: tool.summary } : null);
    });

    // Leaving the tool's title on the home page would be worse than never
    // setting it, so hand the tags back on the way out.
    inject(DestroyRef).onDestroy(() => this.meta.setPage(null));
  }

  /**
   * Copies the install steps as numbered plain text.
   *
   * One button for the whole list rather than one per step: the steps are prose
   * with the occasional command in them, and someone following them wants the
   * lot in a notes window, not sixteen separate clipboard writes.
   *
   * The failure path is visible. It used to be an empty `catch {}`, so with the
   * clipboard denied or an insecure context the button did nothing and said
   * nothing (VEG-4 finding 8) — a control that silently no-ops reads as a
   * broken page, not as a blocked permission.
   */
  protected async copyInstall(): Promise<void> {
    const text = this.install()
      .map((step, index) => `${index + 1}. ${step}`)
      .join('\n');
    const view = this.document.defaultView;
    try {
      const clipboard = view?.navigator.clipboard;
      if (!clipboard) {
        throw new Error('no clipboard API');
      }
      await clipboard.writeText(text);
      this.copyState.set('copied');
      view?.setTimeout(() => this.copyState.set('idle'), 2000);
    } catch {
      // Stays on screen until the next attempt: the reader has to notice it and
      // the message tells them to select the steps by hand instead.
      this.copyState.set('failed');
    }
  }

  private localizedList(pick: (tool: Tool) => Record<'de' | 'en', string[]>): string[] {
    const tool = this.tool();
    return tool ? this.language.pick(pick(tool)) : [];
  }
}
