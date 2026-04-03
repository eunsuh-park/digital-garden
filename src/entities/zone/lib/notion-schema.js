/**
 * Notion Locations DB → 앱 도메인명 Zone(구역)
 * Color: Notion select — 지도·패널 color_token / color_label
 */
import { getTitle, getRichText, getSelect } from '@/shared/lib/parseNotionProps';

export const PROP_MAP = {
  name: 'Name',
  color: 'Color',
  description: 'Description',
  svg_id: 'Svg_Id',
};

export function parseZonePage(page) {
  const props = page.properties || {};
  const name = getTitle(props[PROP_MAP.name]) || getTitle(props['Name']);
  const colorProp = props[PROP_MAP.color];
  const colorLabel = (getSelect(colorProp) || getRichText(colorProp) || '').trim();
  const svgId = getRichText(props[PROP_MAP.svg_id]) || '';
  const description = getRichText(props[PROP_MAP.description]) || '';

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
    color_label: colorLabel,
    color_token: colorTokenFromRaw(colorLabel),
    svg_id: svgId || nameBasedSvgId || '',
    description: description.trim(),
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

export function parseZonesResponse(data, taskCountMap = {}, plantCountMap = {}) {
  return (data.results || []).map((p) => {
    const zone = parseZonePage(p);
    zone.taskCount = taskCountMap[zone.id] ?? 0;
    zone.plantCount = plantCountMap[zone.id] ?? 0;
    return zone;
  });
}

/** 하위 호환: 이전 section/location 명칭 */
export const parseSectionPage = parseZonePage;
export const parseSectionsResponse = parseZonesResponse;
