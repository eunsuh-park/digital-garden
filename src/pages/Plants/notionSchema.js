/**
 * Plants DB 스키마 매핑
 * - Location → Locations (1:1, Locations.Name과 연결)
 */
import { getTitle, getRichText, getSelect, getRelation, getNumber } from '../../lib/parseNotionProps';

export const PROP_MAP = {
  name: '이름',             // title
  species: '종',
  category: '카테고리',
  status: '상태',
  bloom_season: '개화시기',
  section: 'Location',      // relation → Locations (1:1, Locations.Name과 연결)
  notes: 'Notes',           // rich_text (설명/메모)
  quantity: '개체 수',           // number or rich_text (Notion property: 개체 수)
};

export function parsePlantPage(page) {
  const props = page.properties || {};
  const name = getTitle(props[PROP_MAP.name]) || getTitle(props['Name']);
  const species = getRichText(props[PROP_MAP.species]) || getSelect(props[PROP_MAP.species]);
  const category = getSelect(props[PROP_MAP.category]) || getRichText(props[PROP_MAP.category]);
  const statusRaw = getSelect(props[PROP_MAP.status]);
  const bloomSeason = getRichText(props[PROP_MAP.bloom_season]) || getSelect(props[PROP_MAP.bloom_season]);
  const sectionIds = getRelation(props[PROP_MAP.section]);
  const notes = getRichText(props[PROP_MAP.notes]) || getRichText(props['Notes']) || '';
  const quantityNumber = getNumber(props[PROP_MAP.quantity]);
  const quantityText = getRichText(props[PROP_MAP.quantity]) || '';

  return {
    id: page.id,
    name: name || '(이름 없음)',
    species: species || '-',
    category: category || '-',
    status: statusRaw || 'planted',
    bloom_season: bloomSeason || '-',
    section_id: sectionIds[0] || null,
    notes: notes.trim() || '',
    quantity: quantityNumber != null ? quantityNumber : (quantityText || '').trim() || null,
  };
}

export function parsePlantsResponse(data) {
  return (data.results || []).map(parsePlantPage);
}
