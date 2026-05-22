export const LANGS = ['ca', 'en', 'es'];
export const LANG_LABELS = { ca: 'CA', en: 'EN', es: 'ES' };

let currentLang = 'ca';

export function getLang() { return currentLang; }
export function setLang(lang) { if (LANGS.includes(lang)) currentLang = lang; }
