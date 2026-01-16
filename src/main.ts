import './styles.css';
import { renderShell } from './ui/shell';
import { getRoute, onRouteChange } from './router';
import { initState, state, subscribe } from './state';
import { renderToday } from './pages/today';
import { clearExpandedDays, renderHistory } from './pages/history';
import { renderSettings, updateNotificationStatus } from './pages/settings';

const renderRoute = () => {
  const route = getRoute();
  const content = (() => {
    switch (route) {
      case 'history':
        return renderHistory(state, renderRoute);
      case 'settings':
        clearExpandedDays();
        return renderSettings(state);
      case 'today':
      default:
        clearExpandedDays();
        return renderToday(state);
    }
  })();
  renderShell(route, content);

  if (route === 'settings') {
    updateNotificationStatus();
  }
};

const start = async () => {
  await initState();
  renderRoute();
  subscribe(renderRoute);
  onRouteChange(renderRoute);

  if (!window.location.hash) {
    window.location.hash = '#/today';
  }
};

start();
