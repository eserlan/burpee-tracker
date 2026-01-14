import './styles.css';
import { registerSW } from 'virtual:pwa-register';
import { renderShell } from './ui/shell';
import { getRoute, onRouteChange } from './router';
import { initState, state, subscribe } from './state';
import { renderToday } from './pages/today';
import { renderHistory } from './pages/history';
import { renderSettings } from './pages/settings';

const renderRoute = () => {
  const route = getRoute();
  const content = (() => {
    switch (route) {
      case 'history':
        return renderHistory(state, renderRoute);
      case 'settings':
        return renderSettings(state);
      case 'today':
      default:
        return renderToday(state);
    }
  })();
  renderShell(route, content);
};

const start = async () => {
  await initState();
  renderRoute();
  subscribe(renderRoute);
  onRouteChange(renderRoute);

  if ('serviceWorker' in navigator) {
    try {
      registerSW({ immediate: true });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  if (!window.location.hash) {
    window.location.hash = '#/today';
  }
};

start();
