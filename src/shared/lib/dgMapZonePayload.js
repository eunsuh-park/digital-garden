/** 맵 빌더에서 저장한 구역: DB description 끝에 JSON 부분을 붙임 */

export const DG_MAP_MARKER = '\n__DG_MAP_V1__\n';

export function encodeDgMapDescription(humanText, shapePayload) {
  const t = humanText != null ? String(humanText).trim() : '';
  return `${t}${DG_MAP_MARKER}${JSON.stringify(shapePayload)}`;
}

/**
 * @param {string|undefined|null} raw
 * @returns {{ description: string, dgMapShape: object|null }}
 */
export function parseDgMapFromDescription(raw) {
  const s = raw != null ? String(raw) : '';
  const i = s.indexOf(DG_MAP_MARKER);
  if (i < 0) return { description: s.trim(), dgMapShape: null };
  const description = s.slice(0, i).trim();
  try {
    const dgMapShape = JSON.parse(s.slice(i + DG_MAP_MARKER.length));
    return { description, dgMapShape: typeof dgMapShape === 'object' && dgMapShape ? dgMapShape : null };
  } catch {
    return { description: s.trim(), dgMapShape: null };
  }
}
