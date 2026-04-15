/** 맵 빌더 레이어 메타 — 패널·캔버스 동기화용. 정렬: 기본 구역 → 집 → 창고 → (추가) */
export const MAP_BUILDER_LAYER_ORDER = ['base', 'house', 'shed', 'terrace', 'lawn'];

/** 도형 유형 목록 */
export const SHAPE_TYPES = ['zone', 'path', 'building'];

/** 도형 유형 한국어 레이블 */
export const SHAPE_TYPE_LABELS = {
  zone: '구역',
  path: '길',
  building: '건축물',
};

export const MAP_BUILDER_LAYERS = [
  {
    id: 'base',
    name: '기본 구역',
    meta: '텃밭, 뜰 등',
    hidden: false,
    locked: true,
    deletable: false,
    desc: '삭제할 수 없는 기본 토지 구역입니다.',
    size: '100%',
    rotation: '0°',
    type: null,
  },
  {
    id: 'house',
    name: '집',
    meta: '건물 & 부속물',
    hidden: false,
    locked: true,
    deletable: true,
    desc: '집입니다.',
    size: '100%',
    rotation: '0°',
    type: null,
  },
  {
    id: 'shed',
    name: '창고',
    meta: '기타 자투리 공간',
    hidden: false,
    locked: true,
    deletable: true,
    desc: '창고·창고형 공간입니다.',
    size: '100%',
    rotation: '0°',
    type: null,
  },
  {
    id: 'terrace',
    name: '테라스',
    meta: '데크·휴식',
    hidden: false,
    locked: true,
    deletable: true,
    desc: '남향 데크(샘플)',
    size: '100%',
    rotation: '0°',
    type: null,
  },
  {
    id: 'lawn',
    name: '잔디밭',
    meta: '오픈 잔디',
    hidden: false,
    locked: true,
    deletable: true,
    desc: '스크롤 테스트용 잔디 구역',
    size: '100%',
    rotation: '0°',
    type: null,
  },
];

/** 맵에 올라간 초기 요소 id (기본 구역, 집, 창고) */
export const MAP_BUILDER_INITIAL_PRESENT_IDS = ['base', 'house', 'shed'];

/** 초기 3요소 기본 도형 유형 (맵 빌더 오픈 시 적용) */
export const MAP_BUILDER_DEFAULT_LAYER_TYPES = {
  base: 'zone',
  house: 'zone',
  shed: 'zone',
};

export function initialMapLayerTypes() {
  return { ...MAP_BUILDER_DEFAULT_LAYER_TYPES };
}

export function getMapBuilderLayer(id) {
  return MAP_BUILDER_LAYERS.find((l) => l.id === id) ?? null;
}

export function sortLayersByMapOrder(layers) {
  const order = MAP_BUILDER_LAYER_ORDER;
  return [...layers].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

/** 삭제 가능할 때만 문구 반환 */
export function mapBuilderRemoveConfirmMessage(layer, lockedMap) {
  if (!layer?.deletable) return null;
  const locked = lockedMap[layer.id] !== undefined ? lockedMap[layer.id] : !!layer.locked;
  return locked
    ? `"${layer.name}"은(는) 잠금 상태입니다. 맵에서 제거하시겠습니까?`
    : `"${layer.name}"을(를) 맵에서 제거하시겠습니까?`;
}
