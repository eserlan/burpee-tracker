import { html, render, type TemplateResult } from 'lit-html';
import type { Route } from '../router';

const navLink = (route: Route, label: string, current: Route) => {
  const isActive = route === current;
  return html`
    <a
      href="#/${route}"
      class=${[
        'px-3 py-2 rounded-full text-sm font-semibold transition',
        isActive ? 'bg-slate-800 text-sky-300' : 'text-slate-300 hover:text-white'
      ].join(' ')}
    >
      ${label}
    </a>
  `;
};

export const renderShell = (route: Route, content: TemplateResult) => {
  const view = html`
    <div class="min-h-screen">
      <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 class="text-lg font-bold text-white">Burpee +10 Tracker</h1>
            <p class="text-xs text-slate-400">Tap once. Track forever.</p>
          </div>
          <nav class="flex gap-2">
            ${navLink('today', 'Today', route)} ${navLink('history', 'History', route)}
            ${navLink('settings', 'Settings', route)}
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-3xl px-4 py-6">${content}</main>
    </div>
  `;

  const root = document.querySelector('#app');
  if (root) {
    render(view, root);
  }
};
