import { useSyncExternalStore } from 'react';

// Matches Bootstrap's default `md` breakpoint used by the `d-md-*` classes.
const DESKTOP_QUERY = '(min-width: 768px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/**
 * Tracks whether the viewport is at or above the desktop breakpoint.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}
