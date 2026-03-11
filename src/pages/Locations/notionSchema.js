/**
 * Locations DB 스키마 매핑
 * Notion DB의 실제 property 이름에 맞게 수정하세요
 */
import { getTitle, getRichText, getSelect } from '../../lib/parseNotionProps';

export const PROP_MAP = {
  name: '이름',       // title
  color: '색상',      // rich_text or select
  zone_type: '구역타입',
  svg_id: 'svg_id',
};

export function parseLocationPage(page) {
  const props = page.properties || {};
  const name = getTitle(props[PROP_MAP.name]) || getTitle(props['Name']);
  const colorRaw = getRichText(props[PROP_MAP.color]) || getSelect(props[PROP_MAP.color]);
  const zoneType = getSelect(props[PROP_MAP.zone_type]) || getRichText(props[PROP_MAP.zone_type]);
  const svgId = getRichText(props[PROP_MAP.svg_id]) || '';

  // gardenMap.svg 도형 id와의 간단한 이름 기반 fallback (Notion에 svg_id가 비어있을 때만 사용)
  const nameBasedSvgId = (() => {
    const n = (name || '').toLowerCase();
    if (!n) return '';
    if (/(텃밭|채소|vegetable)/.test(n)) return 'vegetable_patch';
    if (/(앞뜰|front)/.test(n)) return 'front_yard';
    if (/(뒷뜰|뒷마당|back)/.test(n)) return 'back_yard';
    if (/(온실|greenhouse)/.test(n)) return 'greenhouse';
    if (/(비닐|vinyl)/.test(n)) return 'vinylhouse';
    if (/(우체통|mailbox)/.test(n)) return 'mailbox_area';
    if (/(차고|garage)/.test(n)) return 'garage';
    return '';
  })();

  return {
    id: page.id,
    name: name || '(이름 없음)',
    zone_type: zoneType || 'yard',
    color_token: colorTokenFromRaw(colorRaw),
    svg_id: svgId || nameBasedSvgId || '',
    taskCount: 0,
    plantCount: 0,
  };
}

function colorTokenFromRaw(raw) {
  const v = (raw || '').trim();
  if (!v) return '#a8d5a2';
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return v;
  if (/^rgb\(/i.test(v) || /^hsl\(/i.test(v)) return v;

  const map = {
    초록: '#2ecc71',
    녹색: '#2ecc71',
    '짙은 녹색': '#2d5a27',
    연두: '#8bc34a',
    노랑: '#f1c40f',
    노란: '#f1c40f',
    주황: '#e67e22',
    빨강: '#e74c3c',
    붉은: '#e74c3c',
    파랑: '#3498db',
    하늘: '#5dade2',
    보라: '#9b59b6',
    분홍: '#e67ea1',
    흰색: '#ecf0f1',
    하양: '#ecf0f1',
    회색: '#95a5a6',
    검정: '#2c3e50',
    green: '#2ecc71',
    yellow: '#f1c40f',
    orange: '#e67e22',
    red: '#e74c3c',
    blue: '#3498db',
    purple: '#9b59b6',
    pink: '#e67ea1',
    white: '#ecf0f1',
    gray: '#95a5a6',
    black: '#2c3e50',
  };

  return map[v] || map[v.toLowerCase()] || '#a8d5a2';
}

export function parseLocationsResponse(data, taskCountMap = {}, plantCountMap = {}) {
  return (data.results || []).map((p) => {
    const location = parseLocationPage(p);
    location.taskCount = taskCountMap[location.id] ?? 0;
    location.plantCount = plantCountMap[location.id] ?? 0;
    return location;
  });
}

// Backward-compatible aliases (기존 sections 명칭 호환)
export const parseSectionPage = parseLocationPage;
export const parseSectionsResponse = parseLocationsResponse;
