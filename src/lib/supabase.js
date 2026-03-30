import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
  ]
    .filter(Boolean)
    .join(', ');

  throw new Error(
    `[Supabase] 환경변수가 누락되었습니다: ${missing}. ` +
      '프로젝트 루트 .env 또는 배포 환경 변수에 값을 설정하고 서버/빌드를 다시 시작하세요.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
