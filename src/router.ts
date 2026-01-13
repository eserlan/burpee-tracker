export type Route = 'today' | 'history' | 'settings';

const routes: Route[] = ['today', 'history', 'settings'];

export const getRoute = (): Route => {
  const hash = window.location.hash.replace('#/', '');
  if (routes.includes(hash as Route)) {
    return hash as Route;
  }
  return 'today';
};

export const navigate = (route: Route): void => {
  window.location.hash = `#/${route}`;
};

export const onRouteChange = (handler: () => void): void => {
  window.addEventListener('hashchange', handler);
};
