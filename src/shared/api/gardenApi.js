/**
 * Supabase garden_* CRUD
 * DB: garden_zones, garden_tasks(zone_id FK), garden_plants(zone_id FK)
 * 관계는 단순 FK — 필터/소트는 프론트엔드에서 처리
 */
import { supabase } from '@/lib/supabase';
import { colorTokenFromRaw } from '@/entities/zone/lib/notion-schema';
import {
  mapZoneRow,
  mapTaskRow,
  mapPlantRow,
  attachZoneCounts,
  statusFromStatusName,
} from '@/shared/lib/gardenFromDb';

function pid(projectId) {
  const n = Number(projectId);
  return Number.isFinite(n) ? n : null;
}

function rwError(err, fallback) {
  if (!err) return;
  const msg = err.message || '';
  if (
    err.code === '42501' ||
    msg.toLowerCase().includes('row-level security') ||
    msg.includes('violates row-level security')
  ) {
    throw new Error('데모 프로젝트는 읽기 전용입니다. 새 프로젝트를 만든 뒤 편집하세요.');
  }
  throw new Error(msg || fallback);
}

// ── 조회 ─────────────────────────────────────────────────

export async function fetchZones(projectId) {
  const p = pid(projectId);
  if (p == null) return [];
  const { data, error } = await supabase
    .from('garden_zones')
    .select('*')
    .eq('project_id', p)
    .order('name');
  rwError(error, '구역을 불러오지 못했습니다.');
  return (data || []).map(mapZoneRow);
}

export async function fetchTasks(projectId) {
  const p = pid(projectId);
  if (p == null) return [];
  const { data, error } = await supabase
    .from('garden_tasks')
    .select('*')
    .eq('project_id', p)
    .order('created_at', { ascending: false });
  rwError(error, '할 일을 불러오지 못했습니다.');
  return (data || []).map(mapTaskRow);
}

export async function fetchPlants(projectId) {
  const p = pid(projectId);
  if (p == null) return [];
  const { data, error } = await supabase
    .from('garden_plants')
    .select('*')
    .eq('project_id', p)
    .order('name');
  rwError(error, '식물을 불러오지 못했습니다.');
  return (data || []).map(mapPlantRow);
}

export async function loadGardenData(projectId) {
  const [zonesRaw, tasks, plants] = await Promise.all([
    fetchZones(projectId),
    fetchTasks(projectId),
    fetchPlants(projectId),
  ]);
  const zones = attachZoneCounts(zonesRaw, tasks, plants);
  return { zones, tasks, plants };
}

// ── Zone CRUD ─────────────────────────────────────────────

export async function createZone(projectId, { name, description, color }) {
  const p = pid(projectId);
  if (p == null) throw new Error('프로젝트가 없습니다.');
  const color_label = (color || '').trim() || '초록';
  const { error } = await supabase.from('garden_zones').insert({
    project_id: p,
    name,
    description: description || '',
    color_label,
    color_token: colorTokenFromRaw(color_label),
    svg_id: '',
  });
  rwError(error, '구역을 만들지 못했습니다.');
}

export async function updateZone(_projectId, zoneId, { name, description }) {
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name;
  if (description !== undefined) patch.description = description;
  const { error } = await supabase.from('garden_zones').update(patch).eq('id', zoneId);
  rwError(error, '구역을 수정하지 못했습니다.');
}

export async function deleteZone(_projectId, zoneId) {
  const { error } = await supabase.from('garden_zones').delete().eq('id', zoneId);
  rwError(error, '구역을 삭제하지 못했습니다.');
}

// ── Task CRUD ─────────────────────────────────────────────

export async function createTask(projectId, payload) {
  const p = pid(projectId);
  if (p == null) throw new Error('프로젝트가 없습니다.');
  const { error } = await supabase.from('garden_tasks').insert({
    project_id: p,
    title: payload.title,
    status: 'pending',
    status_label: '시작 전',
    zone_id: payload.zone_id || null,
    notes: payload.notes || '',
    difficulty: payload.difficulty || null,
    task_type: payload.task_type || 'Observation',
    estimated_duration: payload.estimated_duration || '',
    scheduled_date: payload.scheduled_date ? payload.scheduled_date : null,
  });
  rwError(error, '할 일을 만들지 못했습니다.');
}

export async function updateTask(_projectId, taskId, updates) {
  const {
    title, notes, task_type, difficulty,
    estimated_duration, scheduled_date,
    zone_id, status_name,
  } = updates;

  const patch = { updated_at: new Date().toISOString() };
  if (title !== undefined) patch.title = title;
  if (notes !== undefined) patch.notes = notes;
  if (task_type !== undefined) patch.task_type = task_type;
  if (difficulty !== undefined) patch.difficulty = difficulty;
  if (estimated_duration !== undefined) patch.estimated_duration = estimated_duration;
  if (scheduled_date !== undefined) patch.scheduled_date = scheduled_date || null;
  if (zone_id !== undefined) patch.zone_id = zone_id || null;
  if (status_name != null && String(status_name).trim()) {
    const sn = String(status_name).trim();
    patch.status_label = sn;
    patch.status = statusFromStatusName(sn);
  }

  const { error } = await supabase.from('garden_tasks').update(patch).eq('id', taskId);
  rwError(error, '할 일을 수정하지 못했습니다.');
}

export async function deleteTask(_projectId, taskId) {
  const { error } = await supabase.from('garden_tasks').delete().eq('id', taskId);
  rwError(error, '할 일을 삭제하지 못했습니다.');
}

// ── Plant CRUD ────────────────────────────────────────────

function parseQuantity(q) {
  if (q == null || q === '') return null;
  const n = typeof q === 'number' ? q : Number(String(q).trim());
  return Number.isFinite(n) ? n : null;
}

export async function createPlant(projectId, payload) {
  const p = pid(projectId);
  if (p == null) throw new Error('프로젝트가 없습니다.');
  const { error } = await supabase.from('garden_plants').insert({
    project_id: p,
    name: payload.name,
    species: payload.species || '-',
    category: (payload.category || '').trim() || '-',
    status: payload.status || 'planted',
    bloom_season: (payload.bloom_season || '').trim() || '-',
    notes: payload.notes || '',
    quantity: parseQuantity(payload.quantity),
    zone_id: payload.zone_id || null,
  });
  rwError(error, '식물을 만들지 못했습니다.');
}

export async function updatePlant(_projectId, plantId, updates) {
  const { name, species, status, bloom_season, quantity, notes, zone_id } = updates;
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name;
  if (species !== undefined) patch.species = species;
  if (status !== undefined) patch.status = status;
  if (bloom_season !== undefined) patch.bloom_season = bloom_season;
  if (notes !== undefined) patch.notes = notes;
  if (quantity !== undefined) patch.quantity = parseQuantity(quantity);
  if (zone_id !== undefined) patch.zone_id = zone_id || null;

  const { error } = await supabase.from('garden_plants').update(patch).eq('id', plantId);
  rwError(error, '식물을 수정하지 못했습니다.');
}

export async function deletePlant(_projectId, plantId) {
  const { error } = await supabase.from('garden_plants').delete().eq('id', plantId);
  rwError(error, '식물을 삭제하지 못했습니다.');
}
