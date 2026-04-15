/**
 * Supabase garden_* 행 → UI 도메인
 * DB: garden_zones, garden_tasks, garden_plants (직접 zone_id FK, 중간 테이블 없음)
 */

import { parseDgMapFromDescription } from '@/shared/lib/dgMapZonePayload';

export function mapZoneRow(row) {
  const rawDescription = row.description != null ? String(row.description) : '';
  const { description, dgMapShape } = parseDgMapFromDescription(rawDescription);
  return {
    id: row.id,
    name: row.name || '(이름 없음)',
    color_label: row.color_label || '',
    color_token: row.color_token || '#a8d5a2',
    svg_id: row.svg_id || '',
    description: description.trim(),
    dgMapShape,
    isDgMapBuilt: dgMapShape != null,
    taskCount: 0,
    plantCount: 0,
  };
}

export function mapTaskRow(row) {
  return {
    id: row.id,
    title: row.title || '(제목 없음)',
    status: row.status || 'pending',
    status_label: (row.status_label || '').trim(),
    due_date: row.due_date || null,
    zone_id: row.zone_id || null,
    notes: (row.notes || '').trim(),
    difficulty: row.difficulty || null,
    task_type: row.task_type || 'Observation',
    estimated_duration: (row.estimated_duration || '').trim(),
    scheduled_date: row.scheduled_date || '',
  };
}

export function mapPlantRow(row) {
  return {
    id: row.id,
    name: row.name || '(이름 없음)',
    species: row.species || '-',
    category: row.category || '-',
    status: row.status || 'planted',
    bloom_season: row.bloom_season || '-',
    zone_id: row.zone_id || null,
    notes: (row.notes || '').trim(),
    quantity: row.quantity != null ? row.quantity : null,
  };
}

export function attachZoneCounts(zones, tasks, plants) {
  const taskMap = {};
  const plantMap = {};
  for (const t of tasks) {
    if (t.status === 'completed') continue;
    if (!t.zone_id) continue;
    taskMap[t.zone_id] = (taskMap[t.zone_id] || 0) + 1;
  }
  for (const p of plants) {
    if (!p.zone_id) continue;
    plantMap[p.zone_id] = (plantMap[p.zone_id] || 0) + 1;
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
