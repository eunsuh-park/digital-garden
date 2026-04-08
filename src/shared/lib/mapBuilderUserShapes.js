/**
 * @typedef {'rect'|'ellipse'|'triangle'|'polygon'|'polyline'|'freepath'} MapUserShapeKind
 */

/**
 * @typedef {Object} MapUserShape
 * @property {string} id
 * @property {MapUserShapeKind} kind
 * @property {Object} geom
 * @property {string} [label] 사용자 지정 이름(비우면 자동 이름)
 * @property {string} [description] 설명
 */

export const USER_SHAPE_KIND_LABELS = {
  rect: '사각형',
  ellipse: '원',
  triangle: '삼각형',
  polygon: '다각형',
  polyline: '선',
  freepath: '자유 그리기',
};

export function newUserShapeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `draw-${crypto.randomUUID()}`;
  }
  return `draw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function userShapeDisplayName(shape) {
  const kindLabel = USER_SHAPE_KIND_LABELS[shape.kind] ?? '도형';
  const tail = shape.id.replace(/^draw-/, '').slice(-4);
  return `${kindLabel} · ${tail}`;
}

/** 패널·목록 표시용 이름(사용자 label 우선) */
export function getShapeInspectorName(shape) {
  const t = shape.label != null ? String(shape.label).trim() : '';
  return t || userShapeDisplayName(shape);
}

/** 인스펙터 리스트용 가상 레이어 객체 */
export function inspectorLayerFromUserShape(shape) {
  return {
    id: shape.id,
    name: getShapeInspectorName(shape),
    meta: USER_SHAPE_KIND_LABELS[shape.kind] ?? '그린 도형',
    hidden: false,
    locked: false,
    deletable: true,
    desc: shape.description != null ? shape.description : '',
    size: '—',
    rotation: '—',
    isUserShape: true,
  };
}
