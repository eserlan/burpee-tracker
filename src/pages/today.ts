import { html } from 'lit-html';
import type { AppState } from '../state';
import { addTen, undoLast } from '../state';

export const renderToday = (state: AppState) => {
  const remaining = Math.max(state.dailyGoal - state.derived.todayTotal, 0);

  return html`
    <section class="space-y-6">
      <div class="rounded-3xl bg-slate-900 p-6 shadow-lg">
        <button
          class="w-full rounded-2xl bg-sky-500 py-10 text-5xl font-black text-slate-950 shadow-lg transition active:scale-95"
          @click=${() => addTen()}
        >
          +10
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl bg-slate-900 p-4">
          <p class="text-xs uppercase tracking-widest text-slate-400">Today total</p>
          <p class="mt-2 text-3xl font-bold text-white">${state.derived.todayTotal}</p>
        </div>
        <div class="rounded-2xl bg-slate-900 p-4">
          <p class="text-xs uppercase tracking-widest text-slate-400">Goal / Remaining</p>
          <p class="mt-2 text-xl font-semibold text-white">${state.dailyGoal}</p>
          <p class="text-sm text-slate-400">${remaining} remaining</p>
        </div>
        <div class="rounded-2xl bg-slate-900 p-4">
          <p class="text-xs uppercase tracking-widest text-slate-400">Streaks</p>
          <p class="mt-2 text-sm text-slate-300">Current: <span class="font-semibold text-white">${state.derived.currentStreak}</span></p>
          <p class="text-sm text-slate-300">Longest: <span class="font-semibold text-white">${state.derived.longestStreak}</span></p>
        </div>
      </div>

      ${state.derived.canUndoToday
        ? html`
            <button
              class="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              @click=${() => undoLast()}
            >
              Undo last +10
            </button>
          `
        : null}
    </section>
  `;
};
