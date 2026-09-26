/**
 * ============================================================================
 *  Site-level content — links, handles, identity
 * ============================================================================
 *
 *  Copy lives in src/app/i18n/strings.ts (UI text) and src/app/content/tools.ts
 *  (tool text). This file holds the things that are the same in every language:
 *  URLs, handles, the channel name.
 *
 *  No URL is ever written into a template. If you need a link, add it here.
 *
 *  Never put a password, token or API key in this file. It ships to the public.
 */

export type SocialPlatform = 'twitch' | 'youtube' | 'x' | 'discord' | 'tiktok' | 'instagram';

export interface SocialLink {
  /** Which glyph to draw. */
  platform: SocialPlatform;
  /** Shown on the chip, e.g. "Twitch". Not translated — they are brand names. */
  label: string;
  /** Shown under the label, e.g. "@itsbarrex". */
  handle: string;
  /** Full URL including https://. */
  url: string;
  /** Set to false to hide it without deleting the line. */
  enabled: boolean;
}

export const site = {
  /** Display name. Not translated. */
  name: 'itsBarrex',

  /** GitHub account the tools live under. Drives the generated tools.json. */
  githubOwner: 'itsBarrex',

  /** The Twitch login name. Drives the channel links. */
  twitchChannel: 'itsbarrex',

  /** His main platform. The promo block's second action. */
  mainSiteUrl: 'https://barrex.stream',

  /**
   * Legal notice. A German site with a public audience needs a reachable
   * Impressum (§5 DDG); his main site already carries one, so the footer links
   * to it rather than duplicating an address we would have to keep in sync.
   */
  imprintUrl: 'https://barrex.stream/impressum',

  /** Where support questions go. Used on every tool page. */
  supportUrl: 'https://discord.gg/barrex',

  /**
   * Static <title> and <meta name="description"> stamped into index.html by
   * scripts/sync-index-meta.mjs.
   *
   * These are German on purpose: crawlers and link unfurlers (Discord, X,
   * WhatsApp) read the HTML without running the app, so they only ever see one
   * language, and German is the default. The in-app title follows the language
   * toggle — see LanguageService.
   */
  indexTitle: 'itsBarrex — Tools für Streamer',
  indexDescription:
    'Streamerbot-Erweiterungen, OBS-Plugins und Apps von itsBarrex. Kostenlos, quelloffen, direkt zum Download.',

  /**
   * Extra hostnames allowed to embed the Twitch player.
   *
   * The site already adds whatever hostname it is served from, so localhost and
   * itsbarrex.github.io work without being listed. Twitch fails a missing
   * `parent` by rendering a blank box with no error, so the Pages hostname is
   * listed explicitly as well: if the embed is ever rendered server-side or
   * proxied, runtime detection alone would not cover it.
   */
  extraTwitchParents: ['itsbarrex.github.io', 'localhost', '127.0.0.1'] as string[],

  /** Footer. Confirmed against his live site — see the research doc on VEG-1. */
  socials: [
    {
      platform: 'twitch',
      label: 'Twitch',
      handle: '@itsbarrex',
      url: 'https://www.twitch.tv/itsbarrex',
      enabled: true,
    },
    {
      platform: 'youtube',
      label: 'YouTube',
      handle: '@itsbarrex',
      url: 'https://www.youtube.com/@itsbarrex',
      enabled: true,
    },
    {
      platform: 'instagram',
      label: 'Instagram',
      handle: '@itsbarrex',
      url: 'https://www.instagram.com/itsbarrex',
      enabled: true,
    },
    {
      platform: 'tiktok',
      label: 'TikTok',
      handle: '@itsbarrex',
      url: 'https://www.tiktok.com/@itsbarrex',
      enabled: true,
    },
    {
      platform: 'discord',
      label: 'Discord',
      handle: 'discord.gg/barrex',
      url: 'https://discord.gg/barrex',
      enabled: true,
    },
  ] as SocialLink[],

  footer: {
    /** Who built it. Leave the URL empty to render it as plain text. */
    builtByUrl: '',
  },
} as const;
