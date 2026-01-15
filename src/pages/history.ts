import { html } from 'lit-html';
import type { AppState } from '../state';
import { formatTime } from '../stats';

const expandedDays = new Set<string>();

export const toggleDay = (dateKey: string, rerender: () => void) => {
  if (expandedDays.has(dateKey)) {
    expandedDays.delete(dateKey);
  } else {
    expandedDays.add(dateKey);
  }
  rerender();
};

/** Clear expanded state when leaving the history page to prevent memory leak */
export const clearExpandedDays = (): void => {
  expandedDays.clear();
};

/** Internal helper for testing only */
export const getExpandedDaysCount = (): number => {
  return expandedDays.size;
};

export const renderHistory = (state: AppState, rerender?: () => void) => {
  if (state.derived.history.length === 0) {
    return html`<p class="text-sm text-slate-400">No history yet. Start with a +10.</p>`;
  }

  return html`
    <section class="space-y-4">
      ${state.derived.history.map((day) => {
        const isOpen = expandedDays.has(day.dateKey);
        let runningTotal = 0;

        return html`
          <article class="rounded-2xl border border-slate-800 bg-slate-900">
            <button
              class="flex w-full items-center justify-between px-4 py-3 text-left"
              aria-expanded=${isOpen ? 'true' : 'false'}
              aria-label=${`${day.dateKey}, ${day.total} burpees, ${day.total >= state.dailyGoal ? 'goal met' : 'below goal'}. Click to ${isOpen ? 'collapse' : 'expand'} details.`}
              @click=${() => rerender && toggleDay(day.dateKey, rerender)}
            >
              <div>
                <p class="text-sm font-semibold text-white">${day.dateKey}</p>
                <p class="text-xs text-slate-400">Total ${day.total}</p>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class=${[
                    'rounded-full px-2 py-1 text-xs font-semibold',
                    day.total >= state.dailyGoal
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  ].join(' ')}
                >
                  ${day.total >= state.dailyGoal ? 'Goal met' : 'Below goal'}
                </span>
                <span class="text-slate-500">${isOpen ? '–' : '+'}</span>
              </div>
            </button>
            ${isOpen
              ? html`
                  <div class="border-t border-slate-800 px-4 py-3">
                    <ul class="space-y-2 text-sm text-slate-300">
                      ${day.entries.map((entry) => {
                        runningTotal += entry.count;
                        return html`
                          <li class="flex items-center justify-between">
                            <span>${formatTime(entry.timestamp)} (+10)</span>
                            <span class="text-slate-400">${runningTotal}</span>
                          </li>
                        `;
                      })}
                    </ul>
                  </div>
                `
              : null}
          </article>
        `;
      })}
    </section>
  `;
};
