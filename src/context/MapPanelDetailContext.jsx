import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const MapPanelDetailContext = createContext(null);

/**
 * 하단(MapSidePanel) 상세 뷰 — 스택으로 뒤로가기 시 이전 상세로 복귀
 * @typedef {{ type: 'location', location: object } | { type: 'task', task: object } | { type: 'plant', plant: object }} DetailEntry
 */

export function MapPanelDetailProvider({ children }) {
  const [detailStack, setDetailStack] = useState(() => []);

  const detail = detailStack.length ? detailStack[detailStack.length - 1] : null;

  const openLocationDetail = useCallback((location, options = {}) => {
    if (!location) return;
    const entry = { type: 'location', location };
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

  /** 스택 한 단계만 닫기 */
  const closeDetail = useCallback(() => {
    setDetailStack((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
  }, []);

  /** 탭·라우트 전환 시 전체 초기화 */
  const closeAllDetail = useCallback(() => setDetailStack([]), []);

  const value = useMemo(
    () => ({
      detailStack,
      detail,
      openLocationDetail,
      openTaskDetail,
      openPlantDetail,
      closeDetail,
      closeAllDetail,
    }),
    [
      detailStack,
      detail,
      openLocationDetail,
      openTaskDetail,
      openPlantDetail,
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
