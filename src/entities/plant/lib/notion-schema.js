/**
 * Plants DB 스키마 매핑
 * - Location → Locations (1:1, Locations.Name과 연결)
 */
import {
  getTitle,
  getRichText,
  getSelect,
  getRelation,
  getNumber,
  getMultiSelect,
  getFormulaDisplay,
  getNotionStatus,
} from '@/shared/lib/parseNotionProps';

export const PROP_MAP = {
  name: 'Name',
  species: 'Species',
  category: 'Category',
  status: 'Status',
  bloom_season: 'Bloom_Season',
  section: 'Location',
  notes: 'Notes',
  quantity: 'Quantity',
};

export function parsePlantPage(page) {
  const props = page.properties || {};
  const name = getTitle(props[PROP_MAP.name]) || getTitle(props['Name']);
  const speciesProp = props[PROP_MAP.species];
  const speciesMulti = getMultiSelect(speciesProp);
  const species =
    getRichText(speciesProp) ||
    getSelect(speciesProp) ||
    getNotionStatus(speciesProp) ||
    getFormulaDisplay(speciesProp) ||
    (speciesMulti.length ? speciesMulti.join(', ') : '') ||
    getTitle(speciesProp);
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
