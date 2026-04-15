import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import {
  distanceSq,
  getShapeBounds,
  normalizeRect,
  pointsToSvg,
  rectMinSize,
  rotatePoint,
  viewBoxClientToMapSpace,
} from '@/shared/lib/mapBuilderDrawMath';
import { newUserShapeId } from '@/shared/lib/mapBuilderUserShapes';
import { getLayerHitBoundsPx } from '@/shared/lib/mapBuilderLayerBounds';

const STROKE = '#6c4db2';
const STROKE_SEL = '#4e7424';
const FILL = 'rgba(108, 77, 178, 0.22)';
const MIN_TRANSFORM_SIZE = 6;
const ROTATE_HANDLE_OFFSET = 28;
const HANDLE_R = 6;

function cursorForTool(tool) {
  switch (tool) {
    case 'pan':
      return 'grab';
    case 'rect':
    case 'ellipse':
    case 'triangle':
    case 'polygon':
    case 'polyline':
    case 'pen':
      return 'crosshair';
    default:
      return 'default';
  }
}

function renderCommittedShape(shape, selected, onSelect) {
  const isSel = selected === shape.id;
  const sw = isSel ? 3 : 2;
  const stroke = isSel ? STROKE_SEL : STROKE;

  const common = {
    onPointerDown: (e) => onSelect(shape, e),
    style: { cursor: 'pointer' },
  };

  switch (shape.kind) {
    case 'rect': {
      const { x, y, w, h } = shape.geom;
      return (
        <rect
          key={shape.id}
          x={x}
          y={y}
          width={w}
          height={h}
          fill={FILL}
          stroke={stroke}
          strokeWidth={sw}
          {...common}
        />
      );
    }
    case 'ellipse': {
      const { cx, cy, rx, ry } = shape.geom;
      return (
        <ellipse
          key={shape.id}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={FILL}
          stroke={stroke}
          strokeWidth={sw}
          {...common}
        />
      );
    }
    case 'triangle':
    case 'polygon': {
      const pts = shape.geom.points;
      return (
        <polygon
          key={shape.id}
          points={pointsToSvg(pts)}
          fill={FILL}
          stroke={stroke}
          strokeWidth={sw}
          {...common}
        />
      );
    }
    case 'polyline':
    case 'freepath': {
      const pts = shape.geom.points;
      return (
        <polyline
          key={shape.id}
          points={pointsToSvg(pts)}
          fill="none"
          stroke={stroke}
          strokeWidth={Math.max(3, sw)}
          strokeLinejoin="round"
          strokeLinecap="round"
          {...common}
        />
      );
    }
    default:
      return null;
  }
}

function cloneShape(shape) {
  return {
    ...shape,
    geom: JSON.parse(JSON.stringify(shape.geom || {})),
  };
}

function moveShapeGeom(shape, dx, dy) {
  if (!shape?.geom) return shape;
  if (shape.kind === 'rect') {
    return { ...shape, geom: { ...shape.geom, x: shape.geom.x + dx, y: shape.geom.y + dy } };
  }
  if (shape.kind === 'ellipse') {
    return { ...shape, geom: { ...shape.geom, cx: shape.geom.cx + dx, cy: shape.geom.cy + dy } };
  }
  const points = (shape.geom.points || []).map(([x, y]) => [x + dx, y + dy]);
  return { ...shape, geom: { ...shape.geom, points } };
}

function resizeShapeGeom(shape, startBounds, nextBounds) {
  if (!shape?.geom || !startBounds || !nextBounds) return shape;
  const sw = Math.max(MIN_TRANSFORM_SIZE, startBounds.maxX - startBounds.minX);
  const sh = Math.max(MIN_TRANSFORM_SIZE, startBounds.maxY - startBounds.minY);
  const nw = Math.max(MIN_TRANSFORM_SIZE, nextBounds.maxX - nextBounds.minX);
  const nh = Math.max(MIN_TRANSFORM_SIZE, nextBounds.maxY - nextBounds.minY);

  if (shape.kind === 'rect') {
    return {
      ...shape,
      geom: {
        x: nextBounds.minX,
        y: nextBounds.minY,
        w: nw,
        h: nh,
      },
    };
  }

  if (shape.kind === 'ellipse') {
    return {
      ...shape,
      geom: {
        cx: nextBounds.minX + nw / 2,
        cy: nextBounds.minY + nh / 2,
        rx: nw / 2,
        ry: nh / 2,
      },
    };
  }

  const points = (shape.geom.points || []).map(([x, y]) => {
    const nx = (x - startBounds.minX) / sw;
    const ny = (y - startBounds.minY) / sh;
    return [nextBounds.minX + nx * nw, nextBounds.minY + ny * nh];
  });
  return { ...shape, geom: { ...shape.geom, points } };
}

