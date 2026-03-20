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

// 支持的语言代码映射（处理地区代码如 zh-CN -> zh）
const supportedLanguages = ['zh', 'en', 'ja', 'es', 'ar', 'fr', 'it', 'id', 'ms', 'pt', 'ru', 'de', 'lo', 'ko', 'vi'];

function getLanguageFromNavigator(): string {
  // 获取浏览器语言
  const navLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage;
  if (!navLang) return 'zh';

  // 提取语言代码（去掉地区部分，如 "zh-CN" -> "zh"）
  const langCode = navLang.split('-')[0].split('_')[0].toLowerCase();

  // 如果支持该语言，直接返回
  if (supportedLanguages.includes(langCode)) {
    return langCode;
  }

  // 默认返回中文
  return 'zh';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguageFromNavigator(), // 使用系统语言
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
