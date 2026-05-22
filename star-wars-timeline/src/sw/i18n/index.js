export { LANGS, LANG_LABELS, getLang, setLang } from '../../shared/i18n-state.js';
import { getLang } from '../../shared/i18n-state.js';
import ca from './ca.js';
import en from './en.js';
import es from './es.js';

const translations = { ca, en, es };

export function t(key) {
  const lang = translations[getLang()] || translations.ca;
  return key.split('.').reduce((obj, k) => obj?.[k], lang) ?? key;
}
