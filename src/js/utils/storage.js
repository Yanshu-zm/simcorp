// ===== LocalStorage Utilities =====

const SAVE_KEY = 'simcorp_save';

export function saveGame(state) {
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, data);
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
