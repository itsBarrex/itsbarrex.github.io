import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'itsbarrex.theme';

/**
 * Dark unconditionally, light only when the visitor asks for it.
 *
 * Precedence, highest first:
 *   1. What the visitor chose with the toggle (kept in localStorage).
 *   2. Dark — the brand default, matching barrex.stream (#0b0c10).
 *
 * The OS `prefers-color-scheme` is deliberately NOT consulted (VEG-4 finding 2,
 * Atlas's call). Most visitors arrive from his Twitch panel, and a phone in
 * light mode used to hand them a near-white page that shares no identity with
 * barrex.stream. Brand fit beats OS convention here, and it keeps light mode to
 * the people who chose it on purpose. The toggle still works and is still
 * remembered; `<meta name="color-scheme">` still declares both.
 *
 * The chosen theme is written to `<html data-theme>`; the token overrides live
 * in styles/_tokens.scss. No component knows a colour.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly current = signal<Theme>(this.initial());

  readonly theme = this.current.asReadonly();
  readonly other = computed<Theme>(() => (this.current() === 'dark' ? 'light' : 'dark'));

  constructor() {
    this.apply(this.current());
  }

  set(theme: Theme): void {
    this.current.set(theme);
    this.apply(theme);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable. The toggle still works for this visit.
    }
  }

  toggle(): void {
    this.set(this.other());
  }

  private initial(): Theme {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // Storage disabled or private mode. Fall through to the brand default.
    }
    return 'dark';
  }

  private apply(theme: Theme): void {
    this.document.documentElement.dataset['theme'] = theme;
    // Keeps the mobile browser chrome in step with the page.
    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#f4f5f7' : '#0b0c10');
  }
}
