import { supabase } from './supabaseClient.js';

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
