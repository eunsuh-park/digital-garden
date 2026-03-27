import { supabase } from './supabaseClient.js';

/**
 * 프로젝트 삭제
 * @param {string} id - 프로젝트 id
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
