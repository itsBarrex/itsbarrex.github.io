import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ToolCategory } from '../content/tool.model';

/**
 * One glyph per tool category, inline so the grid costs no extra requests.
 *
 * Decorative: the visible category label beside it carries the meaning, so each
 * is `aria-hidden` and a screen reader never announces a shape.
 */
const PATHS: Record<ToolCategory, string> = {
  // Streamerbot: a bot head, for the action/command extensions.
  streamerbot:
    'M12 2a1 1 0 0 1 1 1v1.6h2.5A4.5 4.5 0 0 1 20 9.1v6.4a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 15.5V9.1a4.5 4.5 0 0 1 4.5-4.5H11V3a1 1 0 0 1 1-1Zm3.5 4.6h-7A2.5 2.5 0 0 0 6 9.1v6.4A2.5 2.5 0 0 0 8.5 18h7a2.5 2.5 0 0 0 2.5-2.5V9.1a2.5 2.5 0 0 0-2.5-2.5ZM9.5 10.3a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Zm5 0a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM9 15h6a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2Z',
  // OBS: a scene/camera rectangle with a lens.
  obs: 'M4 5h12a2 2 0 0 1 2 2v1.7l3.3-2a1 1 0 0 1 1.5.9v8.8a1 1 0 0 1-1.5.9l-3.3-2V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm12 2H4v10h12V7Zm4 2.3-2 1.2v3l2 1.2V9.3ZM9 9.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z',
  // App: a desktop window.
  app: 'M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm16 2H4v2h16V5ZM4 19h16V9H4v10Zm2-8h5v6H6v-6Zm7 0h5v2h-5v-2Zm0 4h5v2h-5v-2Z',
  // Anything untagged: a spanner.
  tool: 'M14.7 2a6.3 6.3 0 0 0-5.9 8.5L2.6 16.7a2 2 0 0 0 0 2.8l1.9 1.9a2 2 0 0 0 2.8 0l6.2-6.2A6.3 6.3 0 0 0 21.9 9l-.4-1.7-3.4 3.4-2.8-2.8L18.7 4.5 17 4.1A6.3 6.3 0 0 0 14.7 2ZM6 19.5 4.5 18l5.9-5.9 1.5 1.5L6 19.5Z',
};

@Component({
  selector: 'app-category-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class CategoryIcon {
  readonly category = input.required<ToolCategory>();
  protected readonly path = () => PATHS[this.category()] ?? PATHS.tool;
}
