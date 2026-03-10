/**
 * Notion API 프록시 호출 (Vercel Serverless 경유)
 * 로컬: vercel dev 사용 시 /api 동작
 * 콘솔에서 [Notion API] 로그로 연동 상태 확인
 */
const LOG_PREFIX = '[Notion API]';

async function fetchApi(path, label) {
  const url = `/api${path}`;
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
  return fetchApi('/notion-sections', 'Sections(구역)');
}

export async function fetchTasks() {
  return fetchApi('/notion-tasks', 'Tasks(할 일)');
}

export async function fetchPlants() {
  return fetchApi('/notion-plants', 'Plants(식물)');
}
