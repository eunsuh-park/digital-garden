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
        '프로젝트 루트 .env 또는 배포 환경 변수에 값을 설정하고 서버/빌드를 다시 시작하세요.',
    );
  }

  if (import.meta.env.DEV) {
    const k = supabaseAnonKey;
    if (k.startsWith('sbp_')) {
      console.warn(
        '[Supabase] SUPABASE_ANON_KEY 가 sbp_ 로 시작합니다. 이건 계정용 토큰이라 Auth에서 Invalid API key 가 납니다. ' +
          '같은 프로젝트의 anon(eyJ…) 또는 publishable(sb_publishable_…) 키를 Project Settings > API 에서 넣으세요.',
      );
    } else if (!k.startsWith('eyJ') && !k.startsWith('sb_publishable_')) {
      console.warn(
        '[Supabase] SUPABASE_ANON_KEY 형식이 일반적이지 않습니다. anon(eyJ…) 또는 publishable(sb_publishable_…) 인지 확인하세요.',
      );
    }
    const host = (() => {
      try {
        return new URL(supabaseUrl).hostname;
      } catch {
        return '';
      }
    })();
    if (host && !host.endsWith('.supabase.co')) {
      console.warn(
        `[Supabase] SUPABASE_URL 호스트가 ${host} 입니다. https://<ref>.supabase.co 형태인지 확인하세요.`,
      );
    }
  }
}

function createConfiguredClient() {
  return isDevMockEnabled()
    ? createMockSupabaseClient()
    : createClient(supabaseUrl, supabaseAnonKey);
}

// Vite HMR이 이 모듈을 다시 평가하면 createClient가 중복 호출되어 GoTrueClient 경고가 납니다.
// 개발 모드에서는 브라우저 전역에 한 번만 붙여 재사용합니다.
const SUPABASE_GLOBAL_KEY = '__digitalGardenSupabaseClient';

export const supabase = (() => {
  if (import.meta.env.DEV) {
    const g = globalThis;
    if (!g[SUPABASE_GLOBAL_KEY]) {
      g[SUPABASE_GLOBAL_KEY] = createConfiguredClient();
    }
    return g[SUPABASE_GLOBAL_KEY];
  }
  return createConfiguredClient();
})();
