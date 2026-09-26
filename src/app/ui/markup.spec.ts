import { Component, SecurityContext, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { site } from '../content/site';
import { Tool, resolveCurated } from '../content/tool.model';
import { EmbedService } from '../embed';
import { SiteFooter } from '../layout/site-footer';
import { ToolCard } from '../sections/tool-card';
import { ToolGrid } from '../sections/tool-grid';
import { Promo } from '../sections/promo';
import { ClickToLoad } from './click-to-load';

/**
 * Rendered-markup rules that fail silently in production.
 *
 * None of these is caught by the compiler or by a build: a link missing
 * `rel="noopener"` still works, an iframe without a title still plays, and an
 * eagerly-loaded embed just makes the page slower. They only show up in an
 * audit — so they are pinned here instead.
 */

const tool: Tool = {
  ...resolveCurated({
    slug: 'widget',
    name: 'Widget',
    category: 'obs',
    status: 'live',
    summary: { de: 'Eine Zeile', en: 'One line' },
    repoUrl: 'https://github.com/itsBarrex/widget',
  }),
  release: {
    version: 'v1.0.0',
    publishedAt: '2026-09-20T10:00:00Z',
    url: 'https://github.com/itsBarrex/widget/releases/tag/v1.0.0',
    download: {
      url: 'https://github.com/itsBarrex/widget/releases/download/v1.0.0/widget.zip',
      name: 'widget.zip',
      sizeBytes: 1024,
    },
  },
};

/** Every anchor that opens a new tab must also drop the opener reference. */
function expectSafeExternalLinks(root: HTMLElement, where: string): void {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')];
  expect(links.length, `${where} rendered no external link to check`).toBeGreaterThan(0);
  for (const link of links) {
    const rel = link.getAttribute('rel') ?? '';
    expect(rel, `${where}: ${link.getAttribute('href')} is missing rel="noopener"`).toContain(
      'noopener',
    );
  }
}

/** Nothing may link to a bare hostname or an http:// URL. */
function expectHttpsLinks(root: HTMLElement, where: string): void {
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const href = link.getAttribute('href') ?? '';
    if (href.startsWith('http')) {
      expect(href, `${where}: ${href} is not https`).toMatch(/^https:\/\//);
    }
  }
}

describe('SiteFooter', () => {
  let fixture: ComponentFixture<SiteFooter>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
  });

  it('opens every outbound link without handing over the opener', () => {
    expectSafeExternalLinks(fixture.nativeElement, 'footer');
  });

  it('uses https everywhere', () => {
    expectHttpsLinks(fixture.nativeElement, 'footer');
  });

  it('carries the Impressum link a German public site needs', () => {
    // §5 DDG. It points at his main site rather than repeating an address we
    // would have to keep in sync, so the URL itself is the thing to check.
    const hrefs = [...fixture.nativeElement.querySelectorAll('a[href]')].map((link) =>
      (link as HTMLAnchorElement).getAttribute('href'),
    );
    expect(hrefs).toContain(site.imprintUrl);
  });

  it('lists every enabled social and no disabled one', () => {
    const hrefs = [...fixture.nativeElement.querySelectorAll('a[href]')].map((link) =>
      (link as HTMLAnchorElement).getAttribute('href'),
    );
    for (const social of site.socials) {
      if (social.enabled) {
        expect(hrefs, `${social.label} is enabled but not rendered`).toContain(social.url);
      } else {
        expect(hrefs, `${social.label} is disabled but still rendered`).not.toContain(social.url);
      }
    }
  });
});

describe('Promo', () => {
  it('opens outbound links safely and points at the configured channel', () => {
    const fixture = TestBed.createComponent(Promo);
    fixture.detectChanges();

    expectSafeExternalLinks(fixture.nativeElement, 'promo');
    expectHttpsLinks(fixture.nativeElement, 'promo');

    const hrefs = [...fixture.nativeElement.querySelectorAll('a[href]')].map((link) =>
      (link as HTMLAnchorElement).getAttribute('href'),
    );
    expect(hrefs).toContain(`https://www.twitch.tv/${site.twitchChannel}`);
    expect(hrefs).toContain(site.mainSiteUrl);
  });
});

describe('ToolCard', () => {
  function render(input: Tool) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ToolCard);
    fixture.componentRef.setInput('tool', input);
    fixture.detectChanges();
    return fixture;
  }

  it('sends the release download out safely', () => {
    expectSafeExternalLinks(render(tool).nativeElement, 'tool card');
  });

  it('renders completely for a tool with no release', () => {
    // The common case early on: he ships the site before most of the tools.
    // The card must still show, with the download slot saying why it is empty.
    const fixture = render({ ...tool, release: null });
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Widget');
    expect(text).toContain('Noch kein Release');
    expect(fixture.nativeElement.querySelectorAll('a[target="_blank"]').length).toBe(0);
  });

  it('does not nest a link inside a link', () => {
    // A link inside a link is invalid HTML that keyboard and screen-reader
    // users cannot get back out of.
    const root = render(tool).nativeElement as HTMLElement;
    for (const link of root.querySelectorAll('a')) {
      expect(link.querySelector('a'), 'nested anchor').toBeNull();
    }
  });

  it('flags our own filler on the card itself', () => {
    const root = render({ ...tool, placeholder: true }).nativeElement as HTMLElement;
    expect(root.textContent).toContain('Beispiel');
  });
});

describe('ToolGrid', () => {
  it('shows an empty state rather than a broken page when nothing is published', () => {
    // No tagged repo at all is a legitimate state, not a failure.
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ToolGrid);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h2')).not.toBeNull();
    expect((root.textContent ?? '').trim().length).toBeGreaterThan(0);
  });
});

describe('ClickToLoad', () => {
  @Component({
    imports: [ClickToLoad],
    template: `<app-click-to-load [src]="src" [title]="title" [provider]="provider" />`,
  })
  class Host {
    private readonly embed = inject(EmbedService);
    readonly src = this.embed.youtubeUrl('dQw4w9WgXcQ');
    readonly title = 'Widget in action';
    readonly provider = this.embed.providerHost('youtube');
  }

  let fixture: ComponentFixture<Host>;
  let root: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('loads nothing at all until someone asks for it', () => {
    // This is what keeps the site free of a consent banner: no request reaches
    // the provider before a deliberate click.
    expect(root.querySelector('iframe')).toBeNull();
    expect(root.querySelector('button')).not.toBeNull();
    expect(root.textContent).toContain('youtube-nocookie.com');
  });

  it('gives the iframe a title and lazy loading once clicked', () => {
    root.querySelector('button')!.click();
    fixture.detectChanges();

    const iframe = root.querySelector('iframe')!;
    expect(iframe, 'no iframe after the click').not.toBeNull();
    expect(iframe.getAttribute('title')).toBe('Widget in action');
    expect(iframe.getAttribute('loading')).toBe('lazy');
    expect(iframe.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
  });

  it('only ever loads a sanitiser-approved URL', () => {
    // `src` is a SafeResourceUrl built by EmbedService, never a raw string from
    // content — so a hostile value in tools.json cannot become an iframe src.
    root.querySelector('button')!.click();
    fixture.detectChanges();

    const sanitizer = TestBed.inject(DomSanitizer);
    const src = root.querySelector('iframe')!.getAttribute('src') ?? '';
    expect(src).toBe(
      sanitizer.sanitize(SecurityContext.RESOURCE_URL, fixture.componentInstance.src),
    );
    expect(src).toContain('youtube-nocookie.com');
  });
});
