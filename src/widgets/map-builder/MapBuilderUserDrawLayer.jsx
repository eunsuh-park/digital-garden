import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import {
  distanceSq,
  normalizeRect,
  pointsToSvg,
  rectMinSize,
  viewBoxClientToMapSpace,
} from '@/shared/lib/mapBuilderDrawMath';
import { newUserShapeId } from '@/shared/lib/mapBuilderUserShapes';

const STROKE = '#6c4db2';
const STROKE_SEL = '#4e7424';
const FILL = 'rgba(108, 77, 178, 0.22)';

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

/**
 * 사용자 도형 SVG + 그리기 상호작용(도구별).
 * @param {{ stageRef: React.RefObject<HTMLElement|null>, view: { tx: number, ty: number, scale: number } }} props
 */
export default function MapBuilderUserDrawLayer({ stageRef, view }) {
  const {
    mapBuilderTool,
    mapUserShapes,
    addMapUserShape,
    selectedMapLayerId,
    setSelectedMapLayerId,
    setMapLayerDetailOpenId,
    expandMapSidePanel,
  } = useProjectNewMapBuilderUi();

  const [draft, setDraft] = useState(null);
  const dragRef = useRef(null);
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

  const drawCaptureTools = ['rect', 'ellipse', 'triangle', 'polygon', 'polyline', 'pen'];
  const needsCapture = drawCaptureTools.includes(mapBuilderTool);

  function mapPointer(e) {
    const st = stageRef.current;
    if (!st) return { x: 0, y: 0 };
    return viewBoxClientToMapSpace(st, e.clientX, e.clientY, view.tx, view.ty, view.scale);
  }

  function onCapturePointerDown(e) {
    if (e.button !== 0) return;
    const st = stageRef.current;
    if (!st) return;
    const { x, y } = mapPointer(e);
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
    const { x, y } = mapPointer(e);

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

      {renderDraft()}
    </svg>
  );
}
