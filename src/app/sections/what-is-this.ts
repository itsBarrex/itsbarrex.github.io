import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LanguageService } from '../i18n/language';

/**
 * One paragraph in his own voice, under the grid.
 *
 * It sits below the tools on purpose: someone who arrived from a link in his
 * chat wants the download, not an introduction. The explanation is for the
 * person who scrolled.
 */
@Component({
  selector: 'app-what-is-this',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section wit" id="what-is-this">
      <div class="container wit__inner">
        <h2 class="section__heading">{{ t().whatIsThis.heading }}</h2>
        <p class="wit__body">{{ t().whatIsThis.body }}</p>
      </div>
    </section>
  `,
  styles: `
    .wit {
      background: color-mix(in srgb, var(--c-bg-inset) 55%, var(--c-bg));
      border-block: 1px solid var(--c-border);
    }

    .wit__body {
      margin-top: var(--s-4);
      max-width: var(--w-prose);
      color: var(--c-text-muted);
      font-size: var(--fs-h3);
      line-height: var(--lh-body);
    }
  `,
})
export class WhatIsThis {
  protected readonly t = inject(LanguageService).t;
}
