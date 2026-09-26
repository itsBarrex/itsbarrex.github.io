import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { site } from './content/site';
import { EmbedService } from './embed';

/**
 * The Twitch `parent` parameter is the classic way this site breaks: get it
 * wrong and the embed is a blank box in production while working perfectly on
 * localhost, with no error logged anywhere. These tests pin the behaviour.
 */
describe('EmbedService', () => {
  let embed: EmbedService;
  let sanitizer: DomSanitizer;

  const resolve = (url: SafeResourceUrl) =>
    sanitizer.sanitize(SecurityContext.RESOURCE_URL, url) ?? '';

  beforeEach(() => {
    embed = TestBed.inject(EmbedService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('includes the hostname the page is actually served from', () => {
    const url = resolve(embed.twitchClipUrl('SomeClip-abc'));
    expect(url).toContain(`parent=${document.location.hostname}`);
  });

  it('includes every extra parent listed in site.ts', () => {
    const url = resolve(embed.twitchClipUrl('SomeClip-abc'));
    for (const host of site.extraTwitchParents) {
      expect(url).toContain(`parent=${host}`);
    }
  });

  it('does not repeat a parent that is already the current hostname', () => {
    const url = resolve(embed.twitchClipUrl('SomeClip-abc'));
    const occurrences = url.match(/parent=localhost(?![.\w])/g) ?? [];
    expect(occurrences.length).toBe(1);
  });

  it('points the channel link at the configured channel', () => {
    expect(embed.channelUrl()).toBe(`https://www.twitch.tv/${site.twitchChannel}`);
  });

  it('builds clip and YouTube embeds from bare ids', () => {
    expect(resolve(embed.twitchClipUrl('SomeClip-abc'))).toContain('clip=SomeClip-abc');
    expect(resolve(embed.youtubeUrl('dQw4w9WgXcQ'))).toContain(
      'youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('never autoplays a clip, so no sound arrives unasked', () => {
    const url = resolve(embed.twitchClipUrl('SomeClip-abc'));
    expect(url).toContain('autoplay=false');
    expect(url).toContain('muted=true');
  });

  it('uses the tracking-free YouTube host', () => {
    // youtube.com sets cookies on load; youtube-nocookie.com does not. Combined
    // with click-to-load this is what keeps the site free of a consent banner.
    expect(resolve(embed.youtubeUrl('abc'))).not.toContain('://www.youtube.com');
  });

  it('names the real provider host on the placeholder', () => {
    // The click-to-load placeholder promises where the request will go. If this
    // drifts from the URL actually built above, the promise becomes a lie.
    expect(resolve(embed.youtubeUrl('abc'))).toContain(embed.providerHost('youtube'));
    expect(resolve(embed.twitchClipUrl('abc'))).toContain(embed.providerHost('twitch-clip'));
  });

  it('escapes ids rather than letting them extend the query string', () => {
    const url = resolve(embed.twitchClipUrl('evil&parent=attacker.example'));
    expect(url).not.toContain('&parent=attacker.example');
  });
});
