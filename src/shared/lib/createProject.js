import { supabase } from './supabaseClient.js';

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

  if (trimmedDesc) {
    rows.push({ ...base });
  }

  const leg = SPACE_SIZE_LEGACY[base.space_size];
  if (leg && leg !== base.space_size) {
    const legacyBase = { ...base, space_size: leg };
    rows.push(withOptionalDesc(legacyBase));
    if (trimmedDesc) {
      rows.push({ ...legacyBase });
    }
  }

  return uniqueAttempts(rows);
}

/**
 * 프로젝트 생성
 * @param {Object} project - { name, space_size, space_description?, ... }
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

    if (!error) {
      return { data, error: null };
    }
    lastError = error;
  }

  return { data: null, error: lastError };
}
