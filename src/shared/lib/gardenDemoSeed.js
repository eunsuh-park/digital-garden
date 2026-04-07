/**
 * 데모 스냅샷 — garden_* DB 시드와 동일한 고정 데이터
 * USE_MOCK 모드 또는 로그인 직후 데모 프로젝트 표시 시 사용
 */
const Z1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const Z2 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
const Z3 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';

const baseZones = [
  { id: Z1, name: '앞마당',  color_label: '초록', color_token: '#2ecc71', svg_id: 'front_yard',       description: '입구 쪽 화단',     taskCount: 0, plantCount: 0 },
  { id: Z2, name: '텃밭',   color_label: '연두', color_token: '#8bc34a', svg_id: 'vegetable_patch', description: '채소 재배 구역',   taskCount: 0, plantCount: 0 },
  { id: Z3, name: '온실',   color_label: '하늘', color_token: '#5dade2', svg_id: 'greenhouse',      description: '겨울철 보호 재배', taskCount: 0, plantCount: 0 },
];

const basePlants = [
  { id: 'cccccccc-cccc-cccc-cccc-ccccccccccc1', name: '방울토마토', species: '풀', category: '채소', status: 'planted', bloom_season: '여름',   notes: '햇빛 많은 곳 선호', quantity: 6,  zone_id: Z2 },
  { id: 'cccccccc-cccc-cccc-cccc-ccccccccccc2', name: '상추',     species: '풀', category: '채소', status: 'planted', bloom_season: '-',     notes: '빠른 수확',         quantity: 12, zone_id: Z2 },
  { id: 'cccccccc-cccc-cccc-cccc-ccccccccccc3', name: '라벤더',   species: '꽃', category: '허브', status: 'planted', bloom_season: '초여름', notes: '밭 가장자리',       quantity: 3,  zone_id: Z1 },
];

const baseTasks = [
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', title: '텃밭 물주기',       status: 'pending',  status_label: '시작 전', zone_id: Z2, notes: '상추·토마토 구역 위주', difficulty: 'Easy',   task_type: 'Watering',     estimated_duration: '20분', scheduled_date: '', due_date: null },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', title: '방울토마토 전정',   status: 'progress', status_label: '진행중',  zone_id: Z2, notes: '아랫잎 정리',           difficulty: 'Medium', task_type: 'Pruning',      estimated_duration: '30분', scheduled_date: '', due_date: null },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', title: '온실 환기',         status: 'pending',  status_label: '예정',    zone_id: Z3, notes: '오전 10시 이후',        difficulty: 'Easy',   task_type: 'Observation',  estimated_duration: '10분', scheduled_date: '', due_date: null },
];

/** @returns {{ zones: object[], tasks: object[], plants: object[] }} */
export function getDemoGardenSnapshot() {
  const tasks  = baseTasks.map((t) => ({ ...t }));
  const plants = basePlants.map((p) => ({ ...p }));

  const taskMap  = {};
  const plantMap = {};
  for (const t of tasks)  { if (t.status !== 'completed' && t.zone_id) taskMap[t.zone_id]  = (taskMap[t.zone_id]  || 0) + 1; }
  for (const p of plants) { if (p.zone_id)                              plantMap[p.zone_id] = (plantMap[p.zone_id] || 0) + 1; }

  const zones = baseZones.map((z) => ({
    ...z,
    taskCount:  taskMap[z.id]  ?? 0,
    plantCount: plantMap[z.id] ?? 0,
  }));

  return { zones, tasks, plants };
}
