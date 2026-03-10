/**
 * Phase 1~2 MVP용 임시 데이터 (로컬 테스트용)
 * API 연동 시 이 파일은 제거/대체됨
 */
export const SECTIONS = [
  { id: 'sec-1', name: '앞마당', zone_type: 'yard', color_token: '#a8d5a2', svg_id: 'section-front', taskCount: 3, plantCount: 5 },
  { id: 'sec-2', name: '화단 A', zone_type: 'flowerbed', color_token: '#f4a582', svg_id: 'section-flower-a', taskCount: 2, plantCount: 8 },
  { id: 'sec-3', name: '화단 B', zone_type: 'flowerbed', color_token: '#92c5de', svg_id: 'section-flower-b', taskCount: 1, plantCount: 6 },
  { id: 'sec-4', name: '텃밭', zone_type: 'garden', color_token: '#fdae61', svg_id: 'section-garden', taskCount: 4, plantCount: 12 },
  { id: 'sec-5', name: '뒷마당', zone_type: 'yard', color_token: '#a8d5a2', svg_id: 'section-back', taskCount: 2, plantCount: 7 },
];

export const TASKS = [
  { id: 'task-1', title: '앞마당 잔디 깎기', status: 'progress', due_date: '2025-03-12', section_id: 'sec-1', priority: 'high' },
  { id: 'task-2', title: '화단 A 물주기', status: 'pending', due_date: '2025-03-11', section_id: 'sec-2', priority: 'normal' },
  { id: 'task-3', title: '텃밭 모종 심기', status: 'pending', due_date: '2025-03-15', section_id: 'sec-4', priority: 'high' },
  { id: 'task-4', title: '화단 B 잡초 제거', status: 'completed', due_date: '2025-03-08', section_id: 'sec-3', priority: 'normal' },
  { id: 'task-5', title: '뒷마당 가지치기', status: 'pending', due_date: '2025-03-14', section_id: 'sec-5', priority: 'normal' },
  { id: 'task-6', title: '앞마당 비료 주기', status: 'pending', due_date: '2025-03-13', section_id: 'sec-1', priority: 'normal' },
];

export const PLANTS = [
  { id: 'pl-1', name: '장미', species: 'Rosa', category: '꽃', status: 'planted', bloom_season: '봄~가을', section_id: 'sec-2' },
  { id: 'pl-2', name: '튤립', species: 'Tulipa', category: '꽃', status: 'planted', bloom_season: '봄', section_id: 'sec-2' },
  { id: 'pl-3', name: '라벤더', species: 'Lavandula', category: '꽃', status: 'planted', bloom_season: '여름', section_id: 'sec-3' },
  { id: 'pl-4', name: '상추', species: 'Lactuca', category: '채소', status: 'planted', bloom_season: '-', section_id: 'sec-4' },
  { id: 'pl-5', name: '당근', species: 'Daucus', category: '채소', status: 'planted', bloom_season: '-', section_id: 'sec-4' },
  { id: 'pl-6', name: '잔디', species: 'Zoysia', category: '잔디', status: 'planted', bloom_season: '-', section_id: 'sec-1' },
];

export const getTasksBySection = (sectionId) =>
  TASKS.filter((t) => t.section_id === sectionId && t.status !== 'completed');

export const getSectionById = (id) => SECTIONS.find((s) => s.id === id);

export const getPlantsBySection = (sectionId) =>
  PLANTS.filter((p) => p.section_id === sectionId);
