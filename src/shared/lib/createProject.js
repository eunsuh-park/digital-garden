import { supabase } from './supabaseClient.js';

/**
 * 프로젝트 생성
 * @param {Object} project - { name, space_size, purpose, ... }
 * @returns {Promise<{ data, error }>}
 */
export async function createProject(project) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const row = { ...project };
  if (user?.id && (row.owner_id === undefined || row.owner_id === null)) {
    row.owner_id = user.id;
  }
  const { data, error } = await supabase.from('projects').insert(row).select().single();
  return { data, error };
}
