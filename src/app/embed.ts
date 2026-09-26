import { DOCUMENT, Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { site } from './content/site';

/**
 * Builds the iframe URLs for Twitch and YouTube embeds.
 *
 * Twitch refuses to render a player unless every hostname that serves the
 * embedding page is listed in a `parent` query parameter — and it fails by
 * showing a blank box, not an error. A hard-coded list is the usual way this
 * breaks: it works on localhost and is empty in production, or vice versa.
 *
 * So the authoritative parent is the hostname we are actually being served
 * from, read at runtime. `site.extraTwitchParents` is layered on top for any
 * additional hostname that embeds this page, and `parent` is repeated once per
 * hostname as Twitch requires.
 *
 * Nothing here loads on page load — see ClickToLoad. These URLs are only built
 * once a visitor has asked for the video.
 */
@Injectable({ providedIn: 'root' })
export class EmbedService {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);

  /** Every hostname allowed to embed the Twitch player, de-duplicated. */
  private readonly parents: string[] = (() => {
    const current = this.document.location?.hostname;
    const all = [...(current ? [current] : []), ...site.extraTwitchParents];
    return [...new Set(all.filter((host) => host.length > 0))];
  })();

  private parentParams(): string {
    return this.parents.map((host) => `parent=${encodeURIComponent(host)}`).join('&');
  }

  /** A single clip, by slug. */
  twitchClipUrl(slug: string): SafeResourceUrl {
    const url =
      `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}` +
      `&${this.parentParams()}&autoplay=false&muted=true`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /** A YouTube video, by id. `youtube-nocookie` avoids the tracking cookies. */
  youtubeUrl(id: string): SafeResourceUrl {
    const url = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /** Hostname shown on the click-to-load placeholder, so the offer is honest. */
  providerHost(kind: 'youtube' | 'twitch-clip'): string {
    return kind === 'youtube' ? 'youtube-nocookie.com' : 'clips.twitch.tv';
  }

  /** Public link to the channel, used by the "Watch on Twitch" buttons. */
  channelUrl(): string {
    return `https://www.twitch.tv/${site.twitchChannel}`;
  }
}
