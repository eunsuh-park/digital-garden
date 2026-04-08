import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import copy2Line from '@iconify-icons/mingcute/copy-2-line';
import delete2Line from '@iconify-icons/mingcute/delete-2-line';
import eyeCloseLine from '@iconify-icons/mingcute/eye-close-line';
import flipHorizontalLine from '@iconify-icons/mingcute/flip-horizontal-line';
import flipVerticalLine from '@iconify-icons/mingcute/flip-vertical-line';
import fullscreen2Line from '@iconify-icons/mingcute/fullscreen-2-line';
import lockLine from '@iconify-icons/mingcute/lock-line';
import targetLine from '@iconify-icons/mingcute/target-line';
import unlockLine from '@iconify-icons/mingcute/unlock-line';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import {
  clampZoom,
  fitBoundsInView,
  getLayerHitBoundsPx,
  zoomWithWheel,
} from '@/shared/lib/mapBuilderLayerBounds';
import { getMapBuilderLayer, mapBuilderRemoveConfirmMessage } from '@/shared/lib/mapBuilderLayers';
import './MapBuilderCanvas.css';

const REGION_HIT_DEFS = [
  { id: 'terrace', label: '테라스 영역 선택', className: 'map-builder-canvas__hit--terrace' },
  { id: 'shed', label: '창고 영역 선택', className: 'map-builder-canvas__hit--shed' },
  { id: 'lawn', label: '잔디밭 영역 선택', className: 'map-builder-canvas__hit--lawn' },
];

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
          <button
            type="button"
            className="map-builder-canvas__selection-tool"
            title="숨김"
            aria-label="숨김"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon icon={eyeCloseLine} width={18} height={18} />
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
    mapPresentLayerIds,
    mapLayerLocked,
    removeMapPresentLayer,
    toggleMapLayerLock,
  } = useProjectNewMapBuilderUi();

  const viewBoxRef = useRef(null);
  const stageRef = useRef(null);
  const viewRef = useRef({ tx: 0, ty: 0, scale: 1 });
  const lastPointerRef = useRef({ x: null, y: null });
  const pinchRef = useRef(null);

  const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
  const selectedRef = useRef(selectedMapLayerId);
  selectedRef.current = selectedMapLayerId;

  viewRef.current = view;

  const selectedLayer = getMapBuilderLayer(selectedMapLayerId);
  const labelText = selectedLayer ? `${selectedLayer.name} · 선택됨` : '선택됨';

  const isPresent = useCallback((id) => mapPresentLayerIds.includes(id), [mapPresentLayerIds]);

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

    if (!selectedMapLayerId || !mapPresentLayerIds.includes(selectedMapLayerId)) {
      setView(centerStageInView(vw, vh, sw, sh, 1));
      return;
    }
    const b = getLayerHitBoundsPx(sw, sh, selectedMapLayerId);
    if (!b) return;
    const next = fitBoundsInView(vw, vh, b.x, b.y, b.w, b.h);
    setView(next);
  }, [selectedMapLayerId, mapPresentLayerIds]);

  useLayoutEffect(() => {
    applyViewInViewBox();
  }, [applyViewInViewBox]);

  useEffect(() => {
    const vb = viewBoxRef.current;
    if (!vb || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (!selectedRef.current) return;
      applyViewInViewBox();
    });
    ro.observe(vb);
    return () => ro.disconnect();
  }, [applyViewInViewBox]);

  const clearCanvasSelection = useCallback(() => {
    setSelectedMapLayerId(null);
    setMapLayerDetailOpenId(null);
  }, [setMapLayerDetailOpenId, setSelectedMapLayerId]);

  const selectFromCanvas = useCallback(
    (layerId) => {
      setSelectedMapLayerId(layerId);
      setMapLayerDetailOpenId(layerId);
      expandMapSidePanel();
    },
    [expandMapSidePanel, setMapLayerDetailOpenId, setSelectedMapLayerId],
  );

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

    function onWheelCapture(e) {
      if (!vb.contains(e.target)) return;
      e.preventDefault();
      const { tx, ty, scale } = viewRef.current;
      const vr = vb.getBoundingClientRect();
      const focal =
        selectedMapLayerId && mapPresentLayerIds.includes(selectedMapLayerId)
          ? focalForZoom()
          : getFocalInView(e.clientX, e.clientY);
      const next = zoomWithWheel(vr.width, vr.height, tx, ty, scale, focal.x, focal.y, e.deltaY);
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
      const newScale = clampZoom(p.startScale * ratio);
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
        <div
          className="map-builder-canvas__world"
          style={{
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
          }}
        >
          <div
            ref={stageRef}
            className="map-builder-canvas__stage"
            onClick={(e) => {
              if (e.target === e.currentTarget) clearCanvasSelection();
            }}
          >
            <div className="map-builder-canvas__roads" aria-hidden>
              <div className="map-builder-canvas__road map-builder-canvas__road--north" />
              <div className="map-builder-canvas__road map-builder-canvas__road--west" />
              <div className="map-builder-canvas__road map-builder-canvas__road--diag" />
            </div>

            {isPresent('base') ? (
              <button
                type="button"
                className={[
                  'map-builder-canvas__lot-border',
                  'map-builder-canvas__hit',
                  selectedMapLayerId === 'base' ? 'map-builder-canvas__lot-border--focused' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label="기본 구역 선택"
                aria-pressed={selectedMapLayerId === 'base'}
                onClick={(e) => {
                  e.stopPropagation();
                  selectFromCanvas('base');
                }}
              />
            ) : null}

            {isPresent('house') ? (
              <>
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
              </>
            ) : null}

            {REGION_HIT_DEFS.filter(({ id }) => isPresent(id)).map(({ id, label, className }) => (
              <button
                key={id}
                type="button"
                className={['map-builder-canvas__hit', className, selectedMapLayerId === id ? `${className}--focused` : '']
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon icon={flipVerticalLine} width={18} height={18} />
                </button>
                <button
                  type="button"
                  className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                  title="가로 뒤집기"
                  aria-label="가로 뒤집기"
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon icon={copy2Line} width={18} height={18} />
                </button>
                <button
                  type="button"
                  className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                  title="앞으로"
                  aria-label="앞으로 가져오기"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon icon={arrowUpLine} width={18} height={18} />
                </button>
                <button
                  type="button"
                  className="map-builder-canvas__chip map-builder-canvas__chip--icon"
                  title="뒤로"
                  aria-label="뒤로 보내기"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon icon={arrowDownLine} width={18} height={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-builder-canvas__fabs" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="map-builder-canvas__fab"
          title="전체 화면"
          aria-label="전체 화면"
          onClick={(e) => e.stopPropagation()}
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
