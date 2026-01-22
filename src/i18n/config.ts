import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pt from './locales/pt.json';
import es from './locales/es.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      'pt-BR': { translation: pt },
      'pt-PT': { translation: pt },
      es: { translation: es },
      'es-ES': { translation: es },
      'es-MX': { translation: es },
      'es-AR': { translation: es },
      'es-CO': { translation: es },
      'es-CL': { translation: es },
      en: { translation: en },
      'en-US': { translation: en },
      'en-GB': { translation: en },
      'en-CA': { translation: en },
      'en-AU': { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs: ['pt', 'pt-BR', 'pt-PT', 'es', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL', 'en', 'en-US', 'en-GB', 'en-CA', 'en-AU'],
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
      cookieMinutes: 10080,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
