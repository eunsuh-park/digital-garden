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
