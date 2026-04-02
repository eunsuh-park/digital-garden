const STORAGE_KEY = 'digital-garden.map-view-preferences.v1';
const CHANGE_EVENT = 'digital-garden:map-view-preferences-change';

export const MAP_VIEW_OPTIONS = [
  { label: '도로 기준 가로', value: 'road-horizontal', base: 'road', direction: 'horizontal' },
  { label: '도로 기준 세로', value: 'road-vertical', base: 'road', direction: 'vertical' },
  { label: '집 기준 가로', value: 'house-horizontal', base: 'house', direction: 'horizontal' },
  { label: '집 기준 세로', value: 'house-vertical', base: 'house', direction: 'vertical' },
];

export const DEFAULT_MAP_VIEW = {
  base: 'road',
  direction: 'horizontal',
};

function normalizeValue(base, direction) {
  const matched = MAP_VIEW_OPTIONS.find((option) => option.base === base && option.direction === direction);
  return matched ? matched : MAP_VIEW_OPTIONS[0];
}

export function getMapViewPreference() {
  if (typeof window === 'undefined') return DEFAULT_MAP_VIEW;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MAP_VIEW;

    const parsed = JSON.parse(raw);
    return normalizeValue(parsed?.base, parsed?.direction);
  } catch {
    return DEFAULT_MAP_VIEW;
  }
}

export function setMapViewPreference(base, direction) {
  if (typeof window === 'undefined') return DEFAULT_MAP_VIEW;

  const next = normalizeValue(base, direction);
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      base: next.base,
      direction: next.direction,
    })
  );
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  return next;
}

export function subscribeMapViewPreference(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event) => {
    if (event.key && event.key !== STORAGE_KEY) return;
    callback(getMapViewPreference());
  };

  const handleChange = (event) => {
    callback(event.detail || getMapViewPreference());
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(CHANGE_EVENT, handleChange);
  };
}
