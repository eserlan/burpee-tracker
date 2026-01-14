import { html } from 'lit-html';
import type { AppState } from '../state';
import { addTen, undoLast } from '../state';

const CELEBRATION_MESSAGES = ['Nice work!', 'Keep it up!', 'Burpees logged!', 'Crushing it!', 'Strong set!'];
const CELEBRATION_ANIMATIONS = ['celebration-pop', 'celebration-spin', 'celebration-bounce'];
const CONFETTI_COLORS = ['#38bdf8', '#fbbf24', '#f472b6', '#4ade80', '#a78bfa'];
const CONFETTI_PIECE_COUNT = 28;
const CELEBRATION_DURATION_MS = 2200;
const CELEBRATION_DELAY_MS = 450;
let celebrationIndex = 0;

const ensureCelebrationLayer = (): HTMLDivElement => {
  let layer = document.querySelector<HTMLDivElement>('.celebration-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'celebration-layer';
    document.body.appendChild(layer);
  }
  return layer;
};

const triggerCelebration = (): void => {
  const layer = ensureCelebrationLayer();
  const message = CELEBRATION_MESSAGES[celebrationIndex % CELEBRATION_MESSAGES.length];
  const animation = CELEBRATION_ANIMATIONS[celebrationIndex % CELEBRATION_ANIMATIONS.length];
  celebrationIndex += 1;

  const messageEl = document.createElement('div');
  messageEl.className = `celebration-message ${animation}`;
  messageEl.textContent = message;
  layer.appendChild(messageEl);

  const confettiShower = document.createElement('div');
  confettiShower.className = 'confetti-shower';

  for (let i = 0; i < CONFETTI_PIECE_COUNT; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty('--confetti-delay', `${Math.random() * 0.4}s`);
    piece.style.setProperty('--confetti-duration', `${1.2 + Math.random() * 0.8}s`);
    piece.style.setProperty('--confetti-rotation', `${Math.random() * 360}deg`);
    piece.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    confettiShower.appendChild(piece);
  }

  layer.appendChild(confettiShower);

  window.setTimeout(() => {
    messageEl.remove();
    confettiShower.remove();
    if (layer.childElementCount === 0) {
      layer.remove();
    }
  }, CELEBRATION_DURATION_MS);
};

const scheduleCelebration = (): void => {
  window.setTimeout(() => {
    triggerCelebration();
  }, CELEBRATION_DELAY_MS);
};

export const renderToday = (state: AppState) => {
  const remaining = Math.max(state.dailyGoal - state.derived.todayTotal, 0);

  return html`
    <section class="space-y-6">
      <div class="rounded-3xl bg-slate-900 p-6 shadow-lg">
        <button
          class="w-full rounded-2xl bg-sky-500 py-10 text-5xl font-black text-slate-950 shadow-lg transition active:scale-95"
          @click=${() => {
            addTen();
            scheduleCelebration();
          }}
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
