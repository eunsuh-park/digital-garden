import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import copy2Line from '@iconify-icons/mingcute/copy-2-line';
import delete2Line from '@iconify-icons/mingcute/delete-2-line';
import flipHorizontalLine from '@iconify-icons/mingcute/flip-horizontal-line';
import flipVerticalLine from '@iconify-icons/mingcute/flip-vertical-line';
import fullscreen2Line from '@iconify-icons/mingcute/fullscreen-2-line';
import lockLine from '@iconify-icons/mingcute/lock-line';
import targetLine from '@iconify-icons/mingcute/target-line';
import unlockLine from '@iconify-icons/mingcute/unlock-line';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import {
  getLayerHitBoundsPx,
  MAP_BUILDER_ZOOM_MAX,
  MAP_BUILDER_ZOOM_MIN,
  maxScaleToFitLayerInView,
  zoomWithWheel,
} from '@/shared/lib/mapBuilderLayerBounds';
import { getMapBuilderLayer, mapBuilderRemoveConfirmMessage } from '@/shared/lib/mapBuilderLayers';
import { getShapeBounds } from '@/shared/lib/mapBuilderDrawMath';
import { newUserShapeId } from '@/shared/lib/mapBuilderUserShapes';
import { getShapeInspectorName } from '@/shared/lib/mapBuilderUserShapes';
import MapBuilderUserDrawLayer from './MapBuilderUserDrawLayer';
import './MapBuilderCanvas.css';

const REGION_HIT_DEFS = [
  { id: 'terrace', label: '테라스 영역 선택', className: 'map-builder-canvas__hit--terrace' },
  { id: 'shed', label: '창고 영역 선택', className: 'map-builder-canvas__hit--shed' },
  { id: 'lawn', label: '잔디밭 영역 선택', className: 'map-builder-canvas__hit--lawn' },
];
const OBJECT_FIT_RATIO = 0.7;

function MapLayerSelectionChrome({
  variant,
  labelText,
  locked,
  onToggleLock,
  deletable,
  onRequestDelete,
}) {
  const rootClass = [
    'map-builder-canvas__selection',
    variant === 'house'
      ? 'map-builder-canvas__selection--house'
      : variant === 'shed'
        ? 'map-builder-canvas__selection--shed'
        : 'map-builder-canvas__selection--base',
  ].join(' ');

  const showHandles = variant !== 'base';

  return (
    <div className={rootClass} onClick={(e) => e.stopPropagation()}>
      <div className="map-builder-canvas__selection-head-neg">
        <div className="map-builder-canvas__selection-head">
          <span className="map-builder-canvas__obj-label">{labelText}</span>
          <div className="map-builder-canvas__selection-tools">
          <button
            type="button"
            className="map-builder-canvas__selection-tool"
            title={locked ? '잠금 해제' : '잠금'}
            aria-label={locked ? '잠금 해제' : '잠금'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
          >
            <Icon icon={locked ? lockLine : unlockLine} width={18} height={18} />
          </button>
          {deletable ? (
            <button
              type="button"
              className="map-builder-canvas__selection-tool"
              title="삭제"
              aria-label="삭제"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete();
              }}
            >
              <Icon icon={delete2Line} width={18} height={18} />
            </button>
          ) : (
            <button
              type="button"
              className="map-builder-canvas__selection-tool"
              title="기본 구역은 삭제할 수 없습니다"
              aria-label="삭제 불가"
              disabled
            >
              <Icon icon={delete2Line} width={18} height={18} />
            </button>
          )}
          </div>
        </div>
      </div>
      {showHandles ? (
        <>
          <div className="map-builder-canvas__handle map-builder-canvas__handle--1" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--2" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--3" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--4" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--5" />
        </>
      ) : null}
    </div>
  );
}

function centerStageInView(viewW, viewH, stageW, stageH, scale = 1) {
  return {
    scale,
    tx: viewW / 2 - (stageW * scale) / 2,
    ty: viewH / 2 - (stageH * scale) / 2,
  };
}

function touchDistance(a, b) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

function touchCenter(a, b, vbLeft, vbTop) {
  return {
    x: (a.clientX + b.clientX) / 2 - vbLeft,
    y: (a.clientY + b.clientY) / 2 - vbTop,
  };
}

