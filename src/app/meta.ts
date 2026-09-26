import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

import { site } from './content/site';
import { LanguageService, Localized } from './i18n/language';

/** What a routed page contributes to the title and the social preview. */
export interface PageMeta {
  /**
   * The page's own name — a tool name. Not translated: it is a product name.
   * Rendered as "<name> — itsBarrex".
   */
  name: string;
  /** One line about this page, in both languages. */
  description: Localized<string>;
}

/** Open Graph wants a full locale, not a bare language code. */
const OG_LOCALE: Record<string, string> = { de: 'de_DE', en: 'en_US' };

/**
 * The single owner of `<title>`, `<meta name="description">` and the Open
 * Graph tags.
 *
 * Why a service rather than each page writing the tags itself: two writers
 * fought over `document.title` and the loser was whoever ran second.
 * `LanguageService.applyToDocument()` set the site title on every language
 * change, so switching to EN on /tools/phantom-mirror replaced "Phantom Mirror
 * — itsBarrex" with the generic site title — the exact failure the ToolPage
 * effect's own comment said it existed to prevent (VEG-4 finding 4).
 *
 * Now there is one writer. A page pushes *what it is* with `setPage()`; this
 * service decides how that reads in the active language and writes every tag
 * from one effect. Language changes re-run it, so the tool name survives the
 * toggle and the description and og:* tags follow the language and carry the
 * tool instead of staying German site-level strings (VEG-4 finding 5).
 *
 * The static tags in index.html stay German on purpose — crawlers and link
 * unfurlers read the HTML without running the app, so they only ever see one
 * language and German is the default. See scripts/sync-index-meta.mjs.
 */
@Injectable({ providedIn: 'root' })
export class DocumentMeta {
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);

  /** Null on the home page and anywhere else that is just "the site". */
  private readonly page = signal<PageMeta | null>(null);

  readonly title = computed(() => {
    const page = this.page();
    return page ? `${page.name} — ${site.name}` : this.language.t().meta.title;
  });

  readonly description = computed(() => {
    const page = this.page();
    // A tool with no summary yet falls back to the site blurb rather than
    // publishing an empty description, which unfurls as a blank card.
    return (page && this.language.pick(page.description)) || this.language.t().meta.description;
  });

  constructor() {
    effect(() => this.apply(this.title(), this.description(), this.language.lang()));
  }

  /** Called by a routed page. Pass null to hand the tags back to the site. */
  setPage(meta: PageMeta | null): void {
    this.page.set(meta);
  }

  private apply(title: string, description: string, lang: string): void {
    this.document.title = title;
    this.setContent('name', 'description', description);
    this.setContent('property', 'og:title', title);
    this.setContent('property', 'og:description', description);
    this.setContent('property', 'og:locale', OG_LOCALE[lang] ?? lang);
  }

  /** Updates the tag, or creates it if index.html does not carry one. */
  private setContent(attribute: 'name' | 'property', key: string, value: string): void {
    const head = this.document.head;
    let tag = head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!tag) {
      tag = this.document.createElement('meta');
      tag.setAttribute(attribute, key);
      head.appendChild(tag);
    }
    tag.setAttribute('content', value);
  }
}
