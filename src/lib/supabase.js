import { createClient } from '@supabase/supabase-js';
import { isDevMockEnabled } from './isDevMock';
import { createMockSupabaseClient } from './supabaseMockClient';

const supabaseUrl =
  import.meta.env.SUPABASE_URL?.trim() || import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey =
  import.meta.env.SUPABASE_ANON_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!isDevMockEnabled()) {
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl ? 'SUPABASE_URL (또는 VITE_SUPABASE_URL)' : null,
      !supabaseAnonKey ? 'SUPABASE_ANON_KEY (또는 VITE_SUPABASE_ANON_KEY)' : null,
    ]
      .filter(Boolean)
      .join(', ');

    throw new Error(
      `[Supabase] 환경변수가 누락되었습니다: ${missing}. ` +
        '프로젝트 루트 .env 또는 배포 환경 변수에 값을 설정하고 서버/빌드를 다시 시작하세요.'
    );
  }
}

export const supabase = isDevMockEnabled()
  ? createMockSupabaseClient()
  : createClient(supabaseUrl, supabaseAnonKey);
