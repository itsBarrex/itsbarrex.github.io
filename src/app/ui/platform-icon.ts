import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SocialPlatform } from '../content/site';

/**
 * Inline brand glyphs. Inline rather than icon-font or sprite so the socials
 * grid costs zero extra network requests and renders with the first paint.
 * Each is decorative — the visible label beside it carries the meaning.
 */
const PATHS: Record<SocialPlatform, string> = {
  twitch:
    'M4.3 3 3 6.5v12.2h4.2V21h2.3l2.3-2.3h3.4L20.9 14V3H4.3Zm15 10.2-2.7 2.7h-4.2L10.1 18v-2.1H6.5V4.7h12.8v8.5ZM15.6 7.5v4.7h-1.7V7.5h1.7Zm-4.5 0v4.7H9.4V7.5h1.7Z',
  youtube:
    'M23 12s0-3.6-.5-5.3a2.8 2.8 0 0 0-2-2C18.8 4.2 12 4.2 12 4.2s-6.8 0-8.5.5a2.8 2.8 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3a2.8 2.8 0 0 0 2 2c1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5a2.8 2.8 0 0 0 2-2c.5-1.7.5-5.3.5-5.3ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z',
  x: 'M17.5 3h3.3l-7.2 8.3L22 21h-6.6l-5.2-6.8L4.2 21H.9l7.7-8.8L.5 3h6.8l4.7 6.2L17.5 3Zm-1.2 16h1.8L7.8 4.9H5.9L16.3 19Z',
  discord:
    'M19.3 5.6A16.6 16.6 0 0 0 15.2 4.3l-.2.4a15.4 15.4 0 0 1 3.6 1.2 12.9 12.9 0 0 0-11.2 0 15.4 15.4 0 0 1 3.6-1.2l-.2-.4A16.6 16.6 0 0 0 4.7 5.6C2 9.6 1.3 13.5 1.6 17.3a16.7 16.7 0 0 0 5.1 2.6l1-1.7a10.9 10.9 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.2 0l.4.3a10.9 10.9 0 0 1-1.7.8l1 1.7a16.7 16.7 0 0 0 5.1-2.6c.4-4.4-.7-8.3-2.1-11.7ZM8.6 15c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2Zm6.8 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2Z',
  tiktok:
    'M16.6 2h-3.2v13.4a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.5a6 6 0 1 0 5.1 5.9V8.9a7 7 0 0 0 4.1 1.3V7a4.1 4.1 0 0 1-4.1-4.1V2Z',
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9a3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1 0-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.2.4-.4 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.2 1 .4 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1 0 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.2-.4.4-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-1.1-.2-1.7-.4-2.1a3.2 3.2 0 0 0-.8-1.2 3.2 3.2 0 0 0-1.2-.8c-.4-.2-1-.4-2.1-.4-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a5 5 0 1 1 0 9.9 5 5 0 0 1 0-9.9Zm0 1.7a3.2 3.2 0 1 0 0 6.5 3.2 3.2 0 0 0 0-6.5Zm5.2-3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z',
};

@Component({
  selector: 'app-platform-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    /* --icon-size is the knob a caller turns. A custom property crosses the
       component boundary where a selector would not, so a consumer can shrink
       the glyph without ::ng-deep and without this component growing an input
       that only ever carries a length. The width/height attributes stay as the
       no-CSS fallback; the rule below wins over them. */
    :host {
      display: inline-flex;
      --icon-size: 24px;
    }

    svg {
      width: var(--icon-size);
      height: var(--icon-size);
    }
  `,
})
export class PlatformIcon {
  readonly platform = input.required<SocialPlatform>();
  protected readonly path = () => PATHS[this.platform()];
}
