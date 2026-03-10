/**
 * Plants DB 스키마 매핑
 * Notion DB의 실제 property 이름에 맞게 수정하세요
 */
import { getTitle, getRichText, getSelect, getRelation } from '../../lib/parseNotionProps';

export const PROP_MAP = {
  name: '이름',       // title
  species: '종',
  category: '카테고리',
  status: '상태',
  bloom_season: '개화시기',
  section: '위치',    // relation → Section DB
};

export function parsePlantPage(page) {
  const props = page.properties || {};
  const name = getTitle(props[PROP_MAP.name]) || getTitle(props['Name']);
  const species = getRichText(props[PROP_MAP.species]) || getSelect(props[PROP_MAP.species]);
  const category = getSelect(props[PROP_MAP.category]) || getRichText(props[PROP_MAP.category]);
  const statusRaw = getSelect(props[PROP_MAP.status]);
  const bloomSeason = getRichText(props[PROP_MAP.bloom_season]) || getSelect(props[PROP_MAP.bloom_season]);
  const sectionIds = getRelation(props[PROP_MAP.section]);

  return {
    id: page.id,
    name: name || '(이름 없음)',
    species: species || '-',
    category: category || '-',
    status: statusRaw || 'planted',
    bloom_season: bloomSeason || '-',
    section_id: sectionIds[0] || null,
  };
}

export function parsePlantsResponse(data) {
  return (data.results || []).map(parsePlantPage);
}
