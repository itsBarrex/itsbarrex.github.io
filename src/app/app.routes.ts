import { Routes } from '@angular/router';

import { Home } from './pages/home';

/**
 * Two real routes and a catch-all.
 *
 * Home is eager because it is the page everyone lands on; the tool page and the
 * not-found page are lazy, so a visitor who only reads the grid never downloads
 * the changelog and click-to-load code.
 *
 * On GitHub Pages `/tools/<slug>` has no file behind it, so Pages answers with
 * 404.html — which scripts/build-pages.mjs writes as a copy of index.html. The
 * app boots, the router reads the real URL, and the deep link works. Without
 * that copy every shared tool link would show GitHub's own 404 page.
 */
export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'tools/:slug',
    loadComponent: () => import('./pages/tool-page').then((m) => m.ToolPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
  },
];