export default function MapBuilderCanvas() {
  const {
    selectedMapLayerId,
    setSelectedMapLayerId,
    setMapLayerDetailOpenId,
    expandMapSidePanel,
    collapseMapSidePanel,
    mapPresentLayerIds,
    mapLayerLocked,
    mapLayerTypes,
    removeMapPresentLayer,
    toggleMapLayerLock,
    mapBuilderTool,
    setMapBuilderTool,
    mapUserShapes,
    addMapUserShape,
    updateMapUserShape,
    bringForwardMapLayer,
    sendBackwardMapLayer,
    registerMapCanvasControls,
  } = useProjectNewMapBuilderUi();

  const viewBoxRef = useRef(null);
  const stageRef = useRef(null);
  const viewRef = useRef({ tx: 0, ty: 0, scale: 1 });
  const lastPointerRef = useRef({ x: null, y: null });
  const pinchRef = useRef(null);
  const panDragRef = useRef(null);
  const viewBoxSizeRef = useRef({ w: 0, h: 0 });

  const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  viewRef.current = view;

  const invZoomUi = 1 / Math.max(view.scale, MAP_BUILDER_ZOOM_MIN);

  const selectedLayer = getMapBuilderLayer(selectedMapLayerId);
  const selectedUserShape = mapUserShapes.find((s) => s.id === selectedMapLayerId);
  const selectedUserShapeBounds = useMemo(
    () => (selectedUserShape ? getShapeBounds(selectedUserShape.kind, selectedUserShape.geom) : null),
    [selectedUserShape],
  );
  const selectedUserShapeIndex = selectedUserShape
    ? mapUserShapes.findIndex((s) => s.id === selectedUserShape.id)
    : -1;
  const canBringForwardUserShape =
    selectedUserShapeIndex >= 0 && selectedUserShapeIndex < mapUserShapes.length - 1;
  const canSendBackwardUserShape = selectedUserShapeIndex > 0;
  const labelText = selectedLayer
    ? `${selectedLayer.name} · 선택됨`
    : selectedUserShape
      ? `${getShapeInspectorName(selectedUserShape)} · 선택됨`
      : '선택됨';

  const isPresent = useCallback((id) => mapPresentLayerIds.includes(id), [mapPresentLayerIds]);
  const layerTypeClass = useCallback(
    (id) => `map-builder-canvas__region--${mapLayerTypes[id] ?? 'zone'}`,
    [mapLayerTypes],
  );

  const fitTargetToFixedRatio = useCallback((viewW, viewH, bounds) => {
    if (!bounds) return null;
    const targetScale = Math.min(
      (viewW * OBJECT_FIT_RATIO) / Math.max(1, bounds.w),
      (viewH * OBJECT_FIT_RATIO) / Math.max(1, bounds.h),
    );
    const scale = Math.max(MAP_BUILDER_ZOOM_MIN, Math.min(MAP_BUILDER_ZOOM_MAX, targetScale));
    const cx = bounds.x + bounds.w / 2;
    const cy = bounds.y + bounds.h / 2;
    return {
      scale,
      tx: viewW / 2 - cx * scale,
      ty: viewH / 2 - cy * scale,
    };
  }, []);

  const requestRemoveLayer = useCallback(
    (layerId) => {
      const layer = getMapBuilderLayer(layerId);
      const msg = mapBuilderRemoveConfirmMessage(layer, mapLayerLocked);
      if (!msg) return;
      if (!window.confirm(msg)) return;
      removeMapPresentLayer(layerId);
    },
    [mapLayerLocked, removeMapPresentLayer],
  );

  const applyViewInViewBox = useCallback(() => {
    const vb = viewBoxRef.current;
    const st = stageRef.current;
    if (!vb || !st) return;
    const vr = vb.getBoundingClientRect();
    const sw = st.offsetWidth;
    const sh = st.offsetHeight;
    const vw = vr.width;
    const vh = vr.height;
    if (!Number.isFinite(vw) || !Number.isFinite(vh) || vw < 8 || vh < 8) return;

    if (!selectedMapLayerId || selectedMapLayerId === 'base') {
      setView(centerStageInView(vw, vh, sw, sh, 1));
      return;
    }
    if (selectedUserShapeBounds) {
      const next = fitTargetToFixedRatio(vw, vh, {
        x: selectedUserShapeBounds.minX,
        y: selectedUserShapeBounds.minY,
        w: selectedUserShapeBounds.maxX - selectedUserShapeBounds.minX,
        h: selectedUserShapeBounds.maxY - selectedUserShapeBounds.minY,
      });
      if (next) setView(next);
      return;
    }
    if (mapPresentLayerIds.includes(selectedMapLayerId)) {
      const b = getLayerHitBoundsPx(sw, sh, selectedMapLayerId);
      if (!b) return;
      const next = fitTargetToFixedRatio(vw, vh, b);
      if (next) setView(next);
      return;
    }
    setView(centerStageInView(vw, vh, sw, sh, 1));
  }, [fitTargetToFixedRatio, mapPresentLayerIds, selectedMapLayerId, selectedUserShapeBounds]);

  const zoomByFactor = useCallback(
    (factor) => {
      const vb = viewBoxRef.current;
      const st = stageRef.current;
      if (!vb || !st) return;
      const vr = vb.getBoundingClientRect();
      if (!Number.isFinite(vr.width) || !Number.isFinite(vr.height)) return;
      const focal = { x: vr.width / 2, y: vr.height / 2 };
      const { tx, ty, scale } = viewRef.current;
      let cap = MAP_BUILDER_ZOOM_MAX;
      if (selectedMapLayerId && mapPresentLayerIds.includes(selectedMapLayerId)) {
        cap = maxScaleToFitLayerInView(vr.width, vr.height, st.offsetWidth, st.offsetHeight, selectedMapLayerId);
      }
      const newScale = Math.max(MAP_BUILDER_ZOOM_MIN, Math.min(cap, scale * factor));
      const wx = (focal.x - tx) / scale;
      const wy = (focal.y - ty) / scale;
      setView({ scale: newScale, tx: focal.x - wx * newScale, ty: focal.y - wy * newScale });
    },
    [mapPresentLayerIds, selectedMapLayerId],
  );

  useEffect(() => {
    return registerMapCanvasControls({
      zoomIn: () => zoomByFactor(1.15),
      zoomOut: () => zoomByFactor(1 / 1.15),
      fitView: () => applyViewInViewBox(),
    });
  }, [applyViewInViewBox, registerMapCanvasControls, zoomByFactor]);

  useLayoutEffect(() => {
    applyViewInViewBox();
  }, [applyViewInViewBox]);

  useEffect(() => {
    const vb = viewBoxRef.current;
    if (!vb || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const nextW = vb.clientWidth;
      const nextH = vb.clientHeight;
      if (!Number.isFinite(nextW) || !Number.isFinite(nextH) || nextW <= 0 || nextH <= 0) return;
      const prev = viewBoxSizeRef.current;
      if (!prev.w || !prev.h) {
        viewBoxSizeRef.current = { w: nextW, h: nextH };
        return;
      }
      if (prev.w === nextW && prev.h === nextH) return;
      setView((current) => {
        const worldCx = (prev.w / 2 - current.tx) / current.scale;
        const worldCy = (prev.h / 2 - current.ty) / current.scale;
        return {
          ...current,
          tx: nextW / 2 - worldCx * current.scale,
          ty: nextH / 2 - worldCy * current.scale,
        };
      });
      viewBoxSizeRef.current = { w: nextW, h: nextH };
    });
    ro.observe(vb);
    viewBoxSizeRef.current = { w: vb.clientWidth, h: vb.clientHeight };
    return () => ro.disconnect();
  }, []);

  const clearCanvasSelection = useCallback(() => {
    setSelectedMapLayerId(null);
    setMapLayerDetailOpenId(null);
    setMapBuilderTool('select');
    collapseMapSidePanel();
  }, [collapseMapSidePanel, setMapBuilderTool, setMapLayerDetailOpenId, setSelectedMapLayerId]);

  const selectFromCanvas = useCallback(
    (layerId) => {
      if (!layerId || layerId === 'base') return;
      setSelectedMapLayerId(layerId);
      setMapLayerDetailOpenId(layerId);
      setMapBuilderTool('select');
      expandMapSidePanel();
    },
    [expandMapSidePanel, setMapBuilderTool, setMapLayerDetailOpenId, setSelectedMapLayerId],
  );

  const flipSelectedUserShape = useCallback(
    (axis) => {
      if (!selectedUserShape || !selectedUserShapeBounds) return;
      const cx = (selectedUserShapeBounds.minX + selectedUserShapeBounds.maxX) / 2;
      const cy = (selectedUserShapeBounds.minY + selectedUserShapeBounds.maxY) / 2;
      const shape = selectedUserShape;
      if (shape.kind === 'rect') {
        const next =
          axis === 'x'
            ? { ...shape.geom, x: 2 * cx - (shape.geom.x + shape.geom.w) }
            : { ...shape.geom, y: 2 * cy - (shape.geom.y + shape.geom.h) };
        updateMapUserShape(shape.id, { geom: next });
        return;
      }
      if (shape.kind === 'ellipse') {
        const next =
          axis === 'x'
            ? { ...shape.geom, cx: 2 * cx - shape.geom.cx }
            : { ...shape.geom, cy: 2 * cy - shape.geom.cy };
        updateMapUserShape(shape.id, { geom: next });
        return;
      }
      const points = (shape.geom.points || []).map(([x, y]) =>
        axis === 'x' ? [2 * cx - x, y] : [x, 2 * cy - y],
      );
      updateMapUserShape(shape.id, { geom: { ...shape.geom, points } });
    },
    [selectedUserShape, selectedUserShapeBounds, updateMapUserShape],
  );

  const duplicateSelectedUserShape = useCallback(() => {
    if (!selectedUserShape) return;
    const duplicated = {
      ...JSON.parse(JSON.stringify(selectedUserShape)),
      id: newUserShapeId(),
      label: undefined,
    };
    if (duplicated.kind === 'rect') {
      duplicated.geom.x += 16;
      duplicated.geom.y += 16;
    } else if (duplicated.kind === 'ellipse') {
      duplicated.geom.cx += 16;
      duplicated.geom.cy += 16;
    } else if (duplicated.geom?.points) {
      duplicated.geom.points = duplicated.geom.points.map(([x, y]) => [x + 16, y + 16]);
    }
    addMapUserShape(duplicated);
    setSelectedMapLayerId(duplicated.id);
    setMapLayerDetailOpenId(duplicated.id);
  }, [addMapUserShape, selectedUserShape, setMapLayerDetailOpenId, setSelectedMapLayerId]);

  const toggleFullscreen = useCallback(() => {
    const target = viewBoxRef.current;
    if (!target || typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      target.requestFullscreen?.().catch(() => {});
      return;
    }
    document.exitFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    onFullscreenChange();
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const selectionVariant =
    selectedMapLayerId === 'base' || selectedMapLayerId === 'house' || selectedMapLayerId === 'shed'
      ? selectedMapLayerId
      : null;
  const showSelectionChrome =
    selectionVariant && selectedLayer && isPresent(selectionVariant);

  const getFocalInView = useCallback(
    (clientX, clientY) => {
      const vb = viewBoxRef.current;
      if (!vb) return { x: 0, y: 0 };
      const r = vb.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    },
    [],
  );

  const focalForZoom = useCallback(() => {
    const vb = viewBoxRef.current;
    const st = stageRef.current;
    if (!vb || !st) return { x: 0, y: 0 };
    const vr = vb.getBoundingClientRect();
    const sw = st.offsetWidth;
    const sh = st.offsetHeight;
    const vw = vr.width;
    const vh = vr.height;

    if (selectedMapLayerId && mapPresentLayerIds.includes(selectedMapLayerId)) {
      const b = getLayerHitBoundsPx(sw, sh, selectedMapLayerId);
      if (b) {
        const { tx, ty, scale } = viewRef.current;
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        return { x: tx + cx * scale, y: ty + cy * scale };
      }
    }
    const lp = lastPointerRef.current;
    if (lp.x != null && lp.y != null) return { x: lp.x, y: lp.y };
    return { x: vw / 2, y: vh / 2 };
  }, [selectedMapLayerId, mapPresentLayerIds]);

  useEffect(() => {
    const vb = viewBoxRef.current;
    if (!vb) return;

    function zoomCapForInteraction() {
      const st = stageRef.current;
      const vr = vb.getBoundingClientRect();
      if (!st || !Number.isFinite(vr.width) || !Number.isFinite(vr.height)) return MAP_BUILDER_ZOOM_MAX;
      const sw = st.offsetWidth;
      const sh = st.offsetHeight;
      if (selectedMapLayerId && mapPresentLayerIds.includes(selectedMapLayerId)) {
        return maxScaleToFitLayerInView(vr.width, vr.height, sw, sh, selectedMapLayerId);
      }
      return MAP_BUILDER_ZOOM_MAX;
    }

    function onWheelCapture(e) {
      if (!vb.contains(e.target)) return;
      e.preventDefault();
      const { tx, ty, scale } = viewRef.current;
      const vr = vb.getBoundingClientRect();
      const focal =
        selectedMapLayerId && mapPresentLayerIds.includes(selectedMapLayerId)
          ? focalForZoom()
          : getFocalInView(e.clientX, e.clientY);
      const cap = zoomCapForInteraction();
      const next = zoomWithWheel(vr.width, vr.height, tx, ty, scale, focal.x, focal.y, e.deltaY, cap);
      setView(next);
    }

    function onTouchMovePinch(e) {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const p = pinchRef.current;
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = touchDistance(a, b);
      if (p.startDist <= 0) return;
      const ratio = d / p.startDist;
      const cap = zoomCapForInteraction();
      const newScale = Math.max(MAP_BUILDER_ZOOM_MIN, Math.min(cap, p.startScale * ratio));
      const wx = (p.cx - p.startTx) / p.startScale;
      const wy = (p.cy - p.startTy) / p.startScale;
      const nTx = p.cx - wx * newScale;
      const nTy = p.cy - wy * newScale;
      setView({ scale: newScale, tx: nTx, ty: nTy });
    }

    vb.addEventListener('wheel', onWheelCapture, { passive: false, capture: true });
    vb.addEventListener('touchmove', onTouchMovePinch, { passive: false });
    return () => {
      vb.removeEventListener('wheel', onWheelCapture, true);
      vb.removeEventListener('touchmove', onTouchMovePinch);
    };
  }, [focalForZoom, getFocalInView, mapPresentLayerIds, selectedMapLayerId]);

  function onViewPointerMove(e) {
    const vb = viewBoxRef.current;
    if (!vb) return;
    const r = vb.getBoundingClientRect();
    lastPointerRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onTouchStart(e) {
    if (e.touches.length !== 2) return;
    const vb = viewBoxRef.current;
    if (!vb) return;
    const r = vb.getBoundingClientRect();
    const [a, b] = [e.touches[0], e.touches[1]];
    pinchRef.current = {
      startDist: touchDistance(a, b),
      startScale: viewRef.current.scale,
      startTx: viewRef.current.tx,
      startTy: viewRef.current.ty,
      cx: touchCenter(a, b, r.left, r.top).x,
      cy: touchCenter(a, b, r.left, r.top).y,
    };
  }

  function onTouchEnd(e) {
    if (e.touches.length < 2) pinchRef.current = null;
  }

  function onStagePointerDownPan(e) {
    if (mapBuilderTool !== 'pan') return;
    if (e.button !== 0) return;
    if (e.target.closest('button')) return;
    if (e.target.closest('.map-builder-canvas__toolbar-floating')) return;
    const st = stageRef.current;
    if (!st) return;
    panDragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      tx: viewRef.current.tx,
      ty: viewRef.current.ty,
      pid: e.pointerId,
    };
    try {
      st.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onStagePointerMovePan(e) {
    const p = panDragRef.current;
    if (!p || p.pid !== e.pointerId) return;
    const dx = e.clientX - p.sx;
    const dy = e.clientY - p.sy;
    setView({
      scale: viewRef.current.scale,
      tx: p.tx + dx,
      ty: p.ty + dy,
    });
  }

  function onStagePointerUpPan(e) {
    const p = panDragRef.current;
    if (!p || p.pid !== e.pointerId) return;
    panDragRef.current = null;
    const st = stageRef.current;
    try {
      st?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  return (
    <section
      className="map-builder-canvas"
      onClick={(e) => {
        if (e.target === e.currentTarget) clearCanvasSelection();
      }}
    >
      <div
        ref={viewBoxRef}
        className="map-builder-canvas__view-box"
        onPointerMove={onViewPointerMove}
        onPointerLeave={() => {
          lastPointerRef.current = { x: null, y: null };
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget) clearCanvasSelection();
        }}
      >
        <div className="map-builder-canvas__world">
          <div
            ref={stageRef}
            className={[
              'map-builder-canvas__stage',
              mapBuilderTool === 'pan' ? 'map-builder-canvas__stage--pan' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onPointerDown={onStagePointerDownPan}
            onPointerMove={onStagePointerMovePan}
            onPointerUp={onStagePointerUpPan}
            onPointerCancel={onStagePointerUpPan}
            onClick={(e) => {
              if (e.target === e.currentTarget) clearCanvasSelection();
            }}
          >
            <div
              className="map-builder-canvas__stage-scene"
              style={{
                transform: `translate3d(${view.tx}px, ${view.ty}px, 0) scale(${view.scale})`,
                '--mb-inv-zoom': invZoomUi,
              }}
            >
            <div className="map-builder-canvas__roads" aria-hidden>
              <div className="map-builder-canvas__road map-builder-canvas__road--north" />
              <div className="map-builder-canvas__road map-builder-canvas__road--west" />
              <div className="map-builder-canvas__road map-builder-canvas__road--diag" />
            </div>

            {isPresent('base') ? <div className="map-builder-canvas__lot-border" aria-hidden /> : null}

            {isPresent('house') ? (
              <div className={['map-builder-canvas__region', layerTypeClass('house')].join(' ')}>
                <div className="map-builder-canvas__roof" aria-hidden />
                <div className="map-builder-canvas__main-house" aria-hidden />
                <div className="map-builder-canvas__path" aria-hidden />
                <button
                  type="button"
                  className={[
                    'map-builder-canvas__hit',
                    'map-builder-canvas__hit--house',
                    selectedMapLayerId === 'house' ? 'map-builder-canvas__hit--house-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label="집 선택"
                  aria-pressed={selectedMapLayerId === 'house'}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectFromCanvas('house');
                  }}
                />
              </div>
            ) : null}

            {REGION_HIT_DEFS.filter(({ id }) => isPresent(id)).map(({ id, label, className }) => (
              <button
                key={id}
                type="button"
                className={[
                  'map-builder-canvas__hit',
                  'map-builder-canvas__region-hit',
                  className,
                  layerTypeClass(id),
                  selectedMapLayerId === id ? `${className}--focused` : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={label}
                aria-pressed={selectedMapLayerId === id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectFromCanvas(id);
                }}
              />
            ))}

            <MapBuilderUserDrawLayer stageRef={stageRef} view={view} />

            {showSelectionChrome ? (
              <MapLayerSelectionChrome
                variant={selectionVariant}
                labelText={labelText}
                locked={
                  mapLayerLocked[selectionVariant] !== undefined
                    ? mapLayerLocked[selectionVariant]
                    : !!selectedLayer?.locked
                }
                onToggleLock={() => toggleMapLayerLock(selectionVariant)}
                deletable={!!selectedLayer?.deletable}
                onRequestDelete={() => requestRemoveLayer(selectionVariant)}
              />
            ) : null}

            {selectedMapLayerId ? (
              <div
                className="map-builder-canvas__toolbar-floating"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="map-builder-canvas__toolbar-group">
                  <button
                    type="button"
                    className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                    title="세로 뒤집기"
                    aria-label="세로 뒤집기"
                    disabled={!selectedUserShape}
                    onClick={(e) => {
                      e.stopPropagation();
                      flipSelectedUserShape('y');
                    }}
                  >
                    <Icon icon={flipVerticalLine} width={18} height={18} />
                  </button>
                  <button
                    type="button"
                    className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                    title="가로 뒤집기"
                    aria-label="가로 뒤집기"
                    disabled={!selectedUserShape}
                    onClick={(e) => {
                      e.stopPropagation();
                      flipSelectedUserShape('x');
                    }}
                  >
                    <Icon icon={flipHorizontalLine} width={18} height={18} />
                  </button>
                </div>
                <span className="map-builder-canvas__toolbar-divider" aria-hidden />
                <div className="map-builder-canvas__toolbar-group">
                  <button
                    type="button"
                    className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                    title="복제"
                    aria-label="복제"
                    disabled={!selectedUserShape}
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSelectedUserShape();
                    }}
                  >
                    <Icon icon={copy2Line} width={18} height={18} />
                  </button>
                  <button
                    type="button"
                    className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                    title="앞으로"
                    aria-label="앞으로 가져오기"
                    disabled={!canBringForwardUserShape}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedMapLayerId) bringForwardMapLayer(selectedMapLayerId);
                    }}
                  >
                    <Icon icon={arrowUpLine} width={18} height={18} />
                  </button>
                  <button
                    type="button"
                    className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                    title="뒤로"
                    aria-label="뒤로 보내기"
                    disabled={!canSendBackwardUserShape}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedMapLayerId) sendBackwardMapLayer(selectedMapLayerId);
                    }}
                  >
                    <Icon icon={arrowDownLine} width={18} height={18} />
                  </button>
                </div>
              </div>
            ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="map-builder-canvas__fabs" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="map-builder-canvas__fab"
          title={isFullscreen ? '전체 화면 종료' : '전체 화면'}
          aria-label="전체 화면"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
        >
          <Icon icon={fullscreen2Line} width={20} height={20} />
        </button>
        <button
          type="button"
          className="map-builder-canvas__fab"
          title="뷰 맞춤"
          aria-label="뷰 맞춤"
          onClick={(e) => {
            e.stopPropagation();
            applyViewInViewBox();
          }}
        >
          <Icon icon={targetLine} width={20} height={20} />
        </button>
      </div>
    </section>
  );
}
