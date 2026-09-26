import { Lang } from '../i18n/language';

/** Maps our language codes onto the locales Intl expects. */
const LOCALES: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' };

/**
 * Formats a release date in the reader's language.
 *
 * Returns '' for anything unparseable rather than "Invalid Date": the date
 * comes from a GitHub API response, and a broken one should quietly drop out of
 * the layout instead of shouting at the visitor.
 */
export function formatDate(iso: string, lang: Lang): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat(LOCALES[lang], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return iso.slice(0, 10);
  }
}

/** Human-readable asset size, so nobody starts a 400 MB download by accident. */
export function formatBytes(bytes: number | null, lang: Lang): string {
  if (bytes === null || !Number.isFinite(bytes) || bytes <= 0) {
    return '';
  }
  const mb = bytes / 1_000_000;
  const value = mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10;
  const formatted = new Intl.NumberFormat(LOCALES[lang]).format(value);
  return `${formatted} MB`;
}
