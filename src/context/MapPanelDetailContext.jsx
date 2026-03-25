import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const MapPanelDetailContext = createContext(null);

/**
 * 하단(MapSidePanel)에서 구역·할 일·식물 항목을 탭하면 전체에 가깝게 확장되는 상세 뷰 상태
 */
export function MapPanelDetailProvider({ children }) {
  const [detail, setDetail] = useState(null);

  const openLocationDetail = useCallback((location) => {
    if (location) setDetail({ type: 'location', location });
  }, []);

  const openTaskDetail = useCallback((task) => {
    if (task) setDetail({ type: 'task', task });
  }, []);

  const openPlantDetail = useCallback((plant) => {
    if (plant) setDetail({ type: 'plant', plant });
  }, []);

  const closeDetail = useCallback(() => setDetail(null), []);

  const value = useMemo(
    () => ({
      detail,
      openLocationDetail,
      openTaskDetail,
      openPlantDetail,
      closeDetail,
    }),
    [detail, openLocationDetail, openTaskDetail, openPlantDetail, closeDetail]
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
