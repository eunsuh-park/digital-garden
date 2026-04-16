import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────
// 공간 넓이 (Space Size)
// ─────────────────────────────────────────────

/** DB·API에 저장되는 공간 넓이 값 (영문) */
export const PROJECT_SPACE_SIZE_VALUES = ['narrow', 'medium', 'wide', 'very_wide'];

const LEGACY_SPACE_MAP = { s: 'narrow', m: 'medium', l: 'wide' };

/** 화면 표시용 한글 설명 */
export const PROJECT_SPACE_SIZE_LABEL_KO = {
  narrow: '좁음 (실내, 방 등)',
  medium: '중간 (온실 등)',
  wide: '넓음 (실외 정원)',
  very_wide: '매우 넓음 (텃밭 등)',
};

/** ButtonTabGroup 등에 넘길 항목 */
export const PROJECT_SPACE_SIZE_TAB_ITEMS = PROJECT_SPACE_SIZE_VALUES.map((value) => ({
  value,
  label: PROJECT_SPACE_SIZE_LABEL_KO[value],
}));

/** 맵 빌더에서 허용할 공간 옵션 (실내 정원 제외) */
export const PROJECT_SPACE_SIZE_MAP_BUILDER_VALUES = ['medium', 'wide', 'very_wide'];

export const PROJECT_SPACE_SIZE_MAP_BUILDER_TAB_ITEMS = PROJECT_SPACE_SIZE_MAP_BUILDER_VALUES.map(
  (value) => ({
    value,
    label: PROJECT_SPACE_SIZE_LABEL_KO[value],
  }),
);

/** 마이그레이션 전 s/m/l 값도 표시 가능 */
export function formatProjectSpaceSizeLabel(spaceSize) {
  if (spaceSize == null || spaceSize === '') return '—';
  const key = LEGACY_SPACE_MAP[spaceSize] || spaceSize;
  return PROJECT_SPACE_SIZE_LABEL_KO[key] ?? String(spaceSize);
}

// ─────────────────────────────────────────────
// 새 프로젝트 마법사 임시 저장 (Wizard Draft)
// sessionStorage에 폼 입력값을 임시 보관해서
// 실수로 페이지 이탈해도 입력 내용이 유지됨
// ─────────────────────────────────────────────

/** @typedef {{ name: string, space: string, spaceDescription: string }} ProjectWizardDraft */

export const PROJECT_WIZARD_DRAFT_KEY = 'dg_project_wizard_v2';

const MAX_NAME = 20;
const MAX_SPACE_DESC = 200;

/** @returns {ProjectWizardDraft | null} */
export function loadProjectWizardDraft() {
  try {
    const raw = sessionStorage.getItem(PROJECT_WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    const rawSpace = typeof o.space === 'string' ? o.space : '';
    const space = LEGACY_SPACE_MAP[rawSpace] || rawSpace;
    const descRaw =
      typeof o.spaceDescription === 'string'
        ? o.spaceDescription
        : typeof o.description === 'string'
          ? o.description
          : '';
    return {
      name: (typeof o.name === 'string' ? o.name : '').slice(0, MAX_NAME),
      space,
      spaceDescription: descRaw.slice(0, MAX_SPACE_DESC),
    };
  } catch {
    return null;
  }
}

/** @param {ProjectWizardDraft} draft */
export function saveProjectWizardDraft(draft) {
  try {
    sessionStorage.setItem(
      PROJECT_WIZARD_DRAFT_KEY,
      JSON.stringify({
        name: draft.name.slice(0, MAX_NAME),
        space: draft.space,
        spaceDescription: draft.spaceDescription.slice(0, MAX_SPACE_DESC),
      })
    );
  } catch {
    /* ignore quota */
  }
}

export function clearProjectWizardDraft() {
  try {
    sessionStorage.removeItem(PROJECT_WIZARD_DRAFT_KEY);
    sessionStorage.removeItem('dg_project_wizard_v1');
  } catch {
    /* ignore */
  }
}

// ─────────────────────────────────────────────
// 프로젝트 CRUD (Supabase)
// ─────────────────────────────────────────────

/** 마이그레이션 전 DB (CHECK 가 s/m/l 만 허용) */
const SPACE_SIZE_LEGACY = { narrow: 's', medium: 'm', wide: 'l', very_wide: 'l' };

function errorText(error) {
  return [error?.message, error?.details, error?.hint].filter(Boolean).join(' | ');
}

function isUnknownSpaceDescriptionColumn(error) {
  const t = errorText(error);
  return (
    t.includes('space_description') && (t.includes('schema cache') || t.includes('Could not find'))
  );
}

async function insertProject(row) {
  return supabase.from('projects').insert(row).select().single();
}

function uniqueAttempts(rows) {
  const out = [];
  const seen = new Set();
  for (const row of rows) {
    const key = JSON.stringify(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

function buildRowVariants(base, trimmedDesc) {
  const rows = [];
  const withOptionalDesc = (b) => (trimmedDesc ? { ...b, space_description: trimmedDesc } : { ...b });

  rows.push(withOptionalDesc(base));
  if (trimmedDesc) rows.push({ ...base });

  const leg = SPACE_SIZE_LEGACY[base.space_size];
  if (leg && leg !== base.space_size) {
    const legacyBase = { ...base, space_size: leg };
    rows.push(withOptionalDesc(legacyBase));
    if (trimmedDesc) rows.push({ ...legacyBase });
  }

  return uniqueAttempts(rows);
}

/**
 * 프로젝트 목록 조회
 * @returns {Promise<{ data, error }>}
 */
export async function loadProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('id', { ascending: false });
  return { data, error };
}

/**
 * 프로젝트 생성
 * @param {{ name: string, space_size: string, space_description?: string }} project
 * @returns {Promise<{ data, error }>}
 */
export async function createProject(project) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const base = {
    name: project.name,
    space_size: project.space_size,
  };
  if (user?.id && (project.owner_id === undefined || project.owner_id === null)) {
    base.owner_id = user.id;
  } else if (project.owner_id != null) {
    base.owner_id = project.owner_id;
  }

  const trimmedDesc =
    project.space_description != null && String(project.space_description).trim() !== ''
      ? String(project.space_description).trim()
      : '';

  const attempts = buildRowVariants(base, trimmedDesc);

  let lastError = null;
  for (const row of attempts) {
    let { data, error } = await insertProject(row);
    if (error && isUnknownSpaceDescriptionColumn(error) && 'space_description' in row) {
      const { space_description: _omit, ...rest } = row;
      ({ data, error } = await insertProject(rest));
    }
    if (!error) return { data, error: null };
    lastError = error;
  }

  return { data: null, error: lastError };
}

/**
 * 프로젝트 수정
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<{ data, error }>}
 */
export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * 프로젝트 삭제
 * @param {string} id
 * @returns {Promise<{ data, error }>}
 */
export async function deleteProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}
