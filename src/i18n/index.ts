import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';


// Import translations directly
import enUSTranslation from '../locales/en-US/translation.json';
import enUKTranslation from '../locales/en-UK/translation.json';
import swTranslation from '../locales/sw/translation.json';
import frTranslation from '../locales/fr/translation.json';
import deTranslation from '../locales/de/translation.json';
import zhTranslation from '../locales/zh/translation.json';
import esTranslation from '../locales/es/translation.json';
import ptTranslation from '../locales/pt/translation.json';
import arTranslation from '../locales/ar/translation.json';
import heTranslation from '../locales/he/translation.json';
import elTranslation from '../locales/el/translation.json';

// Resources object with all 12 languages
const resources = {
  'en-US': { translation: enUSTranslation },
  'en-UK': { translation: enUKTranslation },
  'sw': { translation: swTranslation },
  'fr': { translation: frTranslation },
  'de': { translation: deTranslation },
  'zh': { translation: zhTranslation },
  'es': { translation: esTranslation },
  'pt': { translation: ptTranslation },
  'ar': { translation: arTranslation },
  'he': { translation: heTranslation },
  'el': { translation: elTranslation },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      checkWhitelist: true,
    },
    
    whitelist: ['en-US', 'en-UK', 'sw', 'fr', 'de', 'zh', 'es', 'pt', 'ar', 'he', 'el'],
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;