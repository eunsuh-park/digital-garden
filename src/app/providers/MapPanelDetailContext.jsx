import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const MapPanelDetailContext = createContext(null);

/**
 * @typedef {{ type: 'zone', zone: object } | { type: 'task', task: object } | { type: 'plant', plant: object } | { type: 'task-create' } | { type: 'plant-create' } | { type: 'zone-create' }} DetailEntry
 */

export function MapPanelDetailProvider({ children }) {
  const [detailStack, setDetailStack] = useState(() => []);

  const detail = detailStack.length ? detailStack[detailStack.length - 1] : null;

  const openZoneDetail = useCallback((zone, options = {}) => {
    if (!zone) return;
    const entry = { type: 'zone', zone };
    setDetailStack((prev) => (options.push && prev.length > 0 ? [...prev, entry] : [entry]));
  }, []);

  const openTaskDetail = useCallback((task, options = {}) => {
    if (!task) return;
    const entry = { type: 'task', task };
    setDetailStack((prev) => (options.push && prev.length > 0 ? [...prev, entry] : [entry]));
  }, []);

  const openPlantDetail = useCallback((plant, options = {}) => {
    if (!plant) return;
    const entry = { type: 'plant', plant };
    setDetailStack((prev) => (options.push && prev.length > 0 ? [...prev, entry] : [entry]));
  }, []);

  const openTaskCreate = useCallback((options = {}) => {
    const entry = { type: 'task-create' };
    setDetailStack((prev) => (options.push && prev.length > 0 ? [...prev, entry] : [entry]));
  }, []);

  const openPlantCreate = useCallback((options = {}) => {
    const entry = { type: 'plant-create' };
    setDetailStack((prev) => (options.push && prev.length > 0 ? [...prev, entry] : [entry]));
  }, []);

  const openZoneCreate = useCallback((options = {}) => {
    const entry = { type: 'zone-create' };
    setDetailStack((prev) => (options.push && prev.length > 0 ? [...prev, entry] : [entry]));
  }, []);

  const closeDetail = useCallback(() => {
    setDetailStack((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
  }, []);

  const closeAllDetail = useCallback(() => setDetailStack([]), []);

  const value = useMemo(
    () => ({
      detailStack,
      detail,
      openZoneDetail,
      openTaskDetail,
      openPlantDetail,
      openTaskCreate,
      openPlantCreate,
      openZoneCreate,
      closeDetail,
      closeAllDetail,
    }),
    [
      detailStack,
      detail,
      openZoneDetail,
      openTaskDetail,
      openPlantDetail,
      openTaskCreate,
      openPlantCreate,
      openZoneCreate,
      closeDetail,
      closeAllDetail,
    ]
  );

  return <MapPanelDetailContext.Provider value={value}>{children}</MapPanelDetailContext.Provider>;
}

export function useMapPanelDetail() {
  const ctx = useContext(MapPanelDetailContext);
  if (!ctx) {
    throw new Error('useMapPanelDetail은 MapPanelDetailProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
