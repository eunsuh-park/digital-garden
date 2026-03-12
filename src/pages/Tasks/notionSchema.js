/**
 * Tasks DB 스키마 매핑
 * - Target_Location → Locations (N:1)
 * - Target_Plant → Plants (N:1, Plants.Name과 연결)
 */
import { getTitle, getRichText, getSelect, getDate, getRelation } from '../../lib/parseNotionProps';

export const PROP_MAP = {
  title: '제목',           // title
  status: '상태',          // select
  due_date: '마감일',      // date
  section: 'Target_Location', // relation → Locations (N:1)
  target_plant: 'Target_Plant', // relation → Plants (N:1, Plants.Name과 연결)
  notes: 'Notes',          // rich_text (설명/메모)
  difficulty: 'Difficulty', // select: Easy | Medium | Hard (또는 한글 난이도)
  task_type: 'Task_Type',  // select: Pruning, Fertilizing, Propagation, Watering, Transplanting, Observation, Cleaning, Decorating, Construction
};

export function parseTaskPage(page) {
  const props = page.properties || {};
  // Notion DB 속성명이 "Title"(영문) 또는 "제목"(한글)일 수 있음
  const title = getTitle(props['Title']) || getTitle(props[PROP_MAP.title]);
  const statusRaw = getSelect(props[PROP_MAP.status]);
  const due = getDate(props[PROP_MAP.due_date]);
  const sectionIds = getRelation(props[PROP_MAP.section]);
  const targetPlantIds = getRelation(props[PROP_MAP.target_plant]);
  const notes = getRichText(props[PROP_MAP.notes]) || getRichText(props['Notes']) || '';
  const difficultyRaw = getSelect(props[PROP_MAP.difficulty]) || getSelect(props['Difficulty']) || '';
  const taskTypeRaw = getSelect(props[PROP_MAP.task_type]) || getSelect(props['Task_Type']) || '';

  // status: Notion 선택값 → progress | pending | completed
  const statusMap = {
    진행중: 'progress',
    예정: 'pending',
    완료: 'completed',
  };
  const status = statusMap[statusRaw] ?? (statusRaw ? 'pending' : 'pending');

  // Difficulty: Notion 값 → Easy | Medium | Hard (TaskCard difficultyConfig)
  const difficultyMap = {
    Easy: 'Easy',
    Medium: 'Medium',
    Hard: 'Hard',
    쉬움: 'Easy',
    쉬운: 'Easy',
    보통: 'Medium',
    어려움: 'Hard',
    어려운: 'Hard',
  };
  const difficulty = difficultyMap[difficultyRaw] || difficultyMap[difficultyRaw?.trim()] || 'Easy';

  // Task_Type: Notion 값 → 영문 키 (TaskCard taskTypeConfig에서 한글 라벨로 표시)
  const TASK_TYPE_KEYS = [
    'Pruning', 'Fertilizing', 'Propagation', 'Watering', 'Transplanting',
    'Observation', 'Cleaning', 'Decorating', 'Construction',
  ];
  const taskTypeNorm = (taskTypeRaw || '').trim();
  const task_type = TASK_TYPE_KEYS.includes(taskTypeNorm)
    ? taskTypeNorm
    : (TASK_TYPE_KEYS.find((k) => k.toLowerCase() === taskTypeNorm.toLowerCase()) || 'Observation');

  return {
    id: page.id,
    title: title || '(제목 없음)',
    status,
    due_date: due,
    section_id: sectionIds[0] || null,
    target_plant_ids: targetPlantIds || [],
    notes: notes.trim() || '',
    difficulty,
    task_type,
  };
}

export function parseTasksResponse(data) {
  return (data.results || []).map(parseTaskPage);
}
