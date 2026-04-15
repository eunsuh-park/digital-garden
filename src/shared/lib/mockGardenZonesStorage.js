const PREFIX = 'dg:mockGardenZones:v1:';

export function mockGardenZonesKey(projectId) {
  return `${PREFIX}${projectId}`;
}

/** @param {string|number} projectId */
export function loadMockGardenZones(projectId) {
  if (projectId == null || projectId === '') return [];
  try {
    const raw = sessionStorage.getItem(mockGardenZonesKey(projectId));
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** @param {string|number} projectId @param {object[]} zones */
export function saveMockGardenZones(projectId, zones) {
  if (projectId == null || projectId === '') return;
  try {
    sessionStorage.setItem(mockGardenZonesKey(projectId), JSON.stringify(zones));
  } catch {
    /* quota */
  }
}
