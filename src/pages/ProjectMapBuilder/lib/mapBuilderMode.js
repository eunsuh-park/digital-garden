const STORAGE_KEY = 'digital-garden.map-builder-mode.v1';
const CHANGE_EVENT = 'digital-garden:map-builder-mode-change';

export function getMapBuilderMode() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setMapBuilderMode(enabled) {
  if (typeof window === 'undefined') return false;
  const next = Boolean(enabled);
  window.localStorage.setItem(STORAGE_KEY, String(next));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  return next;
}

export function subscribeMapBuilderMode(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event) => {
    if (event.key && event.key !== STORAGE_KEY) return;
    callback(getMapBuilderMode());
  };

  const handleChange = (event) => {
    callback(Boolean(event.detail));
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(CHANGE_EVENT, handleChange);
  };
}
