import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LanguageService } from './i18n/language';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';
import { DocumentMeta } from './meta';
import { ThemeService } from './theme';

/**
 * The shell: skip link, header, routed page, footer.
 *
 * ThemeService is injected here rather than only in the header so the theme is
 * applied during bootstrap. Injecting it lazily would mean the page paints in
 * the default theme and then flips, which is the flash every dark-mode
 * implementation gets wrong once.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly t = inject(LanguageService).t;

  constructor() {
    // Constructed for its side effect: it writes <html data-theme> on creation.
    inject(ThemeService);
    // Same reason. Both are root-provided, so nothing would construct them
    // before the first page that happens to inject them, and the title and
    // og:* tags have to be right from the first paint.
    inject(DocumentMeta);
  }
}
