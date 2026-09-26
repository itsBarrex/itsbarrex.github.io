import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

import { UiStrings, ui } from './strings';

/** The languages the site ships. German is the default; English is the switch. */
export const LANGUAGES = ['de', 'en'] as const;
export type Lang = (typeof LANGUAGES)[number];

export const DEFAULT_LANG: Lang = 'de';

/**
 * A value that exists once per language.
 *
 * Every user-visible string on the site is either a key in `ui` (chrome and
 * labels) or a `Localized<string>` in the content files (tool copy). Nothing
 * is written in German or English directly into a template.
 */
export type Localized<T> = Record<Lang, T>;

const STORAGE_KEY = 'itsbarrex.lang';

function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * Holds the active language and hands out the matching strings.
 *
 * v1 is a **runtime toggle**: one build, one URL, the choice kept in
 * localStorage. There are deliberately no `/de/` and `/en/` routes yet — that
 * needs Angular's build-time i18n and one bundle per locale, which is a
 * post-launch upgrade (see README). The trade-off is that the language is not
 * in the URL, so a shared link always opens in the reader's own last choice
 * and search engines only index the German copy.
 *
 * German is the default unconditionally rather than sniffed from
 * `navigator.language`: the client's audience is German, the spec asks for
 * German first, and auto-detection makes "what does a first-time visitor
 * see?" depend on the visitor's browser, which is untestable in CI.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);

  private readonly current = signal<Lang>(this.restore());

  /** The active language. Read this in a template to react to the toggle. */
  readonly lang = this.current.asReadonly();

  /** Every UI string in the active language. */
  readonly t = computed<UiStrings>(() => ui[this.current()]);

  /** The language the toggle button would switch to. */
  readonly other = computed<Lang>(() => (this.current() === 'de' ? 'en' : 'de'));

  constructor() {
    this.applyToDocument(this.current());
  }

  set(lang: Lang): void {
    if (lang === this.current()) {
      return;
    }
    this.current.set(lang);
    this.applyToDocument(lang);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private mode, or storage disabled. The toggle still works for this
      // visit; it just will not be remembered. Not worth telling anyone about.
    }
  }

  toggle(): void {
    this.set(this.other());
  }

  /** Picks the active language out of a `{ de, en }` content value. */
  pick<T>(value: Localized<T>): T {
    return value[this.current()] ?? value[DEFAULT_LANG];
  }

  private restore(): Lang {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return isLang(stored) ? stored : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  }

  /**
   * Keeps `<html lang>` honest.
   *
   * `lang` is not cosmetic: screen readers pick their pronunciation from it,
   * and a German page announced with an English voice is close to unusable.
   *
   * It deliberately does NOT touch `document.title`. This used to write the
   * site title on every language change and clobbered whatever the routed page
   * had just set, so switching language on a tool page lost the tool name
   * (VEG-4 finding 4). `DocumentMeta` is the only writer of the title and the
   * social tags now; it reads `lang()`, so the toggle still updates them.
   */
  private applyToDocument(lang: Lang): void {
    this.document.documentElement.lang = lang;
  }
}
