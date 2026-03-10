/**
 * Tasks DB 스키마 매핑
 * Notion DB의 실제 property 이름에 맞게 수정하세요
 */
import { getTitle, getSelect, getDate, getRelation } from '../../lib/parseNotionProps';

export const PROP_MAP = {
  title: '제목',      // title
  status: '상태',     // select
  due_date: '마감일', // date
  section: '위치',    // relation → Section DB
};

export function parseTaskPage(page) {
  const props = page.properties || {};
  const title = getTitle(props[PROP_MAP.title]);
  const statusRaw = getSelect(props[PROP_MAP.status]);
  const due = getDate(props[PROP_MAP.due_date]);
  const sectionIds = getRelation(props[PROP_MAP.section]);

  // status: Notion 선택값 → progress | pending | completed
  const statusMap = {
    진행중: 'progress',
    예정: 'pending',
    완료: 'completed',
  };
  const status = statusMap[statusRaw] ?? (statusRaw ? 'pending' : 'pending');

  return {
    id: page.id,
    title: title || '(제목 없음)',
    status,
    due_date: due,
    section_id: sectionIds[0] || null,
  };
}

export function parseTasksResponse(data) {
  return (data.results || []).map(parseTaskPage);
}
