import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import lo from './locales/lo.json';
import ko from './locales/ko.json';
import vi from './locales/vi.json';

const resources = {
  zh: { translation: zh },
  en: { translation: en },
  ja: { translation: ja },
  es: { translation: es },
  ar: { translation: ar },
  fr: { translation: fr },
  it: { translation: it },
  id: { translation: id },
  ms: { translation: ms },
  pt: { translation: pt },
  ru: { translation: ru },
  de: { translation: de },
  lo: { translation: lo },
  ko: { translation: ko },
  vi: { translation: vi },
};

// 支持的语言代码映射
const supportedLanguages = ['zh', 'en', 'ja', 'es', 'ar', 'fr', 'it', 'id', 'ms', 'pt', 'ru', 'de', 'lo', 'ko', 'vi'];

// 从 localStorage 读取保存的语言，避免 hydration 不匹配
function getInitialLanguage(): string {
  // 1. 先尝试 localStorage
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && supportedLanguages.includes(stored)) {
      return stored;
    }
  } catch {}
  
  // 2. 从浏览器语言推断
  try {
    const navLang = navigator.language || '';
    const langCode = navLang.split('-')[0].split('_')[0].toLowerCase();
    if (supportedLanguages.includes(langCode)) {
      return langCode;
    }
  } catch {}

  // 3. 默认中文
  return 'zh';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(), // 同步获取初始语言，防止 hydration 不匹配
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
