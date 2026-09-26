import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { site } from '../content/site';
import { ToolsService } from '../content/tools.service';
import { LanguageService } from '../i18n/language';
import { ToolCard } from './tool-card';

/**
 * The tool grid — the reason this site exists.
 *
 * Three states, all defined, because on a static site the data can genuinely be
 * absent: the list, a "nothing released yet" card when no repo carries the topic
 * and no tool is written by hand, and a one-line loading note. The empty state
 * is a normal card with a Discord pointer, never a broken page.
 *
 * `auto-fit` with a 16rem floor means the grid collapses to a single column
 * inside a 390px viewport without a media query.
 */
@Component({
  selector: 'app-tool-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolCard],
  template: `
    <section class="section" id="tools">
      <div class="container">
        <h2 class="section__heading">{{ t().tools.heading }}</h2>
        <p class="section__blurb">{{ t().tools.blurb }}</p>

        @if (tools().length > 0) {
          <ul class="grid" role="list">
            @for (tool of tools(); track tool.slug) {
              <li><app-tool-card [tool]="tool" /></li>
            }
          </ul>
        } @else if (loading()) {
          <p class="grid__note" aria-live="polite">{{ t().tools.loading }}</p>
        } @else {
          <div class="card grid__empty">
            <h3>{{ t().tools.emptyHeading }}</h3>
            <p>{{ t().tools.emptyBody }}</p>
            <a class="btn btn--ghost" [href]="supportUrl" target="_blank" rel="noopener">
              {{ t().toolPage.supportCta }}
            </a>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .grid {
      display: grid;
      gap: var(--s-4);
      margin-top: var(--s-6);
      /* 16rem floor: one column at 390px, no media query needed. */
      grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
    }

    .grid > li {
      display: flex;
    }

    .grid > li > * {
      width: 100%;
    }

    .grid__note {
      margin-top: var(--s-6);
      color: var(--c-text-faint);
    }

    .grid__empty {
      margin-top: var(--s-6);
      max-width: var(--w-prose);
      display: grid;
      gap: var(--s-3);
      justify-items: start;
    }
  `,
})
export class ToolGrid {
  private readonly toolsService = inject(ToolsService);

  protected readonly t = inject(LanguageService).t;
  protected readonly tools = this.toolsService.tools;
  protected readonly loading = this.toolsService.loading;
  protected readonly supportUrl = site.supportUrl;
}
