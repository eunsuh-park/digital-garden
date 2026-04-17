/**
 * Map builder layer bounds and zoom helpers.
 * Used by the canvas, draw layer, and draft apply logic.
 */

function normalizeSpaceSize(spaceSize) {
  if (spaceSize === 'very_wide') return 'very_wide';
  if (spaceSize === 'wide') return 'wide';
  if (spaceSize === 'medium') return 'medium';
  if (spaceSize === 'narrow') return 'narrow';
  return 'medium';
}

function baseScaleBySpaceSize(spaceSize) {
  const key = normalizeSpaceSize(spaceSize);
  if (key === 'narrow') return 1;
  if (key === 'wide') return 1.5;
  if (key === 'very_wide') return 2.25;
  return 1;
}

/**
 * 스테이지 로컬(px) 기준 레이어 히트 영역 — CSS(MapBuilderCanvas)와 동일 비율 유지
 * @param {number} sw
 * @param {number} sh
 * @param {string} layerId
 * @param {{ spaceSize?: string }=} options
 * @returns {{ x: number, y: number, w: number, h: number } | null}
 */
export function getLayerHitBoundsPx(sw, sh, layerId, options = {}) {
  if (!layerId || !Number.isFinite(sw) || !Number.isFinite(sh) || sw <= 0 || sh <= 0) return null;

  switch (layerId) {
    case 'base': {
      const marginX = 80;
      const marginTop = 52;
      const marginBottom = 56;
      const baseW = sw - marginX * 2;
      const baseH = sh - (marginTop + marginBottom);
      const scale = baseScaleBySpaceSize(options.spaceSize);
      const w = Math.max(1, Math.min(sw - 24, baseW * scale));
      const h = Math.max(1, Math.min(sh - 24, baseH * scale));
      return { x: (sw - w) / 2, y: (sh - h) / 2, w, h };
    }
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

/** 선택 영역 전체가 뷰에 들어가는 최대 scale(여백 margin). 더 확대하면 잘림. */
export function rawFitScaleForBounds(viewW, viewH, bw, bh, margin = 0.07) {
  if (!Number.isFinite(viewW) || !Number.isFinite(viewH) || bw <= 0 || bh <= 0) return MAP_BUILDER_ZOOM_MAX;
  const m = margin;
  return Math.min((viewW * (1 - 2 * m)) / bw, (viewH * (1 - 2 * m)) / bh);
}

export function maxScaleToFitLayerInView(viewW, viewH, sw, sh, layerId, margin = 0.07) {
  const b = getLayerHitBoundsPx(sw, sh, layerId);
  if (!b || b.w <= 0 || b.h <= 0) return MAP_BUILDER_ZOOM_MAX;
  const raw = rawFitScaleForBounds(viewW, viewH, b.w, b.h, margin);
  return Math.max(MAP_BUILDER_ZOOM_MIN, raw);
}

/** 스테이지를 뷰에 맞춤: world 원점 = 스테이지 좌상단, transform translate(tx,ty) scale(s), origin 0 0 */
export function fitBoundsInView(viewW, viewH, bx, by, bw, bh, margin = 0.07) {
  const raw = rawFitScaleForBounds(viewW, viewH, bw, bh, margin);
  const scale = Math.max(MAP_BUILDER_ZOOM_MIN, raw);
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const tx = viewW / 2 - cx * scale;
  const ty = viewH / 2 - cy * scale;
  return { scale, tx, ty };
}

/** 뷰 좌표 기준 휠 줌 (원점 스테이지 좌상단). maxScale 주면 그 이상 확대하지 않음. */
export function zoomWithWheel(viewW, viewH, tx, ty, scale, focalX, focalY, deltaY, maxScale = MAP_BUILDER_ZOOM_MAX) {
  const factor = Math.exp(-deltaY * 0.0012);
  const cap = Math.max(MAP_BUILDER_ZOOM_MIN, maxScale);
  const newScale = Math.max(MAP_BUILDER_ZOOM_MIN, Math.min(cap, scale * factor));
  const wx = (focalX - tx) / scale;
  const wy = (focalY - ty) / scale;
  const nTx = focalX - wx * newScale;
  const nTy = focalY - wy * newScale;
  return { scale: newScale, tx: nTx, ty: nTy };
}