function rotateShapeGeom(shape, rad, bounds) {
  if (!shape?.geom || !bounds || Math.abs(rad) < 1e-4) return shape;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  if (shape.kind === 'ellipse') {
    return shape;
  }

  if (shape.kind === 'rect') {
    const { x, y, w, h } = shape.geom;
    const corners = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ].map(([px, py]) => rotatePoint(px, py, cx, cy, rad));
    return { ...shape, kind: 'polygon', geom: { points: corners } };
  }

  const points = (shape.geom.points || []).map(([x, y]) => rotatePoint(x, y, cx, cy, rad));
  return { ...shape, geom: { ...shape.geom, points } };
}

function resizeBoundsFromHandle(startBounds, handle, nextX, nextY) {
  const minX = startBounds.minX;
  const minY = startBounds.minY;
  const maxX = startBounds.maxX;
  const maxY = startBounds.maxY;
  const clampX = Number.isFinite(nextX) ? nextX : minX;
  const clampY = Number.isFinite(nextY) ? nextY : minY;

  let nMinX = minX;
  let nMinY = minY;
  let nMaxX = maxX;
  let nMaxY = maxY;

  if (handle.includes('w')) nMinX = Math.min(clampX, maxX - MIN_TRANSFORM_SIZE);
  if (handle.includes('e')) nMaxX = Math.max(clampX, minX + MIN_TRANSFORM_SIZE);
  if (handle.includes('n')) nMinY = Math.min(clampY, maxY - MIN_TRANSFORM_SIZE);
  if (handle.includes('s')) nMaxY = Math.max(clampY, minY + MIN_TRANSFORM_SIZE);

  return { minX: nMinX, minY: nMinY, maxX: nMaxX, maxY: nMaxY };
}

/**
 * 사용자 도형 SVG + 그리기 상호작용(도구별).
 * @param {{ stageRef: React.RefObject<HTMLElement|null>, view: { tx: number, ty: number, scale: number } }} props
 */
