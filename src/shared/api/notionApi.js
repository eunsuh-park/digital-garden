/**
 * Notion API 프록시 호출 (로컬: Vite → /api 프록시, 배포: VITE_API_ORIGIN)
 * 개발 시 콘솔에 [Notion API] 요청·응답 요약이 출력됩니다.
 */
const LOG_PREFIX = '[Notion API]';

function joinUrl(origin, path) {
  const o = (origin || '').replace(/\/+$/, '');
  const p = (path || '').startsWith('/') ? path : `/${path || ''}`;
  return o ? `${o}${p}` : p;
}

/**
 * @param {string} path '/notion-zones' 등 (앞 /api 제외)
 * @param {string} label 로그용 라벨
 * @param {RequestInit} [init]
 */
async function apiFetch(path, label, init = {}) {
  const apiOrigin = import.meta.env.VITE_API_ORIGIN;
  const url = joinUrl(apiOrigin, `/api${path}`);
  const method = (init.method || 'GET').toUpperCase();
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;

  if (import.meta.env.DEV) {
    console.info(`${LOG_PREFIX} ${method} ${label || path} → ${url}`);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    const hint =
      e instanceof TypeError
        ? '네트워크 오류(연결 실패). 로컬에서는 `npm run dev`로 웹+API를 같이 띄우거나 `npm run dev:api`로 8787 포트를 확인하세요.'
        : e.message;
    console.error(`${LOG_PREFIX} 요청 실패: ${label || path}`, e);
    throw new Error(`${hint} (${label || path})`);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!isJson || data == null) {
    const hint = apiOrigin
      ? 'API 응답 형식이 올바르지 않습니다.'
      : '정적 호스팅에서는 /api가 동작하지 않습니다. `VITE_API_ORIGIN`을 Vercel 도메인으로 설정하세요.';
    throw new Error(`${hint} (${label || path})`);
  }

  if (!res.ok) {
    const errMsg = data.error || data.message || `HTTP ${res.status}`;
    console.warn(`${LOG_PREFIX} HTTP ${res.status}: ${label || path}`, data);
    throw new Error(`${errMsg} (${label || path})`);
  }

  if (import.meta.env.DEV) {
    const ms = Math.round(performance.now() - t0);
    const n = data.results?.length;
    const extra = n != null ? `, ${n}건` : '';
    console.info(`${LOG_PREFIX} OK ${res.status} ${label || path} (${ms}ms${extra})`);
  }

  return data;
}

async function fetchApi(path, label) {
  return apiFetch(path, label, { method: 'GET' });
}

async function mutateApi(path, label, options = {}) {
  return apiFetch(path, label, {
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });
}

export async function fetchSections() {
  return fetchZones();
}

export async function fetchZones() {
  return fetchApi('/notion-zones', 'Zones(구역, Notion Locations)');
}

export async function fetchTasks() {
  return fetchApi('/notion-tasks', 'Tasks(할 일)');
}

export async function fetchPlants() {
  return fetchApi('/notion-plants', 'Plants(식물)');
}

/**
 * Zone(Notion Locations): Name/Description만 업데이트
 */
export async function updateZone(id, updates) {
  return mutateApi('/notion-zones', 'Zones update', {
    method: 'POST',
    body: { action: 'update', id, ...updates },
  });
}

export async function createZone(payload) {
  return mutateApi('/notion-zones', 'Zones create', {
    method: 'POST',
    body: { action: 'create', ...payload },
  });
}

export async function deleteZone(id) {
  return mutateApi('/notion-zones', 'Zones delete', {
    method: 'POST',
    body: { action: 'delete', id },
  });
}

/**
 * Tasks DB: 안전 필드로 새 할 일 생성
 * - Title, Notes, Task_Type, Difficulty
 * - Estimated_Duration, Scheduled_Date
 * - Target_Plant, Target_Location, Status(시작 전)
 */
export async function createTask(payload) {
  return mutateApi('/notion-tasks', 'Tasks create', {
    method: 'POST',
    body: { action: 'create', ...payload },
  });
}

/**
 * Tasks DB: 할 일 업데이트
 */
export async function updateTask(id, updates) {
  return mutateApi('/notion-tasks', 'Tasks update', {
    method: 'POST',
    body: { action: 'update', id, ...updates },
  });
}

/**
 * Tasks DB: 할 일 삭제(archive)
 */
export async function deleteTask(id) {
  return mutateApi('/notion-tasks', 'Tasks delete', {
    method: 'POST',
    body: { action: 'delete', id },
  });
}

/**
 * Plants DB: 새 식물 생성
 */
export async function createPlant(payload) {
  return mutateApi('/notion-plants', 'Plants create', {
    method: 'POST',
    body: { action: 'create', ...payload },
  });
}

/**
 * Plants DB: 식물 업데이트
 */
export async function updatePlant(id, updates) {
  return mutateApi('/notion-plants', 'Plants update', {
    method: 'POST',
    body: { action: 'update', id, ...updates },
  });
}

/**
 * Plants DB: 식물 삭제(archive)
 */
export async function deletePlant(id) {
  return mutateApi('/notion-plants', 'Plants delete', {
    method: 'POST',
    body: { action: 'delete', id },
  });
}
