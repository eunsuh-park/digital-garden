/**
 * Supabase garden_* 행 → UI 도메인 (기존 Notion 파서 출력과 동일 형태)
 */

export function mapZoneRow(row) {
  return {
    id: row.id,
    name: row.name || '(이름 없음)',
    color_label: row.color_label || '',
    color_token: row.color_token || '#a8d5a2',
    svg_id: row.svg_id || '',
    description: (row.description || '').trim(),
    taskCount: 0,
    plantCount: 0,
  };
}

export function mapTaskRow(row) {
  const zt = row.garden_task_zones || [];
  const tp = row.garden_task_plants || [];
  const pr = row.garden_task_prereqs || [];
  const fu = row.garden_task_followups || [];
  const zoneIds = zt.map((r) => r.zone_id).filter(Boolean);
  const plantIds = tp.map((r) => r.plant_id).filter(Boolean);
  return {
    id: row.id,
    title: row.title || '(제목 없음)',
    status: row.status || 'pending',
    notion_status: (row.status_label || '').trim(),
    due_date: row.due_date || null,
    zone_id: zoneIds[0] || null,
    target_zone_ids: zoneIds,
    target_plant_ids: plantIds,
    notes: (row.notes || '').trim(),
    difficulty: row.difficulty || null,
    task_type: row.task_type || 'Observation',
    estimated_duration: (row.estimated_duration || '').trim(),
    scheduled_date: row.scheduled_date || '',
    prereq_task_ids: pr.map((r) => r.prereq_task_id).filter(Boolean),
    followup_task_ids: fu.map((r) => r.followup_task_id).filter(Boolean),
  };
}

export function mapPlantRow(row) {
  const pz = row.garden_plant_zones || [];
  const zoneIds = pz.map((r) => r.zone_id).filter(Boolean);
  return {
    id: row.id,
    name: row.name || '(이름 없음)',
    species: row.species || '-',
    category: row.category || '-',
    status: row.status || 'planted',
    bloom_season: row.bloom_season || '-',
    zone_id: zoneIds[0] || null,
    zone_ids: zoneIds,
    notes: (row.notes || '').trim(),
    quantity: row.quantity != null ? row.quantity : null,
  };
}

export function attachZoneCounts(zones, tasks, plants) {
  const taskMap = {};
  const plantMap = {};
  for (const t of tasks) {
    if (t.status === 'completed') continue;
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
    taskCount: taskMap[z.id] ?? z.taskCount ?? 0,
    plantCount: plantMap[z.id] ?? z.plantCount ?? 0,
  }));
}

const STATUS_LABEL_TO_INTERNAL = {
  '시작 전': 'pending',
  진행중: 'progress',
  '진행 중': 'progress',
  예정: 'pending',
  완료: 'completed',
};

export function statusFromStatusName(statusName) {
  const k = statusName != null ? String(statusName).trim() : '';
  return STATUS_LABEL_TO_INTERNAL[k] || 'pending';
}
