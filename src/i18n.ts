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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh',
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
