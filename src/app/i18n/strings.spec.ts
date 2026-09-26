import { LANGUAGES } from './language';
import { ui } from './strings';

/**
 * The failure mode these cover: a German page with an English sentence in the
 * middle of it, or an empty label where a string was added to one map and
 * forgotten in the other.
 *
 * TypeScript already catches a *missing* key, because `en` is typed as
 * `UiStrings`. It cannot catch an **empty** one, a key left at its German text
 * in the English map, or a placeholder that lost its `{year}`. Those are the
 * ones that reach production looking like a bug rather than failing the build.
 */
describe('UI strings', () => {
  /** Every leaf string, as `group.key` → value. */
  function flatten(value: unknown, prefix = ''): Map<string, string> {
    const out = new Map<string, string>();
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof entry === 'string') {
        out.set(path, entry);
      } else if (entry && typeof entry === 'object') {
        for (const [nested, nestedValue] of flatten(entry, path)) {
          out.set(nested, nestedValue);
        }
      }
    }
    return out;
  }

  const flat = new Map(LANGUAGES.map((lang) => [lang, flatten(ui[lang])] as const));

  it('ships every language listed in LANGUAGES', () => {
    for (const lang of LANGUAGES) {
      expect(ui[lang], `ui.${lang} is missing`).toBeTruthy();
    }
  });

  it('has exactly the same keys in every language', () => {
    const reference = [...flat.get('de')!.keys()].sort();
    for (const lang of LANGUAGES) {
      expect([...flat.get(lang)!.keys()].sort(), `key set differs for "${lang}"`).toEqual(reference);
    }
  });

  it('has no empty or whitespace-only string', () => {
    for (const lang of LANGUAGES) {
      for (const [key, value] of flat.get(lang)!) {
        expect(value.trim().length, `ui.${lang}.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps the {year} placeholder in the copyright line of every language', () => {
    for (const lang of LANGUAGES) {
      expect(ui[lang].footer.copyright, `ui.${lang}.footer.copyright`).toContain('{year}');
    }
  });

  it('actually translates the sentences instead of repeating the German', () => {
    // Short labels are routinely identical in both languages — "Tools",
    // "Version", "Download", "Links", a domain, a brand name. Listing them all
    // would be an allowlist that has to be updated with every new label, and
    // the thing that actually reaches a reader as a bug is a whole German
    // *sentence* on an English page. So the rule is length, not a list.
    const SENTENCE = 25;
    const de = flat.get('de')!;
    const en = flat.get('en')!;

    const repeated = [...de.keys()].filter((key) => {
      const german = de.get(key)!;
      return german.length > SENTENCE && german === en.get(key);
    });

    expect(repeated, 'these English strings are still the German text').toEqual([]);
  });

  it('switches the language button to the other language, not the current one', () => {
    // The button shows the language it switches TO. Showing the current one is
    // an easy mistake and leaves the toggle looking like it does nothing.
    expect(ui.de.header.languageSwitchTo).toBe('EN');
    expect(ui.en.header.languageSwitchTo).toBe('DE');
  });
});
