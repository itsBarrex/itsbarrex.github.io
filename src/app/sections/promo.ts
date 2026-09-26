import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { site } from '../content/site';
import { EmbedService } from '../embed';
import { LanguageService } from '../i18n/language';
import { PlatformIcon } from '../ui/platform-icon';

/**
 * The promo block: name, one line on what he builds, two actions.
 *
 * Deliberately short. barrex.stream is his platform and already does the long
 * version — bio, schedule, clips, shop, quests. Repeating any of it here would
 * be a second thing to keep up to date and would push the tool grid, which is
 * the actual point of this site, below the fold on a phone.
 *
 * The badge is a link to the channel, not a live indicator. Knowing whether a
 * stream is live needs a Twitch API credential, and this site is static with no
 * secrets, so a dot that pulses regardless of reality would just be a lie. It
 * says where to check instead.
 *
 * It used to carry a red dot in exactly the colour every platform uses for
 * "on air", which is the lie the paragraph above says we are not telling — a
 * viewer reads that dot as live, not as a link (VEG-4, optional). The Twitch
 * glyph says where the link goes and claims nothing about whether he is on.
 */
@Component({
  selector: 'app-promo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlatformIcon],
  template: `
    <section class="promo" id="top">
      <div class="container promo__inner">
        <p class="eyebrow">{{ t().promo.eyebrow }}</p>
        <h1 class="promo__name">{{ name }}</h1>
        <p class="promo__tagline">{{ t().promo.tagline }}</p>

        <div class="promo__actions">
          <a class="btn btn--primary" [href]="channelUrl" target="_blank" rel="noopener">
            {{ t().promo.ctaTwitch }}
          </a>
          <a class="btn btn--ghost" [href]="mainSiteUrl" target="_blank" rel="noopener">
            {{ t().promo.ctaSite }}
          </a>
          <a class="promo__badge" [href]="channelUrl" target="_blank" rel="noopener">
            <app-platform-icon class="promo__glyph" platform="twitch" />
            {{ t().promo.statusBadge }}
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .promo {
      padding-block: var(--s-7) var(--s-6);
    }

    .promo__name {
      font-size: var(--fs-hero);
      line-height: var(--lh-tight);
      letter-spacing: -0.02em;
      margin-top: var(--s-2);
    }

    .promo__tagline {
      margin-top: var(--s-3);
      max-width: var(--w-prose);
      color: var(--c-text-muted);
      font-size: var(--fs-h3);
      line-height: var(--lh-snug);
    }

    .promo__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s-3);
      margin-top: var(--s-5);
    }

    .promo__badge {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2);
      /* 44px: it sits on the same row as two buttons and is tapped as often
         as either of them (VEG-4 finding 7). */
      min-height: 44px;
      padding-inline: var(--s-4);
      border-radius: var(--r-pill);
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      font-size: var(--fs-micro);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--c-text-muted);
      text-decoration: none;
    }

    .promo__badge:hover {
      color: var(--c-text);
      background: var(--c-surface-hover);
    }

    /* Sized to the uppercase micro label beside it rather than the 24px the
       footer socials use — at native size it would outweigh the text it
       labels. */
    .promo__glyph {
      --icon-size: 1rem;
    }
  `,
})
export class Promo {
  private readonly embed = inject(EmbedService);

  protected readonly t = inject(LanguageService).t;
  protected readonly name = site.name;
  protected readonly channelUrl = this.embed.channelUrl();
  protected readonly mainSiteUrl = site.mainSiteUrl;
}
