import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { site } from '../content/site';
import { LanguageService } from '../i18n/language';
import { PlatformIcon } from '../ui/platform-icon';

/**
 * Socials, his main platform, and the legal link.
 *
 * The Impressum points at barrex.stream/impressum rather than repeating his
 * address here: a German site with a public audience needs a reachable legal
 * notice, and one copy that he already maintains cannot drift out of date the
 * way a second copy would.
 */
@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlatformIcon],
  template: `
    <footer class="ftr">
      <div class="container ftr__inner">
        <div class="ftr__block">
          <h2 class="ftr__heading">{{ t().footer.socialsHeading }}</h2>
          <ul class="ftr__socials">
            @for (link of socials; track link.url) {
              <li>
                <a class="ftr__social" [href]="link.url" target="_blank" rel="noopener">
                  <app-platform-icon [platform]="link.platform" />
                  <span class="ftr__social-text">
                    <span class="ftr__social-label">{{ link.label }}</span>
                    <span class="ftr__social-handle">{{ link.handle }}</span>
                  </span>
                </a>
              </li>
            }
          </ul>
        </div>

        <div class="ftr__block">
          <h2 class="ftr__heading">{{ t().footer.linksHeading }}</h2>
          <ul class="ftr__links">
            <li>
              <a [href]="mainSiteUrl" target="_blank" rel="noopener">
                {{ t().footer.mainSite }}
              </a>
            </li>
            <li>
              <a [href]="imprintUrl" target="_blank" rel="noopener">
                {{ t().footer.imprint }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="container ftr__legal">
        <p>{{ copyright() }}</p>
        @if (builtByUrl) {
          <a [href]="builtByUrl" target="_blank" rel="noopener">{{ t().footer.builtBy }}</a>
        } @else {
          <p>{{ t().footer.builtBy }}</p>
        }
      </div>
    </footer>
  `,
  styles: `
    /* margin-top was --s-section, the same value the last section already
       spends on its own bottom padding. The two stacked to 225px of nothing
       between the last readable line and the footer rule at 1440px, which
       reads as a section that failed to load (VEG-4 finding 9). The rule still
       needs clearance from whatever precedes it — a full-bleed band ends in its
       own border — so this is separation, not rhythm. */
    .ftr {
      margin-top: var(--s-6);
      border-top: 1px solid var(--c-border);
      padding-block: var(--s-6) var(--s-5);
    }

    .ftr__inner {
      display: grid;
      gap: var(--s-6);
    }

    .ftr__heading {
      font-size: var(--fs-micro);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--c-text-faint);
      margin-bottom: var(--s-4);
    }

    .ftr__socials {
      display: grid;
      gap: var(--s-2);
    }

    .ftr__social {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      min-height: 44px;
      padding: var(--s-2) var(--s-3);
      margin-inline: calc(var(--s-3) * -1);
      border-radius: var(--r-sm);
      text-decoration: none;
      color: var(--c-text-muted);
      transition:
        color var(--dur) var(--ease),
        background-color var(--dur) var(--ease);
    }

    .ftr__social:hover {
      color: var(--c-text);
      background: var(--c-surface-hover);
    }

    .ftr__social-text {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-1) var(--s-2);
      min-width: 0;
    }

    .ftr__social-label {
      font-weight: 600;
    }

    .ftr__social-handle {
      font-size: var(--fs-small);
      color: var(--c-text-faint);
    }

    .ftr__links {
      display: grid;
      gap: var(--s-1);
    }

    /* These were 22px tall — half the 44px floor, two of them stacked close
       together, which is a mis-tap generator on a phone (VEG-4 finding 7). The
       rule moved from a border-bottom to a real underline so it still hugs the
       text now that the box around it is twice as tall as the line. */
    .ftr__links a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: var(--c-text-muted);
      text-decoration: underline;
      text-decoration-color: var(--c-border-strong);
      text-underline-offset: 0.25em;
    }

    .ftr__links a:hover {
      color: var(--c-text);
      text-decoration-color: var(--c-accent);
    }

    .ftr__legal {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--s-2) var(--s-4);
      margin-top: var(--s-6);
      padding-top: var(--s-4);
      border-top: 1px solid var(--c-border);
      font-size: var(--fs-small);
      color: var(--c-text-faint);
    }

    /* Only rendered when site.footer.builtByUrl is set, but it has to clear the
       44px floor on the day it is. */
    .ftr__legal a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }

    @media (min-width: 40rem) {
      .ftr__inner {
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        gap: var(--s-7);
      }

      .ftr__socials {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class SiteFooter {
  private readonly language = inject(LanguageService);

  protected readonly t = this.language.t;
  protected readonly socials = site.socials.filter((link) => link.enabled);
  protected readonly mainSiteUrl = site.mainSiteUrl;
  protected readonly imprintUrl = site.imprintUrl;
  protected readonly builtByUrl = site.footer.builtByUrl;

  protected readonly copyright = () =>
    this.t().footer.copyright.replace('{year}', String(new Date().getFullYear()));
}
