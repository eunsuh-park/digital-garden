/**
 * 식물 UI 그룹(나무 / 꽃 / 풀) — category·species 문자열 휴리스틱
 */

export const PLANT_SPECIES_GROUP_ORDER = ['나무', '꽃', '풀'];

export const PLANT_SPECIES_GROUP_LABEL = {
  나무: '나무',
  꽃: '꽃',
  풀: '풀',
};

export function getPlantSpeciesKind(plant) {
  const raw = plant?.category || plant?.species || '';
  if (/(나무|목|교목|관목)/.test(raw)) return '나무';
  if (/(꽃|화|개화)/.test(raw)) return '꽃';
  return '풀';
}
