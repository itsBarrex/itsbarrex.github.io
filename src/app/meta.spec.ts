import { TestBed } from '@angular/core/testing';

import { LanguageService } from './i18n/language';
import { ui } from './i18n/strings';
import { DocumentMeta } from './meta';

/**
 * These pin the two failures that shipped in the first zip and that nothing
 * would have caught: both are invisible on the page itself.
 *
 * Finding 4 — two services wrote `document.title` and the loser was whoever
 * ran second, so switching language on a tool page replaced the tool name with
 * the site title. Nothing throws, the page looks right, and only the tab and
 * the browser history are wrong.
 *
 * Finding 5 — the description and `og:*` tags never moved off the German
 * site-level strings, so every tool link unfurled in Discord as the generic
 * site blurb. Invisible unless you paste a link somewhere that unfurls it.
 */
describe('DocumentMeta', () => {
  let meta: DocumentMeta;
  let language: LanguageService;

  const tag = (selector: string) =>
    document.head.querySelector<HTMLMetaElement>(selector)?.getAttribute('content') ?? '';

  const description = () => tag('meta[name="description"]');
  const ogTitle = () => tag('meta[property="og:title"]');
  const ogDescription = () => tag('meta[property="og:description"]');
  const ogLocale = () => tag('meta[property="og:locale"]');

  const PAGE = {
    name: 'Phantom Mirror',
    description: { de: 'Spiegelt jede Quelle.', en: 'Mirrors any source.' },
  };

  beforeEach(() => {
    language = TestBed.inject(LanguageService);
    meta = TestBed.inject(DocumentMeta);
    language.set('de');
    meta.setPage(null);
    TestBed.tick();
  });

  it('puts the tool name in the title and leaves it there across a language switch', () => {
    meta.setPage(PAGE);
    TestBed.tick();
    expect(document.title).toBe('Phantom Mirror — itsBarrex');

    language.set('en');
    TestBed.tick();
    // The regression: this used to fall back to the site title.
    expect(document.title).toBe('Phantom Mirror — itsBarrex');
  });

  it('falls back to the site title when no page has claimed the tags', () => {
    expect(document.title).toBe(ui.de.meta.title);

    language.set('en');
    TestBed.tick();
    expect(document.title).toBe(ui.en.meta.title);
  });

  it('hands the tags back to the site when the page is destroyed', () => {
    meta.setPage(PAGE);
    TestBed.tick();
    meta.setPage(null);
    TestBed.tick();

    expect(document.title).toBe(ui.de.meta.title);
    expect(ogTitle()).toBe(ui.de.meta.title);
  });

  it('carries the tool into the description and the og tags, in the active language', () => {
    meta.setPage(PAGE);
    TestBed.tick();
    expect(description()).toBe(PAGE.description.de);
    expect(ogDescription()).toBe(PAGE.description.de);
    expect(ogTitle()).toBe('Phantom Mirror — itsBarrex');

    language.set('en');
    TestBed.tick();
    expect(description()).toBe(PAGE.description.en);
    expect(ogDescription()).toBe(PAGE.description.en);
  });

  it('switches the site-level description with the language too', () => {
    expect(description()).toBe(ui.de.meta.description);

    language.set('en');
    TestBed.tick();
    expect(description()).toBe(ui.en.meta.description);
  });

  it('writes a full og:locale rather than a bare language code', () => {
    // "de" is not a valid og:locale; unfurlers want the territory.
    expect(ogLocale()).toBe('de_DE');

    language.set('en');
    TestBed.tick();
    expect(ogLocale()).toBe('en_US');
  });

  it('falls back to the site blurb rather than publishing an empty description', () => {
    meta.setPage({ name: 'Nameless', description: { de: '', en: '' } });
    TestBed.tick();

    // An empty description unfurls as a blank card, which is worse than a
    // generic one.
    expect(description()).toBe(ui.de.meta.description);
  });
});
