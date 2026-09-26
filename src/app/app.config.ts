import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Lets ToolPage read `:slug` as a component input instead of subscribing
      // to ActivatedRoute.
      withComponentInputBinding(),
      // The header's "Tools" link is routerLink="/" + fragment="tools", which
      // only scrolls if anchor scrolling is on. Position restoration means the
      // back button from a tool page returns to where the grid was, not the top.
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
  ],
};
