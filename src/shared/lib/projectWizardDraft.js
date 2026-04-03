/** @typedef {{ name: string, space: string, purpose: string }} ProjectWizardDraft */

export const PROJECT_WIZARD_DRAFT_KEY = 'dg_project_wizard_v1';

/**
 * @returns {ProjectWizardDraft | null}
 */
export function loadProjectWizardDraft() {
  try {
    const raw = sessionStorage.getItem(PROJECT_WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    return {
      name: typeof o.name === 'string' ? o.name : '',
      space: typeof o.space === 'string' ? o.space : '',
      purpose: typeof o.purpose === 'string' ? o.purpose : '',
    };
  } catch {
    return null;
  }
}

/** @param {ProjectWizardDraft} draft */
export function saveProjectWizardDraft(draft) {
  try {
    sessionStorage.setItem(PROJECT_WIZARD_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota */
  }
}

export function clearProjectWizardDraft() {
  try {
    sessionStorage.removeItem(PROJECT_WIZARD_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
