import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageService } from '../i18n/language';

/**
 * Catch-all route.
 *
 * On GitHub Pages this is reached two ways: a genuinely wrong in-app link, and
 * a deep link to a path Pages does not have a file for — Pages serves 404.html,
 * which is a copy of the app shell, and the router then lands here. So this page
 * has to make sense to someone who followed an old link from Discord, not just
 * to a developer.
 */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="section">
      <div class="container nf">
        <h1 class="section__heading">{{ t().notFound.heading }}</h1>
        <p class="section__blurb">{{ t().notFound.body }}</p>
        <a class="btn btn--primary" routerLink="/">{{ t().notFound.cta }}</a>
      </div>
    </section>
  `,
  styles: `
    .nf {
      display: grid;
      gap: var(--s-4);
      justify-items: start;
      min-height: 40vh;
      align-content: center;
    }
  `,
})
export class NotFound {
  protected readonly t = inject(LanguageService).t;
}
