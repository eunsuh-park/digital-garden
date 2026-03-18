import { supabase } from './supabaseClient.js';

/**
 * 프로젝트 수정
 * @param {string} id - 프로젝트 id
 * @param {Object} updates - 수정할 필드들
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
