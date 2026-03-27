import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const MapPanelLayoutContext = createContext(null);

/** 모바일·태블릿: 지도 툴바를 패널과 같은 세로 스택(문서 흐름)으로 둠 */
function useMediaStackedLayout() {
  const [stacked, setStacked] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1023px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const h = () => setStacked(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return stacked;
}

export function MapPanelLayoutProvider({ children }) {
  const stackedLayout = useMediaStackedLayout();

  const value = useMemo(() => ({ stackedLayout }), [stackedLayout]);

  return (
    <MapPanelLayoutContext.Provider value={value}>
      {children}
    </MapPanelLayoutContext.Provider>
  );
}

export function useMapPanelLayout() {
  const ctx = useContext(MapPanelLayoutContext);
  if (!ctx) {
    throw new Error(
      'useMapPanelLayout은 MapPanelLayoutProvider 안에서만 사용할 수 있습니다.'
    );
  }
  return ctx;
}
