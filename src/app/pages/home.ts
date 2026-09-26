import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Promo } from '../sections/promo';
import { ToolGrid } from '../sections/tool-grid';
import { WhatIsThis } from '../sections/what-is-this';

/** Promo top, tool grid, one paragraph. In that order, on purpose. */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Promo, ToolGrid, WhatIsThis],
  template: `
    <app-promo />
    <app-tool-grid />
    <app-what-is-this />
  `,
})
export class Home {}
