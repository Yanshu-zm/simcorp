// ===== i18n Utility =====
import { LOCALES } from '../data/locales.js';
import { FUNCTIONS_EN } from '../data/config.js';

let currentLang = localStorage.getItem('game-lang') || 'zh';

/**
 * Get translated text by key.
 * Supports template params: t('key', { name: 'abc' }) replaces {name} in the text.
 */
export function t(key, params = {}) {
  let text = LOCALES[currentLang]?.[key] || LOCALES['zh']?.[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

/** Get localized field from a data object: picks nameEn/descEn when lang is 'en' */
export function tData(obj, field) {
  if (currentLang === 'en') {
    const enField = field + 'En';
    if (obj[enField]) return obj[enField];
  }
  return obj[field];
}

/** Get localized event result message (supports { zh, en } objects) */
export function tResult(result) {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    return result[currentLang] || result.zh || '';
  }
  return String(result);
}

export function tCat(category) {
  if (currentLang === 'en' && FUNCTIONS_EN[category]) {
    return FUNCTIONS_EN[category];
  }
  return category;
}

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('game-lang', lang);
}

export function getLang() {
  return currentLang;
}
