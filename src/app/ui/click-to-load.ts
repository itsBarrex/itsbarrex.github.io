import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { LanguageService } from '../i18n/language';

/**
 * Wraps a third-party iframe behind a button.
 *
 * Nothing loads until someone clicks. That is the whole point: a Twitch or
 * YouTube iframe rendered on page load contacts the provider and sets cookies
 * before the visitor has chosen anything, which under the GDPR needs consent —
 * and a consent banner on a promo page costs more than the embed is worth. With
 * click-to-load the request only happens on a deliberate action, so the site
 * needs no cookie banner at all.
 *
 * It is also the performance win: an unclicked embed is zero bytes instead of
 * several hundred kilobytes of player.
 */
@Component({
  selector: 'app-click-to-load',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loaded()) {
      <div class="embed">
        <iframe
          [src]="src()"
          [title]="title()"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    } @else {
      <button type="button" class="ctl" (click)="load()">
        <span class="ctl__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M8 5v14l11-7L8 5Z" />
          </svg>
        </span>
        <span class="ctl__text">
          <span class="ctl__heading">{{ t().embed.loadHeading }}</span>
          <span class="ctl__body">{{ t().embed.loadBody }}</span>
          <span class="ctl__provider">{{ t().embed.provider }}: {{ provider() }}</span>
        </span>
        <span class="visually-hidden">{{ t().embed.loadCta }}: {{ title() }}</span>
      </button>
    }
  `,
  styles: `
    .ctl {
      display: flex;
      align-items: center;
      gap: var(--s-4);
      width: 100%;
      aspect-ratio: 16 / 9;
      padding: var(--s-5);
      text-align: left;
      background: var(--c-bg-inset);
      border: 1px dashed var(--c-border-strong);
      border-radius: var(--r-md);
      cursor: pointer;
      transition: border-color var(--dur) var(--ease);
    }

    .ctl:hover {
      border-color: var(--c-accent);
    }

    .ctl__icon {
      flex: none;
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border-radius: var(--r-pill);
      background: var(--c-accent);
      color: var(--c-accent-ink);
    }

    .ctl__text {
      display: grid;
      gap: var(--s-1);
      min-width: 0;
    }

    .ctl__heading {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: var(--fs-h3);
    }

    .ctl__body {
      color: var(--c-text-muted);
      font-size: var(--fs-small);
    }

    .ctl__provider {
      color: var(--c-text-faint);
      font-size: var(--fs-micro);
    }
  `,
})
export class ClickToLoad {
  /** Built by EmbedService. Never a raw string from content. */
  readonly src = input.required<SafeResourceUrl>();
  /** Accessible name of the iframe. Already translated by the caller. */
  readonly title = input.required<string>();
  /** Hostname the media comes from, shown on the placeholder. */
  readonly provider = input.required<string>();

  protected readonly t = inject(LanguageService).t;
  protected readonly loaded = signal(false);

  protected load(): void {
    this.loaded.set(true);
  }
}
