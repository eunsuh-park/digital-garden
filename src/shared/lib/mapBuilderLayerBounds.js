/**
 * 스테이지 로컬(px) 기준 레이어 히트 영역 — CSS(MapBuilderCanvas)와 동일 비율 유지
 * @param {number} sw
 * @param {number} sh
 * @param {string} layerId
 * @returns {{ x: number, y: number, w: number, h: number } | null}
 */
export function getLayerHitBoundsPx(sw, sh, layerId) {
  if (!layerId || !Number.isFinite(sw) || !Number.isFinite(sh) || sw <= 0 || sh <= 0) return null;

  switch (layerId) {
    case 'base':
      return { x: 80, y: 52, w: sw - 160, h: sh - 108 };
    case 'house': {
      const w = 296;
      const h = 266;
      const tyOff = h * 0.42;
      return { x: sw / 2 - w / 2, y: sh / 2 - tyOff, w, h };
    }
    case 'terrace':
      return { x: sw * 0.14, y: sh * 0.16, w: sw * 0.26, h: sh * 0.18 };
    case 'shed':
      return {
        x: sw * (1 - 0.12 - 0.22),
        y: sh * (1 - 0.18 - 0.16),
        w: sw * 0.22,
        h: sh * 0.16,
      };
    case 'lawn':
      return {
        x: sw * 0.22,
        y: sh * (1 - 0.12 - 0.14),
        w: sw * 0.48,
        h: sh * 0.14,
      };
    default:
      return null;
  }
}

export const MAP_BUILDER_ZOOM_MIN = 0.22;
export const MAP_BUILDER_ZOOM_MAX = 4;

export function clampZoom(s) {
  return Math.min(MAP_BUILDER_ZOOM_MAX, Math.max(MAP_BUILDER_ZOOM_MIN, s));
}

/** 스테이지를 뷰에 맞춤: world 원점 = 스테이지 좌상단, transform translate(tx,ty) scale(s), origin 0 0 */
export function fitBoundsInView(viewW, viewH, bx, by, bw, bh, margin = 0.07) {
  const m = margin;
  const sx = (viewW * (1 - 2 * m)) / bw;
  const sy = (viewH * (1 - 2 * m)) / bh;
  const scale = clampZoom(Math.min(sx, sy));
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const tx = viewW / 2 - cx * scale;
  const ty = viewH / 2 - cy * scale;
  return { scale, tx, ty };
}

/** 뷰 좌표 기준 휠 줌 (원점 스테이지 좌상단) */
export function zoomWithWheel(viewW, viewH, tx, ty, scale, focalX, focalY, deltaY) {
  const factor = Math.exp(-deltaY * 0.0012);
  const newScale = clampZoom(scale * factor);
  const wx = (focalX - tx) / scale;
  const wy = (focalY - ty) / scale;
  const nTx = focalX - wx * newScale;
  const nTy = focalY - wy * newScale;
  return { scale: newScale, tx: nTx, ty: nTy };
}
