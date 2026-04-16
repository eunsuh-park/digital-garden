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
  SHAPE_TYPES,
} from '@/shared/lib/mapBuilderLayers';

/** @typedef {'select'|'pan'|'rect'|'ellipse'|'pen'} MapBuilderToolId */

const ProjectNewMapBuilderUiContext = createContext(undefined);

function initialLockedMap() {
  return MAP_BUILDER_INITIAL_PRESENT_IDS.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function zoneLabelFromIndex(index) {
  return `구역 ${index}`;
}

function inferNextZoneNameIndex(userShapes) {
  let maxIndex = 0;
  for (const shape of userShapes || []) {
    const label = String(shape?.label || '').trim();
    const m = label.match(/^구역\s+(\d+)$/);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > maxIndex) maxIndex = n;
  }
  return maxIndex + 1;
}

function normalizeLayerType(type) {
  if (type === 'building' || type === 'path' || type === 'zone') return type;
  return 'zone';
}

/**
 * 레이어 이동 규칙:
 * - 유형 우선순위: 건축물 > 길 > 구역
 * - 유형 간 위치 이동 금지 (같은 유형끼리만 인접 swap 허용)
 */
function moveIdWithinSameType(ids, layerId, direction, typeMap) {
  const index = ids.indexOf(layerId);
  if (index < 0) return { moved: false, ids };
  const nextIndex = direction === 'forward' ? index + 1 : index - 1;
  if (nextIndex < 0 || nextIndex >= ids.length) return { moved: false, ids };

  const currentType = normalizeLayerType(typeMap[layerId]);
  const neighborType = normalizeLayerType(typeMap[ids[nextIndex]]);
  if (currentType !== neighborType) {
    return { moved: false, ids };
  }

  const next = [...ids];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return { moved: true, ids: next };
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
  const [mapSpaceSize, setMapSpaceSize] = useState('medium');
  const [mapZoneNameIndex, setMapZoneNameIndex] = useState(1);
  const [mapSaveState, setMapSaveState] = useState('saved');
  const [, setHistoryVersion] = useState(0);
  const prevMapBuilderOpenRef = useRef(false);
  const pendingDraftRef = useRef(null);
  const expandSidePanelRef = useRef(null);
  const collapseSidePanelRef = useRef(null);
  const mapCanvasControlsRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const mapStateRef = useRef(null);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const snapshotCurrentState = useCallback(() => {
    const st = mapStateRef.current;
    if (!st) return null;
    return {
      mapPresentLayerIds: [...st.mapPresentLayerIds],
      mapLayerLocked: { ...st.mapLayerLocked },
      mapLayerTypes: { ...st.mapLayerTypes },
      mapUserShapes: deepClone(st.mapUserShapes),
      selectedMapLayerId: st.selectedMapLayerId,
      mapLayerDetailOpenId: st.mapLayerDetailOpenId,
      mapZoneNameIndex: st.mapZoneNameIndex,
    };
  }, []);

  const restoreSnapshot = useCallback((snap) => {
    if (!snap) return;
    setMapPresentLayerIds([...snap.mapPresentLayerIds]);
    setMapLayerLocked({ ...snap.mapLayerLocked });
    setMapLayerTypes({ ...snap.mapLayerTypes });
    setMapUserShapes(deepClone(snap.mapUserShapes));
    setSelectedMapLayerId(snap.selectedMapLayerId ?? null);
    setMapLayerDetailOpenId(snap.mapLayerDetailOpenId ?? null);
    setMapZoneNameIndex(Math.max(1, Number(snap.mapZoneNameIndex) || 1));
  }, []);

  const pushUndoSnapshot = useCallback(() => {
    const snap = snapshotCurrentState();
    if (!snap) return;
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > 120) undoStackRef.current.shift();
    redoStackRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, [snapshotCurrentState]);

  const markMapDirty = useCallback(() => {
    setMapSaveState('dirty');
  }, []);

  const registerExpandMapSidePanel = useCallback((fn) => {
    expandSidePanelRef.current = fn;
  }, []);

  const expandMapSidePanel = useCallback(() => {
    expandSidePanelRef.current?.();
  }, []);

  const registerCollapseMapSidePanel = useCallback((fn) => {
    collapseSidePanelRef.current = fn;
  }, []);

  const collapseMapSidePanel = useCallback(() => {
    collapseSidePanelRef.current?.();
  }, []);

  const removeMapPresentLayer = useCallback((layerId) => {
    if (layerId === 'base') return;
    pushUndoSnapshot();
    setMapPresentLayerIds((prev) => prev.filter((id) => id !== layerId));
    setSelectedMapLayerId((cur) => (cur === layerId ? null : cur));
    setMapLayerDetailOpenId((cur) => (cur === layerId ? null : cur));
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const toggleMapLayerLock = useCallback((layerId) => {
    pushUndoSnapshot();
    setMapLayerLocked((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const setMapLayerType = useCallback((layerId, type) => {
    if (!layerId) return;
    const nextType = SHAPE_TYPES.includes(type) ? type : 'zone';
    pushUndoSnapshot();
    setMapLayerTypes((prev) => ({ ...prev, [layerId]: nextType }));
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const addMapUserShape = useCallback((shape) => {
    if (!shape?.id) return;
    const safeIndex = Math.max(1, Number(mapStateRef.current?.mapZoneNameIndex) || 1);
    pushUndoSnapshot();
    setMapZoneNameIndex(safeIndex + 1);
    setMapUserShapes((prev) => [
      ...prev,
      {
        ...shape,
        label: zoneLabelFromIndex(safeIndex),
      },
    ]);
    setMapLayerTypes((prev) => ({
      ...prev,
      [shape.id]: 'zone',
    }));
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const removeMapUserShape = useCallback((shapeId) => {
    pushUndoSnapshot();
    setMapUserShapes((prev) => prev.filter((s) => s.id !== shapeId));
    setMapLayerTypes((prev) => {
      const next = { ...prev };
      delete next[shapeId];
      return next;
    });
    setSelectedMapLayerId((cur) => (cur === shapeId ? null : cur));
    setMapLayerDetailOpenId((cur) => (cur === shapeId ? null : cur));
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const updateMapUserShape = useCallback((shapeId, patch) => {
    pushUndoSnapshot();
    setMapUserShapes((prev) =>
      prev.map((s) => (s.id === shapeId ? { ...s, ...patch } : s)),
    );
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const bringForwardMapLayer = useCallback((layerId) => {
    if (!layerId) return;
    const current = mapStateRef.current;
    if (!current) return;
    let moved = false;

    const userIds = current.mapUserShapes.map((s) => s.id);
    const userMove = moveIdWithinSameType(userIds, layerId, 'forward', current.mapLayerTypes);
    const presentMove = moveIdWithinSameType(
      current.mapPresentLayerIds,
      layerId,
      'forward',
      current.mapLayerTypes,
    );
    moved = userMove.moved || presentMove.moved;
    if (!moved) return;

    pushUndoSnapshot();
    if (userMove.moved) {
      const orderMap = new Map(userMove.ids.map((id, idx) => [id, idx]));
      setMapUserShapes((prev) => [...prev].sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id)));
    }
    if (presentMove.moved) {
      setMapPresentLayerIds(presentMove.ids);
    }
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const sendBackwardMapLayer = useCallback((layerId) => {
    if (!layerId) return;
    const current = mapStateRef.current;
    if (!current) return;
    let moved = false;

    const userIds = current.mapUserShapes.map((s) => s.id);
    const userMove = moveIdWithinSameType(userIds, layerId, 'backward', current.mapLayerTypes);
    const presentMove = moveIdWithinSameType(
      current.mapPresentLayerIds,
      layerId,
      'backward',
      current.mapLayerTypes,
    );
    moved = userMove.moved || presentMove.moved;
    if (!moved) return;

    pushUndoSnapshot();
    if (userMove.moved) {
      const orderMap = new Map(userMove.ids.map((id, idx) => [id, idx]));
      setMapUserShapes((prev) => [...prev].sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id)));
    }
    if (presentMove.moved) {
      setMapPresentLayerIds(presentMove.ids);
    }
    markMapDirty();
  }, [markMapDirty, pushUndoSnapshot]);

  const undoMapAction = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (!prev) return;
    const current = snapshotCurrentState();
    if (current) redoStackRef.current.push(current);
    restoreSnapshot(prev);
    setMapSaveState('dirty');
    setHistoryVersion((v) => v + 1);
  }, [restoreSnapshot, snapshotCurrentState]);

  const redoMapAction = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) return;
    const current = snapshotCurrentState();
    if (current) undoStackRef.current.push(current);
    restoreSnapshot(next);
    setMapSaveState('dirty');
    setHistoryVersion((v) => v + 1);
  }, [restoreSnapshot, snapshotCurrentState]);

  const markMapSaved = useCallback(() => {
    setMapSaveState('saved');
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

  const openWithDraft = useCallback((draft) => {
    pendingDraftRef.current = draft || null;
    setMapBuilderOpen(true);
  }, []);

  useEffect(() => {
    if (!mapBuilderOpen) {
      prevMapBuilderOpenRef.current = false;
      setSelectedMapLayerId(null);
      setMapLayerDetailOpenId(null);
      return;
    }
    if (!prevMapBuilderOpenRef.current) {
      const draft = pendingDraftRef.current;
      if (draft) {
        const presentIds = Array.isArray(draft.mapPresentLayerIds)
          ? [...draft.mapPresentLayerIds]
          : [...MAP_BUILDER_INITIAL_PRESENT_IDS];
        const layerTypes =
          draft.mapLayerTypes && typeof draft.mapLayerTypes === 'object'
            ? { ...draft.mapLayerTypes }
            : initialMapLayerTypes();
        const userShapes = Array.isArray(draft.mapUserShapes) ? deepClone(draft.mapUserShapes) : [];
        const nextMapSpaceSize = typeof draft.mapSpaceSize === 'string' ? draft.mapSpaceSize : 'medium';
        const nextZoneNameIndex = Math.max(
          1,
          Number(draft.nextZoneNameIndex) || inferNextZoneNameIndex(userShapes),
        );

        setMapPresentLayerIds(presentIds);
        setMapLayerLocked(initialLockedMap());
        setMapLayerTypes(layerTypes);
        setMapUserShapes(userShapes);
        setMapSpaceSize(nextMapSpaceSize);
        setMapZoneNameIndex(nextZoneNameIndex);
        pendingDraftRef.current = null;
      } else {
        setMapPresentLayerIds([...MAP_BUILDER_INITIAL_PRESENT_IDS]);
        setMapLayerLocked(initialLockedMap());
        setMapLayerTypes(initialMapLayerTypes());
        setMapUserShapes([]);
        setMapSpaceSize('medium');
        setMapZoneNameIndex(1);
      }
      setMapBuilderTool('select');
      setMapSaveState('saved');
      undoStackRef.current = [];
      redoStackRef.current = [];
      setHistoryVersion((v) => v + 1);
    }
    prevMapBuilderOpenRef.current = true;
  }, [mapBuilderOpen]);

  useEffect(() => {
    if (!selectedMapLayerId) return;
    if (selectedMapLayerId === 'base') {
      setSelectedMapLayerId(null);
      setMapLayerDetailOpenId(null);
      return;
    }
    const inPresent = mapPresentLayerIds.includes(selectedMapLayerId);
    const inUserShapes = mapUserShapes.some((s) => s.id === selectedMapLayerId);
    if (!inPresent && !inUserShapes) {
      setSelectedMapLayerId(null);
      setMapLayerDetailOpenId(null);
    }
  }, [mapPresentLayerIds, mapUserShapes, selectedMapLayerId]);

  useEffect(() => {
    mapStateRef.current = {
      mapPresentLayerIds,
      mapLayerLocked,
      mapLayerTypes,
      mapUserShapes,
      selectedMapLayerId,
      mapLayerDetailOpenId,
      mapZoneNameIndex,
    };
  }, [
    mapPresentLayerIds,
    mapLayerLocked,
    mapLayerTypes,
    mapUserShapes,
    selectedMapLayerId,
    mapLayerDetailOpenId,
    mapZoneNameIndex,
  ]);

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
      mapSpaceSize,
      setMapSpaceSize,
      addMapUserShape,
      updateMapUserShape,
      bringForwardMapLayer,
      sendBackwardMapLayer,
      removeMapUserShape,
      removeMapPresentLayer,
      toggleMapLayerLock,
      expandMapSidePanel,
      registerExpandMapSidePanel,
      collapseMapSidePanel,
      registerCollapseMapSidePanel,
      registerMapCanvasControls,
      zoomMapIn,
      zoomMapOut,
      fitMapView,
      openWithDraft,
      mapZoneNameIndex,
      mapSaveState,
      setMapSaveState,
      markMapSaved,
      undoMapAction,
      redoMapAction,
      canUndo,
      canRedo,
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
      mapSpaceSize,
      addMapUserShape,
      updateMapUserShape,
      bringForwardMapLayer,
      sendBackwardMapLayer,
      removeMapUserShape,
      removeMapPresentLayer,
      toggleMapLayerLock,
      expandMapSidePanel,
      registerExpandMapSidePanel,
      collapseMapSidePanel,
      registerCollapseMapSidePanel,
      registerMapCanvasControls,
      zoomMapIn,
      zoomMapOut,
      fitMapView,
      openWithDraft,
      mapZoneNameIndex,
      mapSaveState,
      markMapSaved,
      undoMapAction,
      redoMapAction,
      canUndo,
      canRedo,
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
      mapSpaceSize: 'medium',
      setMapSpaceSize: () => {},
      addMapUserShape: () => {},
      updateMapUserShape: () => {},
      bringForwardMapLayer: () => {},
      sendBackwardMapLayer: () => {},
      removeMapUserShape: () => {},
      removeMapPresentLayer: () => {},
      toggleMapLayerLock: () => {},
      expandMapSidePanel: () => {},
      registerExpandMapSidePanel: () => {},
      collapseMapSidePanel: () => {},
      registerCollapseMapSidePanel: () => {},
      registerMapCanvasControls: () => () => {},
      zoomMapIn: () => {},
      zoomMapOut: () => {},
      fitMapView: () => {},
      openWithDraft: () => {},
      mapZoneNameIndex: 1,
      mapSaveState: 'saved',
      setMapSaveState: () => {},
      markMapSaved: () => {},
      undoMapAction: () => {},
      redoMapAction: () => {},
      canUndo: false,
      canRedo: false,
    }
  );
}
