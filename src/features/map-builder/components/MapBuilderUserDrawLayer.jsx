/**
 * MapBuilderUserDrawLayer component file.
 * Handles rendering and editing interactions for user-drawn shapes in the canvas.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import { useToast } from '@/app/providers/ToastContext';
import {
  distanceSq,
  getShapeBounds,
  normalizeRect,
  pointsToSvg,
  rectMinSize,
  rotatePoint,
  viewBoxClientToMapSpace,
} from '@/features/map-builder/lib/mapBuilderDrawMath';
import { newUserShapeId } from '@/features/map-builder/lib/mapBuilderUserShapes';
import { getLayerHitBoundsPx } from '@/features/map-builder/lib/mapBuilderLayerBounds';

const TYPE_COLORS = {
  building: {
    fill: 'rgba(150, 150, 150, 0.3)',
    stroke: '#868686',
    selectedStroke: '#5f5f5f',
  },
  path: {
    fill: 'rgba(255, 255, 255, 0.65)',
    stroke: '#b2b2b2',
    selectedStroke: '#8d8d8d',
  },
  zone: {
    fill: 'rgba(110, 175, 90, 0.25)',
    stroke: '#4e7424',
    selectedStroke: '#2f5f20',
  },
};
const MIN_TRANSFORM_SIZE = 6;
const ROTATE_HANDLE_OFFSET = 28;
const HANDLE_R = 6;

function getTypeColors(type, selected = false) {
  const palette = TYPE_COLORS[type] ?? TYPE_COLORS.zone;
  return {
    fill: palette.fill,
    stroke: selected ? palette.selectedStroke : palette.stroke,
  };
}

function cursorForTool(tool) {
  switch (tool) {
    case 'pan':
      return 'grab';
    case 'rect':
    case 'ellipse':
    case 'pen':
      return 'crosshair';
    default:
      return 'default';
  }
}

function renderCommittedShape(shape, selected, onSelect, layerType) {
  const isSel = selected === shape.id;
  const sw = isSel ? 3 : 2;
  const colors = getTypeColors(layerType, isSel);

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
          rx={14}
          ry={14}
          fill={colors.fill}
          stroke={colors.stroke}
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
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={sw}
          {...common}
        />
      );
    }
    case 'freepath': {
      const pts = shape.geom.points;
      return (
        <polygon
          key={shape.id}
          points={pointsToSvg(pts)}
          fill={colors.fill}
          stroke={colors.stroke}
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

  if (shape.kind === 'freepath') {
    const points = (shape.geom.points || []).map(([x, y]) => {
      const nx = (x - startBounds.minX) / sw;
      const ny = (y - startBounds.minY) / sh;
      return [nextBounds.minX + nx * nw, nextBounds.minY + ny * nh];
    });
    return { ...shape, geom: { ...shape.geom, points } };
  }

  return shape;
}

function rotateShapeGeom(shape, rad, bounds) {
  if (!shape?.geom || !bounds || Math.abs(rad) < 1e-4) return shape;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  if (shape.kind !== 'freepath') {
    return shape;
  }

  const points = (shape.geom.points || []).map(([x, y]) => rotatePoint(x, y, cx, cy, rad));
  return { ...shape, geom: { ...shape.geom, points } };
}

function shapeToPolygon(shape) {
  if (!shape?.geom) return null;
  if (shape.kind === 'rect') {
    const { x, y, w, h } = shape.geom;
    return [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ];
  }
  if (shape.kind === 'ellipse') {
    const { cx, cy, rx, ry } = shape.geom;
    const pts = [];
    const steps = 24;
    for (let i = 0; i < steps; i += 1) {
      const t = (Math.PI * 2 * i) / steps;
      pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
    }
    return pts;
  }
  if (shape.kind === 'freepath') {
    const pts = (shape.geom.points || []).map(([x, y]) => [x, y]);
    if (pts.length < 3) return null;
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) pts.push([first[0], first[1]]);
    return pts;
  }
  return null;
}

function boundsOfPolygon(points) {
  if (!points?.length) return null;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

function ccw(a, b, c) {
  return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
}

function segmentsIntersect(a, b, c, d) {
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

function pointInPolygon(point, poly) {
  let inside = false;
  const x = point[0];
  const y = point[1];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonArea(poly) {
  let acc = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    acc += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  }
  return Math.abs(acc) / 2;
}

function polygonsOverlap(polyA, polyB) {
  if (!polyA || !polyB || polyA.length < 3 || polyB.length < 3) return false;
  if (polygonArea(polyA) < 1e-3 || polygonArea(polyB) < 1e-3) return false;
  const a = boundsOfPolygon(polyA);
  const b = boundsOfPolygon(polyB);
  if (!a || !b) return false;
  if (a.maxX <= b.minX || b.maxX <= a.minX || a.maxY <= b.minY || b.maxY <= a.minY) {
    return false;
  }
  for (let i = 0; i < polyA.length; i += 1) {
    const a1 = polyA[i];
    const a2 = polyA[(i + 1) % polyA.length];
    for (let j = 0; j < polyB.length; j += 1) {
      const b1 = polyB[j];
      const b2 = polyB[(j + 1) % polyB.length];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return pointInPolygon(polyA[0], polyB) || pointInPolygon(polyB[0], polyA);
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
    mapPresentLayerIds,
    mapLayerLocked,
    mapLayerTypes,
    mapSpaceSize,
    addMapUserShape,
    updateMapUserShape,
    removeMapUserShape,
    selectedMapLayerId,
    setSelectedMapLayerId,
    setMapLayerDetailOpenId,
    setMapBuilderTool,
    expandMapSidePanel,
  } = useProjectNewMapBuilderUi();
  const { showToast } = useToast();

  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);
  const dragRef = useRef(null);
  const transformRef = useRef(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const resetAccum = useCallback(() => {
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
      setMapBuilderTool('select');
      expandMapSidePanel();
    },
    [expandMapSidePanel, setMapBuilderTool, setMapLayerDetailOpenId, setSelectedMapLayerId],
  );

  useEffect(() => {
    function onKey(e) {
      const tag = String(e.target?.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isTyping) return;
      if (e.key === 'Escape') {
        resetAccum();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedMapLayerId) {
        const target = mapUserShapes.find((shape) => shape.id === selectedMapLayerId);
        if (!target) return;
        removeMapUserShape(target.id);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mapUserShapes, removeMapUserShape, resetAccum, selectedMapLayerId]);

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
      const bounds = getLayerHitBoundsPx(st.offsetWidth, st.offsetHeight, 'base', {
        spaceSize: mapSpaceSize,
      });
      if (!bounds) return { x, y };
      return {
        x: Math.min(bounds.x + bounds.w, Math.max(bounds.x, x)),
        y: Math.min(bounds.y + bounds.h, Math.max(bounds.y, y)),
      };
    },
    [mapSpaceSize, stageRef],
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

  const drawCaptureTools = ['rect', 'ellipse', 'pen'];
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
    const finalizedDraft = draftRef.current;
    setDraft(null);

    if (d.kind === 'rect' || d.kind === 'ellipse') {
      if (finalizedDraft && (finalizedDraft.kind === 'rect' || finalizedDraft.kind === 'ellipse')) {
        const r = normalizeRect(finalizedDraft.x0, finalizedDraft.y0, finalizedDraft.x1, finalizedDraft.y1);
        if (rectMinSize(r, 4)) {
          const id = newUserShapeId();
          if (finalizedDraft.kind === 'rect') {
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
      }
    } else if (d.kind === 'pen') {
      if (finalizedDraft?.kind === 'pen' && finalizedDraft.points.length >= 3) {
        const candidate = {
          id: newUserShapeId(),
          kind: 'freepath',
          geom: { points: finalizedDraft.points.map((p) => [...p]) },
        };
        const candidatePoly = shapeToPolygon(candidate);
        const stage = stageRef.current;
        const builtInShapes =
          stage && Number.isFinite(stage.offsetWidth) && Number.isFinite(stage.offsetHeight)
            ? mapPresentLayerIds
                .filter((id) => id !== 'base')
                .map((id) => {
                  const b = getLayerHitBoundsPx(stage.offsetWidth, stage.offsetHeight, id, {
                    spaceSize: mapSpaceSize,
                  });
                  if (!b) return null;
                  return { id, kind: 'rect', geom: { x: b.x, y: b.y, w: b.w, h: b.h } };
                })
                .filter(Boolean)
            : [];
        const hasOverlap = [...mapUserShapes, ...builtInShapes].some((shape) => {
          const poly = shapeToPolygon(shape);
          return polygonsOverlap(candidatePoly, poly);
        });
        if (hasOverlap) {
          showToast('자유 그리기 영역은 기존 영역과 겹칠 수 없어요.');
        } else {
          addMapUserShape(candidate);
        }
      }
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
    const draftColors = getTypeColors('zone');

    if (draft.kind === 'rect') {
      const r = normalizeRect(draft.x0, draft.y0, draft.x1, draft.y1);
      return (
        <rect
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          rx={14}
          ry={14}
          fill={draftColors.fill}
          stroke={draftColors.stroke}
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
          fill={draftColors.fill}
          stroke={draftColors.stroke}
          strokeWidth={2}
          pointerEvents="none"
          {...dash}
        />
      );
    }

    if (draft.kind === 'pen') {
      if (!draft.points?.length) return null;
      return (
        <polygon
          points={pointsToSvg(draft.points)}
          fill={draftColors.fill}
          stroke={draftColors.stroke}
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

      {mapUserShapes.map((s) =>
        renderCommittedShape(s, selectedMapLayerId, selectShape, mapLayerTypes[s.id]),
      )}

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
                  cursor: selectedShape.kind === 'freepath' ? 'crosshair' : 'not-allowed',
                  pointerEvents: selectedShape.kind === 'freepath' ? 'auto' : 'none',
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
