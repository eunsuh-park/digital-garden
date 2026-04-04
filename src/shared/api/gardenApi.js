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

const TASK_SELECT = `
  *,
  garden_task_zones(zone_id),
  garden_task_plants(plant_id),
  garden_task_prereqs(prereq_task_id),
  garden_task_followups(followup_task_id)
`;

const PLANT_SELECT = `*, garden_plant_zones(zone_id)`;

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
    .select(TASK_SELECT)
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
    .select(PLANT_SELECT)
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

export async function updateZone(projectId, zoneId, { name, description }) {
  void projectId;
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (description !== undefined) patch.description = description;
  patch.updated_at = new Date().toISOString();
  const { error } = await supabase.from('garden_zones').update(patch).eq('id', zoneId);
  rwError(error, '구역을 수정하지 못했습니다.');
}

export async function deleteZone(projectId, zoneId) {
  void projectId;
  const { error } = await supabase.from('garden_zones').delete().eq('id', zoneId);
  rwError(error, '구역을 삭제하지 못했습니다.');
}

export async function createTask(projectId, payload) {
  const p = pid(projectId);
  if (p == null) throw new Error('프로젝트가 없습니다.');
  const { data: row, error } = await supabase
    .from('garden_tasks')
    .insert({
      project_id: p,
      title: payload.title,
      status: 'pending',
      status_label: '시작 전',
      notes: payload.notes || '',
      difficulty: payload.difficulty || null,
      task_type: payload.task_type || 'Observation',
      estimated_duration: payload.estimated_duration || '',
      scheduled_date: payload.scheduled_date ? payload.scheduled_date : null,
      due_date: null,
    })
    .select('id')
    .single();
  rwError(error, '할 일을 만들지 못했습니다.');
  const id = row.id;
  const zids = payload.target_zone_ids || [];
  const pids = payload.target_plant_ids || [];
  if (zids.length) {
    const { error: e2 } = await supabase
      .from('garden_task_zones')
      .insert(zids.map((zone_id) => ({ task_id: id, zone_id })));
    rwError(e2, '구역 연결에 실패했습니다.');
  }
  if (pids.length) {
    const { error: e3 } = await supabase
      .from('garden_task_plants')
      .insert(pids.map((plant_id) => ({ task_id: id, plant_id })));
    rwError(e3, '식물 연결에 실패했습니다.');
  }
}

export async function updateTask(projectId, taskId, updates) {
  void projectId;
  const {
    title,
    notes,
    task_type,
    difficulty,
    estimated_duration,
    scheduled_date,
    target_zone_ids,
    target_plant_ids,
    status_name,
  } = updates;

  const patch = { updated_at: new Date().toISOString() };
  if (title !== undefined) patch.title = title;
  if (notes !== undefined) patch.notes = notes;
  if (task_type !== undefined) patch.task_type = task_type;
  if (difficulty !== undefined) patch.difficulty = difficulty;
  if (estimated_duration !== undefined) patch.estimated_duration = estimated_duration;
  if (scheduled_date !== undefined) patch.scheduled_date = scheduled_date ? scheduled_date : null;
  if (status_name != null && String(status_name).trim()) {
    const sn = String(status_name).trim();
    patch.status_label = sn;
    patch.status = statusFromStatusName(sn);
  }

  const { error } = await supabase.from('garden_tasks').update(patch).eq('id', taskId);
  rwError(error, '할 일을 수정하지 못했습니다.');

  if (Array.isArray(target_zone_ids)) {
    const { error: d1 } = await supabase.from('garden_task_zones').delete().eq('task_id', taskId);
    rwError(d1, '구역 연결을 갱신하지 못했습니다.');
    if (target_zone_ids.length) {
      const { error: i1 } = await supabase
        .from('garden_task_zones')
        .insert(target_zone_ids.map((zone_id) => ({ task_id: taskId, zone_id })));
      rwError(i1, '구역 연결을 갱신하지 못했습니다.');
    }
  }

  if (Array.isArray(target_plant_ids)) {
    const { error: d2 } = await supabase.from('garden_task_plants').delete().eq('task_id', taskId);
    rwError(d2, '식물 연결을 갱신하지 못했습니다.');
    if (target_plant_ids.length) {
      const { error: i2 } = await supabase
        .from('garden_task_plants')
        .insert(target_plant_ids.map((plant_id) => ({ task_id: taskId, plant_id })));
      rwError(i2, '식물 연결을 갱신하지 못했습니다.');
    }
  }
}

export async function deleteTask(projectId, taskId) {
  void projectId;
  const { error } = await supabase.from('garden_tasks').delete().eq('id', taskId);
  rwError(error, '할 일을 삭제하지 못했습니다.');
}

function parseQuantity(q) {
  if (q == null || q === '') return null;
  const n = typeof q === 'number' ? q : Number(String(q).trim());
  return Number.isFinite(n) ? n : null;
}

export async function createPlant(projectId, payload) {
  const p = pid(projectId);
  if (p == null) throw new Error('프로젝트가 없습니다.');
  const { data: row, error } = await supabase
    .from('garden_plants')
    .insert({
      project_id: p,
      name: payload.name,
      species: payload.species || '-',
      category: (payload.category || '').trim() || '-',
      status: payload.status || 'planted',
      bloom_season: (payload.bloom_season || '').trim() || '-',
      notes: payload.notes || '',
      quantity: parseQuantity(payload.quantity),
    })
    .select('id')
    .single();
  rwError(error, '식물을 만들지 못했습니다.');
  const id = row.id;
  const zids = payload.zone_ids || [];
  if (zids.length) {
    const { error: e2 } = await supabase
      .from('garden_plant_zones')
      .insert(zids.map((zone_id) => ({ plant_id: id, zone_id })));
    rwError(e2, '구역 연결에 실패했습니다.');
  }
}

export async function updatePlant(projectId, plantId, updates) {
  void projectId;
  const { name, species, status, bloom_season, quantity, notes, zone_ids } = updates;
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name;
  if (species !== undefined) patch.species = species;
  if (status !== undefined) patch.status = status;
  if (bloom_season !== undefined) patch.bloom_season = bloom_season;
  if (notes !== undefined) patch.notes = notes;
  if (quantity !== undefined) patch.quantity = parseQuantity(quantity);

  const { error } = await supabase.from('garden_plants').update(patch).eq('id', plantId);
  rwError(error, '식물을 수정하지 못했습니다.');

  if (Array.isArray(zone_ids)) {
    const { error: d1 } = await supabase.from('garden_plant_zones').delete().eq('plant_id', plantId);
    rwError(d1, '구역 연결을 갱신하지 못했습니다.');
    if (zone_ids.length) {
      const { error: i1 } = await supabase
        .from('garden_plant_zones')
        .insert(zone_ids.map((zone_id) => ({ plant_id: plantId, zone_id })));
      rwError(i1, '구역 연결을 갱신하지 못했습니다.');
    }
  }
}

export async function deletePlant(projectId, plantId) {
  void projectId;
  const { error } = await supabase.from('garden_plants').delete().eq('id', plantId);
  rwError(error, '식물을 삭제하지 못했습니다.');
}
