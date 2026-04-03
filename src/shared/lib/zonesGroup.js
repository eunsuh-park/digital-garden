/**
 * color_token 기준으로 zone(구역)을 그룹화
 * @param {Array<{ color_token?: string, name?: string }>} zones
 * @returns {Array<{ color: string, items: typeof zones }>}
 */
export function groupZonesByColor(zones) {
  const byColor = new Map();
  (zones || []).forEach((z) => {
    const c = (z.color_token || '').trim() || '#a8d5a2';
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c).push(z);
  });
  return Array.from(byColor.entries()).map(([color, items]) => ({ color, items }));
}

export function labelForColorGroup(items) {
  if (!items?.length) return '구역';
  if (items.length === 1) return items[0].name || '구역';
  return `${items[0].name} 외 ${items.length - 1}개`;
}
