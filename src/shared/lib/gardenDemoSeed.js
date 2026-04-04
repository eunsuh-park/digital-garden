/**
 * DB 시드(Supabase `garden_*`)와 동일한 데모 스냅샷.
 * USE_MOCK / 프로젝트 목록 로드 전에도 동일 UX를 맞추기 위해 사용합니다.
 */
const Z1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const Z2 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
const Z3 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';
const P1 = 'cccccccc-cccc-cccc-cccc-ccccccccccc1';
const P2 = 'cccccccc-cccc-cccc-cccc-ccccccccccc2';
const P3 = 'cccccccc-cccc-cccc-cccc-ccccccccccc3';
const T1 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1';
const T2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2';
const T3 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3';

const baseZones = [
  {
    id: Z1,
    name: '앞마당',
    color_label: '초록',
    color_token: '#2ecc71',
    svg_id: 'front_yard',
    description: '입구 쪽 화단',
    taskCount: 0,
    plantCount: 0,
  },
  {
    id: Z2,
    name: '텃밭',
    color_label: '연두',
    color_token: '#8bc34a',
    svg_id: 'vegetable_patch',
    description: '채소 재배 구역',
    taskCount: 0,
    plantCount: 0,
  },
  {
    id: Z3,
    name: '온실',
    color_label: '하늘',
    color_token: '#5dade2',
    svg_id: 'greenhouse',
    description: '겨울철 보호 재배',
    taskCount: 0,
    plantCount: 0,
  },
];

const basePlants = [
  {
    id: P1,
    name: '방울토마토',
    species: 'Solanum',
    category: '채소',
    status: 'planted',
    bloom_season: '여름',
    notes: '햇빛 많은 곳 선호',
    quantity: 6,
    zone_id: Z2,
    zone_ids: [Z2],
  },
  {
    id: P2,
    name: '상추',
    species: 'Lactuca',
    category: '채소',
    status: 'planted',
    bloom_season: '-',
    notes: '빠른 수확',
    quantity: 12,
    zone_id: Z2,
    zone_ids: [Z2],
  },
  {
    id: P3,
    name: '라벤더',
    species: 'Lavandula',
    category: '허브',
    status: 'planted',
    bloom_season: '초여름',
    notes: '밭 가장자리',
    quantity: 3,
    zone_id: Z1,
    zone_ids: [Z1],
  },
];

const baseTasks = [
  {
    id: T1,
    title: '텃밭 물주기',
    status: 'pending',
    notion_status: '시작 전',
    due_date: null,
    zone_id: Z2,
    target_zone_ids: [Z2],
    target_plant_ids: [],
    notes: '상추·토마토 구역 위주',
    difficulty: 'Easy',
    task_type: 'Watering',
    estimated_duration: '20분',
    scheduled_date: '',
    prereq_task_ids: [],
    followup_task_ids: [],
  },
  {
    id: T2,
    title: '방울토마토 전정',
    status: 'progress',
    notion_status: '진행중',
    due_date: null,
    zone_id: Z2,
    target_zone_ids: [Z2],
    target_plant_ids: [P1],
    notes: '아랫잎 정리',
    difficulty: 'Medium',
    task_type: 'Pruning',
    estimated_duration: '30분',
    scheduled_date: '',
    prereq_task_ids: [],
    followup_task_ids: [],
  },
  {
    id: T3,
    title: '온실 환기',
    status: 'pending',
    notion_status: '예정',
    due_date: null,
    zone_id: Z3,
    target_zone_ids: [Z3],
    target_plant_ids: [],
    notes: '오전 10시 이후',
    difficulty: 'Easy',
    task_type: 'Observation',
    estimated_duration: '10분',
    scheduled_date: '',
    prereq_task_ids: [],
    followup_task_ids: [],
  },
];

function aggregateCounts(zones, tasks, plants) {
  const taskMap = {};
  const plantMap = {};
  for (const t of tasks) {
    for (const zid of t.target_zone_ids || []) {
      if (!zid) continue;
      taskMap[zid] = (taskMap[zid] || 0) + 1;
    }
  }
  for (const p of plants) {
    for (const zid of p.zone_ids || []) {
      if (!zid) continue;
      plantMap[zid] = (plantMap[zid] || 0) + 1;
    }
  }
  return zones.map((z) => ({
    ...z,
    taskCount: taskMap[z.id] ?? 0,
    plantCount: plantMap[z.id] ?? 0,
  }));
}

/** @returns {{ zones: object[], tasks: object[], plants: object[] }} */
export function getDemoGardenSnapshot() {
  const tasks = baseTasks.map((t) => ({ ...t }));
  const plants = basePlants.map((p) => ({ ...p }));
  const zones = aggregateCounts(
    baseZones.map((z) => ({ ...z })),
    tasks,
    plants
  );
  return { zones, tasks, plants };
}
