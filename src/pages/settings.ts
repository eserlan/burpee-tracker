import { html } from 'lit-html';
import type { AppState } from '../state';
import { exportJson, importJson, setGoal } from '../state';
import type { ExportBlobV1 } from '../types';

const downloadJson = (content: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `burpee-tracker-${new Date().toISOString()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

const handleImport = async (file: File | null) => {
  if (!file) {
    return;
  }
  const text = await file.text();
  let data: ExportBlobV1;
  try {
    data = JSON.parse(text) as ExportBlobV1;
  } catch (error) {
    throw new Error('Failed to parse JSON. Please ensure the file is valid JSON.');
  }
  const confirmed = window.confirm('Importing will replace all local data. Continue?');
  if (!confirmed) {
    return;
  }
  await importJson(data);
};

export const renderSettings = (state: AppState) => {
  return html`
    <section class="space-y-6">
      <div class="rounded-2xl bg-slate-900 p-4">
        <label class="text-xs uppercase tracking-widest text-slate-400">Daily goal</label>
        <input
          class="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          type="number"
          min="10"
          max="1000"
          step="10"
          .value=${String(state.dailyGoal)}
          @change=${(event: Event) => {
            const target = event.target as HTMLInputElement;
            setGoal(Number(target.value));
          }}
        />
        <p class="mt-2 text-xs text-slate-400">Step size: 10. Range: 10–1000.</p>
      </div>

      <div class="rounded-2xl bg-slate-900 p-4 space-y-3">
        <p class="text-xs uppercase tracking-widest text-slate-400">Data</p>
        <button
          class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-200"
          @click=${async () => {
            const json = await exportJson();
            downloadJson(json);
          }}
        >
          Export JSON
        </button>
        <label class="flex w-full cursor-pointer flex-col gap-2 text-sm text-slate-300">
          <span class="font-semibold text-slate-200">Import JSON</span>
          <input
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300"
            type="file"
            accept="application/json"
            @change=${(event: Event) => {
              const target = event.target as HTMLInputElement;
              handleImport(target.files?.[0] ?? null).catch((error) => {
                console.error(error);
                const message =
                  error instanceof Error && error.message
                    ? error.message
                    : 'Invalid import file.';
                window.alert(message);
              });
              target.value = '';
            }}
          />
        </label>
      </div>
    </section>
  `;
};
