import { supabase } from './supabaseClient.js';

/**
 * 프로젝트 생성
 * @param {Object} project - { name, ... }
 * @returns {Promise<{ data, error }>}
 */
export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  return { data, error };
}
