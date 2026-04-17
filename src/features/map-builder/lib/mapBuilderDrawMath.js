/**
 * Map builder geometry helpers.
 * Used by the canvas and draw layer for coordinate and shape math.
 */

/** 뷰(클라이언트) 좌표 → 스테이지 뷰포트 로컬 좌표(px, 변환 전) */
export function clientPointToStage(stageEl, clientX, clientY) {
  if (!stageEl) return { x: 0, y: 0 };
  const r = stageEl.getBoundingClientRect();
  const sw = stageEl.offsetWidth;
  const sh = stageEl.offsetHeight;
  if (!Number.isFinite(r.width) || !Number.isFinite(r.height) || r.width <= 0 || r.height <= 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: ((clientX - r.left) / r.width) * sw,
    y: ((clientY - r.top) / r.height) * sh,
  };
}

/**
 * 뷰포트(바깥 스테이지, 변환 없음) 기준 클릭 → 맵 씬 로컬 좌표.
 * 씬 스타일: transform: translate3d(tx,ty,0) scale(scale); transform-origin: 0 0;
 */
export function viewBoxClientToMapSpace(stageViewportEl, clientX, clientY, tx, ty, scale) {
  const { x: vx, y: vy } = clientPointToStage(stageViewportEl, clientX, clientY);
  const s = Math.max(scale, 1e-6);
  return {
    x: (vx - tx) / s,
    y: (vy - ty) / s,
  };
}

/** 드래그 사각형을 양의 w/h 로 정규화 */
export function normalizeRect(x0, y0, x1, y1) {
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const w = Math.abs(x1 - x0);
  const h = Math.abs(y1 - y0);
  return { x, y, w, h };
}

export function rectMinSize(rect, min = 4) {
  return rect.w >= min && rect.h >= min;
}

/** points: [[x,y],...] → SVG points 문자열 */
export function pointsToSvg(points) {
  if (!points?.length) return '';
  return points.map((p) => `${p[0]},${p[1]}`).join(' ');
}

export function distanceSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function getShapeBounds(kind, geom) {
  if (!geom) return null;
  if (kind === 'rect') {
    const x = Number(geom.x);
    const y = Number(geom.y);
    const w = Number(geom.w);
    const h = Number(geom.h);
    if (![x, y, w, h].every(Number.isFinite)) return null;
    return { minX: x, minY: y, maxX: x + w, maxY: y + h };
  }
  if (kind === 'ellipse') {
    const cx = Number(geom.cx);
    const cy = Number(geom.cy);
    const rx = Number(geom.rx);
    const ry = Number(geom.ry);
    if (![cx, cy, rx, ry].every(Number.isFinite)) return null;
    return { minX: cx - rx, minY: cy - ry, maxX: cx + rx, maxY: cy + ry };
  }
  const pts = Array.isArray(geom.points) ? geom.points : [];
  if (!pts.length) return null;
  const xs = pts.map((p) => Number(p?.[0])).filter(Number.isFinite);
  const ys = pts.map((p) => Number(p?.[1])).filter(Number.isFinite);
  if (!xs.length || !ys.length) return null;
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

export function rotatePoint(x, y, cx, cy, rad) {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}
