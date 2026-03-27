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
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : null;

    // 정적 호스팅에서 /api 요청이 index.html(200)로 떨어지는 케이스를 조기에 감지
    if (!isJson || data == null) {
      const hint = apiOrigin
        ? 'API 응답 형식이 올바르지 않습니다.'
        : '정적 호스팅에서는 /api가 동작하지 않습니다. `VITE_API_ORIGIN`을 Vercel 도메인으로 설정하세요.';
      throw new Error(`${hint} (${label || path})`);
    }
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

async function mutateApi(path, label, options = {}) {
  const apiOrigin = import.meta.env.VITE_API_ORIGIN;
  const url = joinUrl(apiOrigin, `/api${path}`);
  console.log(`${LOG_PREFIX} 요청: ${label || path} → ${url}`);

  try {
    const res = await fetch(url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    });

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
      console.warn(`${LOG_PREFIX} 실패: ${label || path}`, res.status, data);
      throw new Error(data.error || `API error: ${res.status}`);
    }

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

/**
 * Locations DB: 안전 필드만 업데이트(Name/Description)
 * - relation(color/svg_id 등)은 update payload에서 제외
 */
export async function updateLocation(id, updates) {
  return mutateApi('/notion-locations-update', 'Locations(구역) update', {
    method: 'POST',
    body: { id, ...updates },
  });
}

/**
 * Locations DB: 새 구역 생성 (Name, Description, Color)
 */
export async function createLocation(payload) {
  return mutateApi('/notion-locations-create', 'Locations create', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Locations DB: 구역 삭제(archive)
 */
export async function deleteLocation(id) {
  return mutateApi('/notion-locations-delete', 'Locations delete', {
    method: 'POST',
    body: { id },
  });
}

/**
 * Tasks DB: 안전 필드로 새 할 일 생성
 * - Title, Notes, Task_Type, Difficulty
 * - Estimated_Duration, Scheduled_Date
 * - Target_Plant, Target_Location, Status(시작 전)
 */
export async function createTask(payload) {
  return mutateApi('/notion-tasks-create', 'Tasks create', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Tasks DB: 할 일 업데이트
 */
export async function updateTask(id, updates) {
  return mutateApi('/notion-tasks-update', 'Tasks update', {
    method: 'POST',
    body: { id, ...updates },
  });
}

/**
 * Tasks DB: 할 일 삭제(archive)
 */
export async function deleteTask(id) {
  return mutateApi('/notion-tasks-delete', 'Tasks delete', {
    method: 'POST',
    body: { id },
  });
}

/**
 * Plants DB: 새 식물 생성
 */
export async function createPlant(payload) {
  return mutateApi('/notion-plants-create', 'Plants create', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Plants DB: 식물 업데이트
 */
export async function updatePlant(id, updates) {
  return mutateApi('/notion-plants-update', 'Plants update', {
    method: 'POST',
    body: { id, ...updates },
  });
}

/**
 * Plants DB: 식물 삭제(archive)
 */
export async function deletePlant(id) {
  return mutateApi('/notion-plants-delete', 'Plants delete', {
    method: 'POST',
    body: { id },
  });
}
