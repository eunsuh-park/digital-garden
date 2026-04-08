import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  initialMapLayerTypes,
  MAP_BUILDER_INITIAL_PRESENT_IDS,
} from '@/shared/lib/mapBuilderLayers';

/** @typedef {'select'|'pan'|'rect'|'ellipse'|'triangle'|'polygon'|'polyline'|'pen'} MapBuilderToolId */

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
  const [mapLayerTypes, setMapLayerTypes] = useState(() => initialMapLayerTypes());
  const [mapBuilderTool, setMapBuilderTool] = useState(/** @type {MapBuilderToolId} */ ('select'));
  const [mapUserShapes, setMapUserShapes] = useState([]);
  const prevMapBuilderOpenRef = useRef(false);
  const expandSidePanelRef = useRef(null);
  const mapCanvasControlsRef = useRef(null);

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

  const addMapUserShape = useCallback((shape) => {
    setMapUserShapes((prev) => [...prev, shape]);
  }, []);

  const removeMapUserShape = useCallback((shapeId) => {
    setMapUserShapes((prev) => prev.filter((s) => s.id !== shapeId));
    setMapLayerTypes((prev) => {
      const next = { ...prev };
      delete next[shapeId];
      return next;
    });
    setSelectedMapLayerId((cur) => (cur === shapeId ? null : cur));
    setMapLayerDetailOpenId((cur) => (cur === shapeId ? null : cur));
  }, []);

  const updateMapUserShape = useCallback((shapeId, patch) => {
    setMapUserShapes((prev) =>
      prev.map((s) => (s.id === shapeId ? { ...s, ...patch } : s)),
    );
  }, []);

  const registerMapCanvasControls = useCallback((api) => {
    mapCanvasControlsRef.current = api;
    return () => {
      mapCanvasControlsRef.current = null;
    };
  }, []);

  const zoomMapIn = useCallback(() => {
    mapCanvasControlsRef.current?.zoomIn?.();
  }, []);

  const zoomMapOut = useCallback(() => {
    mapCanvasControlsRef.current?.zoomOut?.();
  }, []);

  const fitMapView = useCallback(() => {
    mapCanvasControlsRef.current?.fitView?.();
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
      setMapLayerTypes(initialMapLayerTypes());
      setMapUserShapes([]);
      setMapBuilderTool('select');
    }
    prevMapBuilderOpenRef.current = true;
  }, [mapBuilderOpen]);

  useEffect(() => {
    if (!selectedMapLayerId) return;
    const inPresent = mapPresentLayerIds.includes(selectedMapLayerId);
    const inUserShapes = mapUserShapes.some((s) => s.id === selectedMapLayerId);
    if (!inPresent && !inUserShapes) {
      setSelectedMapLayerId(null);
      setMapLayerDetailOpenId(null);
    }
  }, [mapPresentLayerIds, mapUserShapes, selectedMapLayerId]);

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
      mapBuilderTool,
      setMapBuilderTool,
      mapUserShapes,
      addMapUserShape,
      updateMapUserShape,
      removeMapUserShape,
      removeMapPresentLayer,
      toggleMapLayerLock,
      expandMapSidePanel,
      registerExpandMapSidePanel,
      registerMapCanvasControls,
      zoomMapIn,
      zoomMapOut,
      fitMapView,
    }),
    [
      mapBuilderOpen,
      selectedMapLayerId,
      mapLayerDetailOpenId,
      mapPresentLayerIds,
      mapLayerLocked,
      mapLayerTypes,
      setMapLayerType,
      mapBuilderTool,
      mapUserShapes,
      addMapUserShape,
      updateMapUserShape,
      removeMapUserShape,
      removeMapPresentLayer,
      toggleMapLayerLock,
      expandMapSidePanel,
      registerExpandMapSidePanel,
      registerMapCanvasControls,
      zoomMapIn,
      zoomMapOut,
      fitMapView,
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
      mapBuilderTool: 'select',
      setMapBuilderTool: () => {},
      mapUserShapes: [],
      addMapUserShape: () => {},
      updateMapUserShape: () => {},
      removeMapUserShape: () => {},
      removeMapPresentLayer: () => {},
      toggleMapLayerLock: () => {},
      expandMapSidePanel: () => {},
      registerExpandMapSidePanel: () => {},
      registerMapCanvasControls: () => () => {},
      zoomMapIn: () => {},
      zoomMapOut: () => {},
      fitMapView: () => {},
    }
  );
}
