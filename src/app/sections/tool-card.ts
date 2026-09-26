import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Tool } from '../content/tool.model';
import { LanguageService } from '../i18n/language';
import { CategoryIcon } from '../ui/category-icon';
import { formatDate } from '../ui/format';

/**
 * One card per tool: icon, name, one line, type, status, and a download.
 *
 * The card is not one big link. The name links to the tool page and the
 * download links to the release asset, and a link inside a link is invalid HTML
 * that keyboard and screen-reader users cannot get out of. Two links, two
 * destinations, both reachable by tab.
 *
 * A tool with no release still renders completely: the download slot says so
 * and offers the source instead. That is the common case early on, not an edge
 * case — he is shipping the site before most of the tools.
 */
@Component({
  selector: 'app-tool-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryIcon],
  template: `
    <article class="tc">
      <div class="tc__top">
        <span class="tc__icon" [class.tc__icon--muted]="tool().placeholder">
          <app-category-icon [category]="tool().category" />
        </span>
        <span class="tc__meta">
          <span class="tc__chip">{{ t().tools.categories[tool().category] }}</span>
          <span class="tc__chip tc__chip--status" [attr.data-status]="tool().status">
            {{ t().tools.statuses[tool().status] }}
          </span>
        </span>
      </div>

      <h3 class="tc__name">
        <a [routerLink]="['/tools', tool().slug]">{{ tool().name }}</a>
      </h3>

      <p class="tc__summary">{{ summary() }}</p>

      @if (tool().placeholder) {
        <p class="tc__flag">{{ t().tools.placeholderFlag }}</p>
      }

      <dl class="tc__release">
        @if (tool().release) {
          <dt>{{ t().tools.version }}</dt>
          <dd>{{ tool().release!.version }}</dd>
          @if (released()) {
            <dt>{{ t().tools.updated }}</dt>
            <dd>{{ released() }}</dd>
          }
        } @else {
          <dt class="visually-hidden">{{ t().tools.version }}</dt>
          <dd class="tc__none">{{ t().tools.noRelease }}</dd>
        }
      </dl>

      <div class="tc__actions">
        <a class="btn btn--ghost btn--small" [routerLink]="['/tools', tool().slug]">
          {{ t().tools.details }}
          <span class="visually-hidden">: {{ tool().name }}</span>
        </a>
        @if (download()) {
          <a
            class="btn btn--primary btn--small"
            [href]="download()!.url"
            target="_blank"
            rel="noopener"
            [attr.aria-label]="t().tools.download + ': ' + tool().name"
          >
            {{ t().tools.download }}
          </a>
        }
      </div>
    </article>
  `,
  styleUrl: './tool-card.scss',
})
export class ToolCard {
  readonly tool = input.required<Tool>();

  private readonly language = inject(LanguageService);

  protected readonly t = this.language.t;
  protected readonly summary = computed(() => this.language.pick(this.tool().summary));
  protected readonly download = computed(() => this.tool().release?.download ?? null);
  protected readonly released = computed(() =>
    formatDate(this.tool().release?.publishedAt ?? '', this.language.lang()),
  );
}
