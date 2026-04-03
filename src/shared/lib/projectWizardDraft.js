/** @typedef {{ name: string, space: string, spaceDescription: string }} ProjectWizardDraft */

export const PROJECT_WIZARD_DRAFT_KEY = 'dg_project_wizard_v2';

const LEGACY_SPACE_MAP = { s: 'narrow', m: 'medium', l: 'wide' };

const MAX_NAME = 20;
const MAX_SPACE_DESC = 200;

/**
 * @returns {ProjectWizardDraft | null}
 */
export function loadProjectWizardDraft() {
  try {
    const raw = sessionStorage.getItem(PROJECT_WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    const rawSpace = typeof o.space === 'string' ? o.space : '';
    const space = LEGACY_SPACE_MAP[rawSpace] || rawSpace;
    const descRaw =
      typeof o.spaceDescription === 'string'
        ? o.spaceDescription
        : typeof o.description === 'string'
          ? o.description
          : '';
    return {
      name: (typeof o.name === 'string' ? o.name : '').slice(0, MAX_NAME),
      space,
      spaceDescription: descRaw.slice(0, MAX_SPACE_DESC),
    };
  } catch {
    return null;
  }
}

/** @param {ProjectWizardDraft} draft */
export function saveProjectWizardDraft(draft) {
  try {
    sessionStorage.setItem(
      PROJECT_WIZARD_DRAFT_KEY,
      JSON.stringify({
        name: draft.name.slice(0, MAX_NAME),
        space: draft.space,
        spaceDescription: draft.spaceDescription.slice(0, MAX_SPACE_DESC),
      })
    );
  } catch {
    /* ignore quota */
  }
}

export function clearProjectWizardDraft() {
  try {
    sessionStorage.removeItem(PROJECT_WIZARD_DRAFT_KEY);
    sessionStorage.removeItem('dg_project_wizard_v1');
  } catch {
    /* ignore */
  }
}