export default function MapBuilderUserDrawLayer({ stageRef, view }) {
  const {
    mapBuilderTool,
    mapUserShapes,
    mapLayerLocked,
    addMapUserShape,
    updateMapUserShape,
    selectedMapLayerId,
    setSelectedMapLayerId,
    setMapLayerDetailOpenId,
    expandMapSidePanel,
  } = useProjectNewMapBuilderUi();

  const [draft, setDraft] = useState(null);
  const dragRef = useRef(null);
  const transformRef = useRef(null);
  const polyAccumRef = useRef([]);
  const lineAccumRef = useRef([]);
  const triAccumRef = useRef([]);

  const resetAccum = useCallback(() => {
    polyAccumRef.current = [];
    lineAccumRef.current = [];
    triAccumRef.current = [];
    setDraft(null);
    dragRef.current = null;
  }, []);

  useEffect(() => {
    resetAccum();
  }, [mapBuilderTool, resetAccum]);

  const selectShape = useCallback(
    (shape, e) => {
      e.stopPropagation();
      setSelectedMapLayerId(shape.id);
      setMapLayerDetailOpenId(shape.id);
      expandMapSidePanel();
    },
    [expandMapSidePanel, setMapLayerDetailOpenId, setSelectedMapLayerId],
  );

  const finalizePolygon = useCallback(() => {
    const pts = polyAccumRef.current;
    if (pts.length >= 3) {
      addMapUserShape({
        id: newUserShapeId(),
        kind: 'polygon',
        geom: { points: pts.map((p) => [...p]) },
      });
    }
    polyAccumRef.current = [];
    setDraft(null);
  }, [addMapUserShape]);

  const finalizePolyline = useCallback(() => {
    const pts = lineAccumRef.current;
    if (pts.length >= 2) {
      addMapUserShape({
        id: newUserShapeId(),
        kind: 'polyline',
        geom: { points: pts.map((p) => [...p]) },
      });
    }
    lineAccumRef.current = [];
    setDraft(null);
  }, [addMapUserShape]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        resetAccum();
        return;
      }
      if (e.key === 'Enter') {
        if (mapBuilderTool === 'polygon') finalizePolygon();
        if (mapBuilderTool === 'polyline') finalizePolyline();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finalizePolygon, finalizePolyline, mapBuilderTool, resetAccum]);

  const selectedShape =
    selectedMapLayerId && mapBuilderTool === 'select'
      ? mapUserShapes.find((s) => s.id === selectedMapLayerId) || null
      : null;
  const selectedLocked = Boolean(selectedShape && mapLayerLocked[selectedShape.id]);
  const selectedBounds = selectedShape ? getShapeBounds(selectedShape.kind, selectedShape.geom) : null;

  const mapPointer = useCallback((e) => {
    const st = stageRef.current;
    if (!st) return { x: 0, y: 0 };
    return viewBoxClientToMapSpace(st, e.clientX, e.clientY, view.tx, view.ty, view.scale);
  }, [stageRef, view.scale, view.tx, view.ty]);

  const clampToBase = useCallback(
    (x, y) => {
      const st = stageRef.current;
      if (!st) return { x, y };
      const bounds = getLayerHitBoundsPx(st.offsetWidth, st.offsetHeight, 'base');
      if (!bounds) return { x, y };
      return {
        x: Math.min(bounds.x + bounds.w, Math.max(bounds.x, x)),
        y: Math.min(bounds.y + bounds.h, Math.max(bounds.y, y)),
      };
    },
    [stageRef],
  );

  const beginTransform = useCallback(
    (mode, e, options = {}) => {
      if (!selectedShape || selectedLocked) return;
      const startPt = mapPointer(e);
      const startBounds = getShapeBounds(selectedShape.kind, selectedShape.geom);
      if (!startBounds) return;
      transformRef.current = {
        mode,
        pointerId: e.pointerId,
        startPt,
        startShape: cloneShape(selectedShape),
        startBounds,
        handle: options.handle || null,
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      e.preventDefault();
      e.stopPropagation();
    },
    [mapPointer, selectedLocked, selectedShape],
  );

  const updateTransform = useCallback(
    (e) => {
      const t = transformRef.current;
      if (!t || t.pointerId !== e.pointerId) return;
      const now = mapPointer(e);
      if (t.mode === 'move') {
        const dx = now.x - t.startPt.x;
        const dy = now.y - t.startPt.y;
        const next = moveShapeGeom(t.startShape, dx, dy);
        updateMapUserShape(t.startShape.id, { kind: next.kind, geom: next.geom });
        return;
      }
      if (t.mode === 'resize') {
        const nextBounds = resizeBoundsFromHandle(t.startBounds, t.handle, now.x, now.y);
        const next = resizeShapeGeom(t.startShape, t.startBounds, nextBounds);
        updateMapUserShape(t.startShape.id, { kind: next.kind, geom: next.geom });
        return;
      }
      if (t.mode === 'rotate') {
        const cx = (t.startBounds.minX + t.startBounds.maxX) / 2;
        const cy = (t.startBounds.minY + t.startBounds.maxY) / 2;
        const a0 = Math.atan2(t.startPt.y - cy, t.startPt.x - cx);
        const a1 = Math.atan2(now.y - cy, now.x - cx);
        const next = rotateShapeGeom(t.startShape, a1 - a0, t.startBounds);
        updateMapUserShape(t.startShape.id, { kind: next.kind, geom: next.geom });
      }
    },
    [mapPointer, updateMapUserShape],
  );

  const endTransform = useCallback((e) => {
    const t = transformRef.current;
    if (!t || t.pointerId !== e.pointerId) return;
    transformRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const drawCaptureTools = ['rect', 'ellipse', 'triangle', 'polygon', 'polyline', 'pen'];
  const needsCapture = drawCaptureTools.includes(mapBuilderTool);

  function onCapturePointerDown(e) {
    if (e.button !== 0) return;
    const st = stageRef.current;
    if (!st) return;
    const raw = mapPointer(e);
    const { x, y } = clampToBase(raw.x, raw.y);
    const tool = mapBuilderTool;

    if (tool === 'rect' || tool === 'ellipse') {
      dragRef.current = { kind: tool, pointerId: e.pointerId };
      e.currentTarget.setPointerCapture(e.pointerId);
      setDraft({ kind: tool, x0: x, y0: y, x1: x, y1: y });
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (tool === 'pen') {
      dragRef.current = { kind: 'pen', pointerId: e.pointerId };
      e.currentTarget.setPointerCapture(e.pointerId);
      setDraft({ kind: 'pen', points: [[x, y]] });
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (tool === 'triangle') {
      const next = [...triAccumRef.current, [x, y]];
      triAccumRef.current = next;
      if (next.length >= 3) {
        addMapUserShape({
          id: newUserShapeId(),
          kind: 'triangle',
          geom: { points: next.slice(0, 3).map((p) => [...p]) },
        });
        triAccumRef.current = [];
        setDraft(null);
      } else {
        setDraft({ kind: 'triangle', points: next.map((p) => [...p]) });
      }
      e.stopPropagation();
      return;
    }

    if (tool === 'polygon') {
      polyAccumRef.current = [...polyAccumRef.current, [x, y]];
      setDraft({
        kind: 'polygon',
        points: polyAccumRef.current.map((p) => [...p]),
      });
      e.stopPropagation();
      return;
    }

    if (tool === 'polyline') {
      lineAccumRef.current = [...lineAccumRef.current, [x, y]];
      setDraft({
        kind: 'polyline',
        points: lineAccumRef.current.map((p) => [...p]),
      });
      e.stopPropagation();
    }
  }

  function onCapturePointerMove(e) {
    const d = dragRef.current;
    if (!d) return;
    const st = stageRef.current;
    if (!st) return;
    const raw = mapPointer(e);
    const { x, y } = clampToBase(raw.x, raw.y);

    if (d.kind === 'rect' || d.kind === 'ellipse') {
      setDraft((prev) =>
        prev && (prev.kind === 'rect' || prev.kind === 'ellipse') ? { ...prev, x1: x, y1: y } : prev,
      );
      return;
    }

    if (d.kind === 'pen') {
      setDraft((prev) => {
        if (!prev || prev.kind !== 'pen' || !prev.points.length) return prev;
        const last = prev.points[prev.points.length - 1];
        if (distanceSq(last[0], last[1], x, y) < 16) return prev;
        return { ...prev, points: [...prev.points, [x, y]] };
      });
    }
  }

  function onCapturePointerUp(e) {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;

    if (d.kind === 'rect' || d.kind === 'ellipse') {
      setDraft((prev) => {
        if (!prev || (prev.kind !== 'rect' && prev.kind !== 'ellipse')) return null;
        const r = normalizeRect(prev.x0, prev.y0, prev.x1, prev.y1);
        if (rectMinSize(r, 4)) {
          const id = newUserShapeId();
          if (prev.kind === 'rect') {
            addMapUserShape({ id, kind: 'rect', geom: r });
          } else {
            addMapUserShape({
              id,
              kind: 'ellipse',
              geom: {
                cx: r.x + r.w / 2,
                cy: r.y + r.h / 2,
                rx: r.w / 2,
                ry: r.h / 2,
              },
            });
          }
        }
        return null;
      });
    } else if (d.kind === 'pen') {
      setDraft((prev) => {
        if (prev?.kind === 'pen' && prev.points.length >= 2) {
          addMapUserShape({
            id: newUserShapeId(),
            kind: 'freepath',
            geom: { points: prev.points.map((p) => [...p]) },
          });
        }
        return null;
      });
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function renderDraft() {
    if (!draft) return null;
    const dash = { strokeDasharray: '6 4', opacity: 0.9 };

    if (draft.kind === 'rect') {
      const r = normalizeRect(draft.x0, draft.y0, draft.x1, draft.y1);
      return (
        <rect
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          fill="rgba(108,77,178,0.12)"
          stroke={STROKE}
          strokeWidth={2}
          pointerEvents="none"
          {...dash}
        />
      );
    }

    if (draft.kind === 'ellipse') {
      const r = normalizeRect(draft.x0, draft.y0, draft.x1, draft.y1);
      if (!rectMinSize(r, 1)) return null;
      return (
        <ellipse
          cx={r.x + r.w / 2}
          cy={r.y + r.h / 2}
          rx={r.w / 2}
          ry={r.h / 2}
          fill="rgba(108,77,178,0.12)"
          stroke={STROKE}
          strokeWidth={2}
          pointerEvents="none"
          {...dash}
        />
      );
    }

    if (draft.kind === 'triangle') {
      if (!draft.points?.length) return null;
      if (draft.points.length < 3) {
        return (
          <polyline
            points={pointsToSvg(draft.points)}
            fill="none"
            stroke={STROKE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
            {...dash}
          />
        );
      }
      return (
        <polygon
          points={pointsToSvg(draft.points)}
          fill="rgba(108,77,178,0.15)"
          stroke={STROKE}
          strokeWidth={2}
          pointerEvents="none"
          {...dash}
        />
      );
    }

    if (draft.kind === 'polygon') {
      if (!draft.points?.length) return null;
      if (draft.points.length < 3) {
        return (
          <polyline
            points={pointsToSvg(draft.points)}
            fill="none"
            stroke={STROKE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
            {...dash}
          />
        );
      }
      return (
        <polygon
          points={pointsToSvg(draft.points)}
          fill="rgba(108,77,178,0.12)"
          stroke={STROKE}
          strokeWidth={2}
          pointerEvents="none"
          {...dash}
        />
      );
    }

    if (draft.kind === 'polyline' || draft.kind === 'pen') {
      if (!draft.points?.length) return null;
      return (
        <polyline
          points={pointsToSvg(draft.points)}
          fill="none"
          stroke={STROKE}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          pointerEvents="none"
          {...dash}
        />
      );
    }

    return null;
  }

  return (
    <svg
      className="map-builder-canvas__draw-svg"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      {needsCapture ? (
        <rect
          className="map-builder-canvas__draw-capture"
          width="100%"
          height="100%"
          fill="transparent"
          style={{ cursor: cursorForTool(mapBuilderTool), touchAction: 'none' }}
          onPointerDown={onCapturePointerDown}
          onPointerMove={onCapturePointerMove}
          onPointerUp={onCapturePointerUp}
          onPointerCancel={onCapturePointerUp}
        />
      ) : null}

      {mapUserShapes.map((s) => renderCommittedShape(s, selectedMapLayerId, selectShape))}

      {selectedShape && selectedBounds ? (
        <g>
          <rect
            x={selectedBounds.minX}
            y={selectedBounds.minY}
            width={Math.max(0, selectedBounds.maxX - selectedBounds.minX)}
            height={Math.max(0, selectedBounds.maxY - selectedBounds.minY)}
            fill="transparent"
            stroke="#2f6a2a"
            strokeWidth={2}
            strokeDasharray="6 4"
            style={{ cursor: selectedLocked ? 'not-allowed' : 'move', pointerEvents: 'auto' }}
            onPointerDown={(e) => beginTransform('move', e)}
            onPointerMove={updateTransform}
            onPointerUp={endTransform}
            onPointerCancel={endTransform}
          />
          {!selectedLocked ? (
            <>
              {[
                ['nw', selectedBounds.minX, selectedBounds.minY, 'nwse-resize'],
                ['ne', selectedBounds.maxX, selectedBounds.minY, 'nesw-resize'],
                ['sw', selectedBounds.minX, selectedBounds.maxY, 'nesw-resize'],
                ['se', selectedBounds.maxX, selectedBounds.maxY, 'nwse-resize'],
              ].map(([handle, hx, hy, cursor]) => (
                <circle
                  key={handle}
                  cx={hx}
                  cy={hy}
                  r={HANDLE_R}
                  fill="#fff"
                  stroke="#2f6a2a"
                  strokeWidth={2}
                  style={{ cursor, pointerEvents: 'auto' }}
                  onPointerDown={(e) => beginTransform('resize', e, { handle })}
                  onPointerMove={updateTransform}
                  onPointerUp={endTransform}
                  onPointerCancel={endTransform}
                />
              ))}
              <line
                x1={(selectedBounds.minX + selectedBounds.maxX) / 2}
                y1={selectedBounds.minY}
                x2={(selectedBounds.minX + selectedBounds.maxX) / 2}
                y2={selectedBounds.minY - ROTATE_HANDLE_OFFSET}
                stroke="#2f6a2a"
                strokeWidth={1.5}
              />
              <circle
                cx={(selectedBounds.minX + selectedBounds.maxX) / 2}
                cy={selectedBounds.minY - ROTATE_HANDLE_OFFSET}
                r={HANDLE_R}
                fill="#dbe9d8"
                stroke="#2f6a2a"
                strokeWidth={2}
                style={{
                  cursor: selectedShape.kind === 'ellipse' ? 'not-allowed' : 'crosshair',
                  pointerEvents: selectedShape.kind === 'ellipse' ? 'none' : 'auto',
                }}
                onPointerDown={(e) => beginTransform('rotate', e)}
                onPointerMove={updateTransform}
                onPointerUp={endTransform}
                onPointerCancel={endTransform}
              />
            </>
          ) : null}
        </g>
      ) : null}

      {renderDraft()}
    </svg>
  );
}
