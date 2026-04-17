/**
 * Shared project space labels and option helpers.
 * Used by project setup flows and project list UIs.
 */

/** DB·API에 저장되는 공간 넓이 값 (영문) */
export const PROJECT_SPACE_SIZE_VALUES = ['narrow', 'medium', 'wide', 'very_wide'];

const LEGACY_SPACE_MAP = { s: 'narrow', m: 'medium', l: 'wide' };

/** 화면 표시용 한글 설명 */
export const PROJECT_SPACE_SIZE_LABEL_KO = {
  narrow: '좁음 (실내, 방 등)',
  medium: '중간 (온실 등)',
  wide: '넓음 (실외 정원)',
  very_wide: '매우 넓음 (텃밭 등)',
};

/** ButtonTabGroup 등에 넘길 항목 */
export const PROJECT_SPACE_SIZE_TAB_ITEMS = PROJECT_SPACE_SIZE_VALUES.map((value) => ({
  value,
  label: PROJECT_SPACE_SIZE_LABEL_KO[value],
}));

/** 맵 빌더에서 허용할 공간 옵션 (실내 정원 제외) */
export const PROJECT_SPACE_SIZE_MAP_BUILDER_VALUES = ['medium', 'wide', 'very_wide'];

export const PROJECT_SPACE_SIZE_MAP_BUILDER_TAB_ITEMS = PROJECT_SPACE_SIZE_MAP_BUILDER_VALUES.map(
  (value) => ({
    value,
    label: PROJECT_SPACE_SIZE_LABEL_KO[value],
  }),
);

/** 마이그레이션 전 s/m/l 값도 표시 가능 */
export function formatProjectSpaceSizeLabel(spaceSize) {
  if (spaceSize == null || spaceSize === '') return '—';
  const key = LEGACY_SPACE_MAP[spaceSize] || spaceSize;
  return PROJECT_SPACE_SIZE_LABEL_KO[key] ?? String(spaceSize);
}
