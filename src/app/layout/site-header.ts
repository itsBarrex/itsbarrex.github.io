import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { site } from '../content/site';
import { LanguageService } from '../i18n/language';
import { ThemeService } from '../theme';

/**
 * The header carries the two global controls: language and theme.
 *
 * Nav items are `routerLink` + `fragment` rather than bare `#anchor` hrefs, so
 * they also work from a tool page — a plain `#tools` on /tools/phantom-mirror
 * would scroll the tool page looking for a section that is not there.
 */
@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  private readonly language = inject(LanguageService);
  private readonly themes = inject(ThemeService);

  protected readonly t = this.language.t;
  protected readonly other = this.language.other;
  protected readonly theme = this.themes.theme;
  protected readonly name = site.name;

  protected switchLanguage(): void {
    this.language.toggle();
  }

  protected switchTheme(): void {
    this.themes.toggle();
  }
}
