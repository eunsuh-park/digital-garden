/**
 * Notion API 프록시 호출 (Vercel Serverless 경유)
 * 로컬: vercel dev 사용 시 /api 동작
 * 콘솔에서 [Notion API] 로그로 연동 상태 확인
 */
const LOG_PREFIX = '[Notion API]';

function joinUrl(origin, path) {
  const o = (origin || '').replace(/\/+$/, '');
  const p = (path || '').startsWith('/') ? path : `/${path || ''}`;
  return o ? `${o}${p}` : p;
}

async function fetchApi(path, label) {
  // For GitHub Pages 등 정적 호스팅: VITE_API_ORIGIN을 Vercel 도메인으로 설정하면 됩니다.
  // 예) VITE_API_ORIGIN=https://<project>.vercel.app
  const apiOrigin = import.meta.env.VITE_API_ORIGIN;
  const url = joinUrl(apiOrigin, `/api${path}`);
  console.log(`${LOG_PREFIX} 요청: ${label || path} → ${url}`);
  try {
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn(`${LOG_PREFIX} 실패: ${label || path}`, res.status, data);
      throw new Error(data.error || `API error: ${res.status}`);
    }
    const count = data.results?.length ?? '?';
    console.log(`${LOG_PREFIX} 성공: ${label || path} (${count}건)`);
    return data;
  } catch (e) {
    console.error(`${LOG_PREFIX} 오류: ${label || path}`, e.message);
    throw e;
  }
}

export async function fetchSections() {
  return fetchLocations();
}

export async function fetchLocations() {
  return fetchApi('/notion-locations', 'Locations(구역)');
}

export async function fetchTasks() {
  return fetchApi('/notion-tasks', 'Tasks(할 일)');
}

export async function fetchPlants() {
  return fetchApi('/notion-plants', 'Plants(식물)');
}
