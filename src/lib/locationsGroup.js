/**
 * color_token 기준으로 location을 그룹화 (기존 지도 레전드와 동일 규칙)
 * @param {Array<{ color_token?: string, name?: string }>} locations
 * @returns {Array<{ color: string, items: typeof locations }>}
 */
export function groupLocationsByColor(locations) {
  const byColor = new Map();
  (locations || []).forEach((l) => {
    const c = (l.color_token || '').trim() || '#a8d5a2';
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c).push(l);
  });
  return Array.from(byColor.entries()).map(([color, items]) => ({ color, items }));
}

/** 레전드/패널 라벨: 첫 이름 + 외 N개 */
export function labelForColorGroup(items) {
  if (!items?.length) return '구역';
  if (items.length === 1) return items[0].name || '구역';
  return `${items[0].name} 외 ${items.length - 1}개`;
}
