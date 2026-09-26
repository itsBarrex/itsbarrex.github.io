import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme';

/**
 * Finding 2, the half of it that is a behaviour rather than a colour value:
 * the site used to follow the OS `prefers-color-scheme`, so a light-mode phone
 * arriving from his Twitch panel got a near-white page sharing no identity
 * with barrex.stream — and it got the light palette, which was the palette
 * failing AA on nine text roles.
 *
 * Dark is now unconditional and light is a deliberate choice. That is one line
 * in `initial()` and exactly the kind of line a later refactor "helpfully"
 * puts back, so it is pinned here.
 */
describe('ThemeService', () => {
  const STORAGE_KEY = 'itsbarrex.theme';

  /**
   * Makes the OS ask for light, as a light-mode phone would.
   *
   * Defined rather than spied on: this environment has no `matchMedia` at all,
   * which is itself the point — the service must not reach for it. Stubbing it
   * in is what makes "ignored" different from "absent".
   */
  function osPrefersLight(): void {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query.includes('light'),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
  }

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.unstubAllGlobals();
  });

  it('starts dark for a visitor whose OS asks for light', () => {
    osPrefersLight();
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });

  it('writes the theme onto <html data-theme> so the tokens apply', () => {
    TestBed.inject(ThemeService);
    TestBed.tick();
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('still honours a stored choice, including light', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    osPrefersLight();
    expect(TestBed.inject(ThemeService).theme()).toBe('light');
  });

  it('remembers the toggle, so light is sticky once chosen on purpose', () => {
    const theme = TestBed.inject(ThemeService);
    theme.toggle();
    TestBed.tick();

    expect(theme.theme()).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('falls back to dark when storage holds something that is not a theme', () => {
    localStorage.setItem(STORAGE_KEY, 'solarized');
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });
});
