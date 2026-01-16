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
  } catch (_error) {
    throw new Error('Failed to parse JSON. Please ensure the file is valid JSON.');
  }
  const confirmed = window.confirm('Importing will replace all local data. Continue?');
  if (!confirmed) {
    return;
  }
  await importJson(data);
};

export const updateNotificationStatus = async () => {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const testBtn = document.getElementById('test-notification-btn');
  const enableBtn = document.getElementById('enable-reminders-btn');

  if (!dot || !text) return;

  try {
    if (!('Notification' in window)) {
      dot.className = 'h-2 w-2 rounded-full bg-red-500';
      text.innerText = 'Unsupported';
      text.className = 'text-red-500';
      return;
    }

    if (Notification.permission === 'denied') {
      dot.className = 'h-2 w-2 rounded-full bg-red-500';
      text.innerText = 'Blocked';
      text.className = 'text-red-500';
      return;
    }

    if (Notification.permission === 'granted') {
      testBtn?.classList.remove('hidden');

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        // @ts-expect-error - periodicSync
        if (registration.periodicSync) {
          // @ts-expect-error - periodicSync
          const tags = await registration.periodicSync.getTags();
          if (tags.includes('burpee-reminder')) {
            dot.className = 'h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
            text.innerText = 'Active';
            text.className = 'text-emerald-500';
            if (enableBtn) enableBtn.innerText = 'Update';
            return;
          }
        }
      }

      dot.className = 'h-2 w-2 rounded-full bg-amber-500';
      text.innerText = 'Enabled (No Sync)';
      text.className = 'text-amber-500';
      return;
    }

    dot.className = 'h-2 w-2 rounded-full bg-slate-700';
    text.innerText = 'Not Configured';
    text.className = 'text-slate-500';
  } finally {
    // Schedule next update to handle async state changes (like Service Worker registration or permission changes)
    setTimeout(updateNotificationStatus, 1000);
  }
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

      <div class="rounded-2xl bg-slate-900 p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-widest text-slate-400">Reminders</p>
            <p class="mt-1 text-sm text-slate-200">Notify me if I'm inactive for 3h</p>
            <div id="reminder-status" class="mt-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-tighter">
              <span class="h-2 w-2 rounded-full bg-slate-700" id="status-dot"></span>
              <span class="text-slate-500" id="status-text">Checking status...</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              id="test-notification-btn"
              class="hidden rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 transition active:scale-95"
              @click=${() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Burpee Tracker Test', {
          body: 'This is a test notification. It works!',
          icon: '/burpee-tracker/favicon.svg',
        });
      }
    }}
            >
              Test
            </button>
            <button
              id="enable-reminders-btn"
              class="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition active:scale-95"
              @click=${async () => {
      if (!('Notification' in window)) {
        window.alert('Notifications are not supported on this browser.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        window.alert(
          'Permission denied. Please enable notifications in your browser settings.'
        );
        updateNotificationStatus();
        return;
      }

      if (
        'serviceWorker' in navigator &&
        'periodicSync' in (await navigator.serviceWorker.ready)
      ) {
        const registration = await navigator.serviceWorker.ready;
        try {
          // @ts-expect-error - periodicSync is not yet in the official Typescript types
          await registration.periodicSync.register('burpee-reminder', {
            minInterval: 3 * 60 * 60 * 1000 // 3 hours
          });
          window.alert(
            'Reminders enabled! You will be notified during daytime if you stay inactive.'
          );
        } catch (error) {
          console.error('Periodic Sync registration failed:', error);
          window.alert('Background sync failed. You might need to install the PWA first.');
        }
      } else {
        window.alert(
          'Periodic Sync is not supported on this browser/OS. Reminders might not work in the background.'
        );
      }
      updateNotificationStatus();
    }}
            >
              Enable
            </button>
          </div>
        </div>
        <p class="text-[10px] leading-relaxed text-slate-500">
          Reminders only trigger between 8 AM and 9 PM. Requires a browser that supports Periodic
          Background Sync (like Chrome on Android).
        </p>
      </div>



      <div class="rounded-2xl bg-slate-900 p-4 space-y-3">
        <p class="text-xs uppercase tracking-widest text-slate-400">Data</p>
        <button
          class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-200"
          aria-label="Export all data as JSON file"
          @click=${async () => {
      const json = await exportJson();
      downloadJson(json);
    }}
        >
          Export JSON
        </button>
        <label
          class="flex w-full cursor-pointer flex-col gap-2 text-sm text-slate-300"
          aria-label="Import data from a JSON file"
        >
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
          error instanceof Error && error.message ? error.message : 'Invalid import file.';
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
