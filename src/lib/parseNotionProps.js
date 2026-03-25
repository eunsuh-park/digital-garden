/**
 * Notion property 값 추출 유틸
 * Notion API 응답의 properties 객체에서 값 파싱
 */

export function getTitle(prop) {
  if (!prop?.title) return '';
  return prop.title.map((t) => t.plain_text).join('');
}

export function getRichText(prop) {
  if (!prop?.rich_text) return '';
  return prop.rich_text.map((t) => t.plain_text).join('');
}

export function getSelect(prop) {
  return prop?.select?.name ?? '';
}

/** Notion `status` 타입 프로퍼티 (이름만) */
export function getNotionStatus(prop) {
  return prop?.status?.name ?? '';
}

/**
 * Notion `formula` 타입 — 표시용 문자열 (종/라벨 등 텍스트 필드용)
 */
export function getFormulaDisplay(prop) {
  if (!prop?.formula) return '';
  const f = prop.formula;
  switch (f.type) {
    case 'string':
      return (f.string ?? '').trim();
    case 'number':
      return f.number != null && !Number.isNaN(f.number) ? String(f.number) : '';
    case 'boolean':
      return f.boolean ? 'true' : '';
    case 'date':
      return (f.date?.start ?? '').trim();
    default:
      return '';
  }
}

export function getMultiSelect(prop) {
  if (!prop?.multi_select) return [];
  return prop.multi_select.map((s) => s.name);
}

export function getDate(prop) {
  return prop?.date?.start ?? '';
}

export function getRelation(prop) {
  if (!prop?.relation) return [];
  return prop.relation.map((r) => r.id);
}

export function getNumber(prop) {
  return prop?.number ?? null;
}

export function getCheckbox(prop) {
  return !!prop?.checkbox;
}

export function getUrl(prop) {
  return prop?.url ?? '';
}

/**
 * properties 객체에서 지정한 key로 값 추출
 * Notion은 property 이름이 키이므로, propMap으로 우리 필드명 → Notion property 이름 매핑
 */
export function extractProps(properties, propMap, extractors = {}) {
  const defaults = {
    title: getTitle,
    rich_text: getRichText,
    select: getSelect,
    multi_select: getMultiSelect,
    date: getDate,
    relation: getRelation,
    number: getNumber,
    checkbox: getCheckbox,
    url: getUrl,
  };
  const fns = { ...defaults, ...extractors };
  const out = {};

  for (const [ourKey, notionKey] of Object.entries(propMap)) {
    const raw = properties[notionKey];
    if (!raw) continue;
    const fn = fns[raw.type];
    if (fn) out[ourKey] = fn(raw);
  }
  return out;
}
