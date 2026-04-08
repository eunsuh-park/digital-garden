import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MAP_BUILDER_INITIAL_PRESENT_IDS } from '@/shared/lib/mapBuilderLayers';

const ProjectNewMapBuilderUiContext = createContext(undefined);

function initialLockedMap() {
  return MAP_BUILDER_INITIAL_PRESENT_IDS.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
}

export function ProjectNewMapBuilderUiProvider({ children }) {
  const [mapBuilderOpen, setMapBuilderOpen] = useState(false);
  const [selectedMapLayerId, setSelectedMapLayerId] = useState(null);
  const [mapLayerDetailOpenId, setMapLayerDetailOpenId] = useState(null);
  const [mapPresentLayerIds, setMapPresentLayerIds] = useState(() => [...MAP_BUILDER_INITIAL_PRESENT_IDS]);
  const [mapLayerLocked, setMapLayerLocked] = useState(initialLockedMap);
  const [mapLayerTypes, setMapLayerTypes] = useState({});
  const prevMapBuilderOpenRef = useRef(false);
  const expandSidePanelRef = useRef(null);

  const registerExpandMapSidePanel = useCallback((fn) => {
    expandSidePanelRef.current = fn;
  }, []);

  const expandMapSidePanel = useCallback(() => {
    expandSidePanelRef.current?.();
  }, []);

  const removeMapPresentLayer = useCallback((layerId) => {
    setMapPresentLayerIds((prev) => prev.filter((id) => id !== layerId));
    setSelectedMapLayerId((cur) => (cur === layerId ? null : cur));
    setMapLayerDetailOpenId((cur) => (cur === layerId ? null : cur));
  }, []);

  const toggleMapLayerLock = useCallback((layerId) => {
    setMapLayerLocked((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const setMapLayerType = useCallback((layerId, type) => {
    setMapLayerTypes((prev) => ({ ...prev, [layerId]: type }));
  }, []);

  useEffect(() => {
    if (!mapBuilderOpen) {
      prevMapBuilderOpenRef.current = false;
      setSelectedMapLayerId(null);
      setMapLayerDetailOpenId(null);
      return;
    }
    if (!prevMapBuilderOpenRef.current) {
      setMapPresentLayerIds([...MAP_BUILDER_INITIAL_PRESENT_IDS]);
      setMapLayerLocked(initialLockedMap());
      setMapLayerTypes({});
    }
    prevMapBuilderOpenRef.current = true;
  }, [mapBuilderOpen]);

  useEffect(() => {
    if (selectedMapLayerId && !mapPresentLayerIds.includes(selectedMapLayerId)) {
      setSelectedMapLayerId(null);
      setMapLayerDetailOpenId(null);
    }
  }, [mapPresentLayerIds, selectedMapLayerId]);

  const value = useMemo(
    () => ({
      mapBuilderOpen,
      setMapBuilderOpen,
      selectedMapLayerId,
      setSelectedMapLayerId,
      mapLayerDetailOpenId,
      setMapLayerDetailOpenId,
      mapPresentLayerIds,
      setMapPresentLayerIds,
      mapLayerLocked,
      setMapLayerLocked,
      mapLayerTypes,
      setMapLayerType,
      removeMapPresentLayer,
      toggleMapLayerLock,
      expandMapSidePanel,
      registerExpandMapSidePanel,
    }),
    [
      mapBuilderOpen,
      selectedMapLayerId,
      mapLayerDetailOpenId,
      mapPresentLayerIds,
      mapLayerLocked,
      mapLayerTypes,
      setMapLayerType,
      removeMapPresentLayer,
      toggleMapLayerLock,
      expandMapSidePanel,
      registerExpandMapSidePanel,
    ],
  );

  return (
    <ProjectNewMapBuilderUiContext.Provider value={value}>{children}</ProjectNewMapBuilderUiContext.Provider>
  );
}

/** 맵 빌더 UI(패널·선택 동기화). Provider 밖에서는 no-op. */
export function useProjectNewMapBuilderUi() {
  const ctx = useContext(ProjectNewMapBuilderUiContext);
  return (
    ctx ?? {
      mapBuilderOpen: false,
      setMapBuilderOpen: () => {},
      selectedMapLayerId: null,
      setSelectedMapLayerId: () => {},
      mapLayerDetailOpenId: null,
      setMapLayerDetailOpenId: () => {},
      mapPresentLayerIds: [],
      setMapPresentLayerIds: () => {},
      mapLayerLocked: {},
      setMapLayerLocked: () => {},
      mapLayerTypes: {},
      setMapLayerType: () => {},
      removeMapPresentLayer: () => {},
      toggleMapLayerLock: () => {},
      expandMapSidePanel: () => {},
      registerExpandMapSidePanel: () => {},
    }
  );
}
