/**
 * ProjectMapBuilder draft storage helpers.
 * Used by ProjectMapBuilderPage, ProjectSetupPage, and ProjectStep3Page to persist builder state.
 */

const DRAFT_PREFIX = 'dg:mapBuilderDraft:v1:';

export function projectMapBuilderDraftKey(projectId) {
  return `${DRAFT_PREFIX}${projectId}`;
}

/**
 * @param {string|number} projectId
 * @param {object} payload — JSON-serializable (맵 빌더 스냅샷)
 */
export function saveProjectMapBuilderDraft(projectId, payload) {
  if (projectId == null || projectId === '') return;
  try {
    const data = { v: 1, savedAt: Date.now(), ...payload };
    localStorage.setItem(projectMapBuilderDraftKey(projectId), JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

export function loadProjectMapBuilderDraft(projectId) {
  if (projectId == null || projectId === '') return null;
  try {
    const raw = localStorage.getItem(projectMapBuilderDraftKey(projectId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearProjectMapBuilderDraft(projectId) {
  if (projectId == null || projectId === '') return;
  try {
    localStorage.removeItem(projectMapBuilderDraftKey(projectId));
  } catch {
    /* ignore */
  }
}

/** 크기를 알 수 없을 때 맵 빌더 스테이지 DOM에서 읽기 */
export function readMapBuilderStageSize() {
  if (typeof document === 'undefined') return { w: 1000, h: 700 };
  const el = document.querySelector('.map-builder-canvas__stage');
  const w = el?.offsetWidth;
  const h = el?.offsetHeight;
  if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
    return { w, h };
  }
  return { w: 1000, h: 700 };
}
