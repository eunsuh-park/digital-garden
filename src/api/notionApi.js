/**
 * Notion API 프록시 호출 (Vercel Serverless 경유)
 * 로컬: vercel dev 사용 시 /api 동작
 */
async function fetchApi(path) {
  const url = `/api${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchSections() {
  return fetchApi('/notion-sections');
}

export async function fetchTasks() {
  return fetchApi('/notion-tasks');
}

export async function fetchPlants() {
  return fetchApi('/notion-plants');
}
