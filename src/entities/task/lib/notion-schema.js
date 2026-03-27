/**
 * Tasks DB 스키마 매핑
 * - Target_Location → Locations (N:1)
 * - Target_Plant → Plants (N:1, Plants.Name과 연결)
 */
import {
  getTitle,
  getRichText,
  getSelect,
  getNotionStatus,
  getDate,
  getRelation,
} from '@/shared/lib/parseNotionProps';

/** Notion Task_Type 선택값(영문) — 생성·파싱 공통 */
export const TASK_TYPE_KEYS = [
  'Pruning',
  'Fertilizing',
  'Propagation',
  'Watering',
  'Transplanting',
  'Observation',
  'Cleaning',
  'Decorating',
  'Construction',
];

export const TASK_TYPE_LABEL_KO = {
  Pruning: '전정',
  Fertilizing: '비료',
  Propagation: '번식',
  Watering: '물주기',
  Transplanting: '이식',
  Observation: '관찰',
  Cleaning: '청소',
  Decorating: '꾸미기',
  Construction: '시공',
};

export const PROP_MAP = {
  title: 'Title',
  status: 'Status',
  due_date: 'Due_Date',
  section: 'Target_Location',
  target_plant: 'Target_Plant',
  notes: 'Notes',
  difficulty: 'Difficulty',
  task_type: 'Task_Type',
  estimated_duration: 'Estimated_Duration',
  scheduled_date: 'Scheduled_Date',
  /** Notion에서 한글 프로퍼티명 유지 */
  prereq_tasks: '선행 작업',
  followup_tasks: '후속 작업',
};

export function parseTaskPage(page) {
  const props = page.properties || {};
  const title = getTitle(props[PROP_MAP.title]) || getTitle(props.Title);
  const statusRaw = getNotionStatus(props[PROP_MAP.status]) || getSelect(props[PROP_MAP.status]);
  const due = getDate(props[PROP_MAP.due_date]);
  const sectionIds = getRelation(props[PROP_MAP.section]);
  const targetPlantIds = getRelation(props[PROP_MAP.target_plant]);
  const notes = getRichText(props[PROP_MAP.notes]) || '';
  const difficultyRaw = getSelect(props[PROP_MAP.difficulty]);
  const taskTypeRaw = getSelect(props[PROP_MAP.task_type]);
  const estimatedDuration = getRichText(props[PROP_MAP.estimated_duration]) || '';
  const scheduledDate = getDate(props[PROP_MAP.scheduled_date]) || '';
  const prereqTaskIds = getRelation(props[PROP_MAP.prereq_tasks]) || getRelation(props['선행 작업']);
  const followupTaskIds = getRelation(props[PROP_MAP.followup_tasks]) || getRelation(props['후속 작업']);

  // status: Notion 선택값 → progress | pending | completed
  const statusMap = {
    '시작 전': 'pending',
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
    estimated_duration: estimatedDuration.trim() || '',
    scheduled_date: scheduledDate || '',
    prereq_task_ids: prereqTaskIds || [],
    followup_task_ids: followupTaskIds || [],
  };
}

export function parseTasksResponse(data) {
  return (data.results || []).map(parseTaskPage);
}
