/**
 * Sections(Locations) DB 스키마 매핑
 * Notion DB의 실제 property 이름에 맞게 수정하세요
 */
import { getTitle, getRichText, getSelect } from '../../lib/parseNotionProps';

export const PROP_MAP = {
  name: '이름',       // title
  color: '색상',      // rich_text or select
  zone_type: '구역타입',
  svg_id: 'svg_id',
};

export function parseSectionPage(page) {
  const props = page.properties || {};
  const name = getTitle(props[PROP_MAP.name]) || getTitle(props['Name']);
  const colorRaw = getRichText(props[PROP_MAP.color]) || getSelect(props[PROP_MAP.color]);
  const zoneType = getSelect(props[PROP_MAP.zone_type]) || getRichText(props[PROP_MAP.zone_type]);
  const svgId = getRichText(props[PROP_MAP.svg_id]) || '';

  return {
    id: page.id,
    name: name || '(이름 없음)',
    zone_type: zoneType || 'yard',
    color_token: colorRaw && /^#[0-9a-fA-F]{6}$/.test(colorRaw) ? colorRaw : '#a8d5a2',
    svg_id: svgId || `section-${page.id.replace(/-/g, '')}`,
    taskCount: 0,
    plantCount: 0,
  };
}

export function parseSectionsResponse(data, taskCountMap = {}, plantCountMap = {}) {
  return (data.results || []).map((p) => {
    const section = parseSectionPage(p);
    section.taskCount = taskCountMap[section.id] ?? 0;
    section.plantCount = plantCountMap[section.id] ?? 0;
    return section;
  });
}
