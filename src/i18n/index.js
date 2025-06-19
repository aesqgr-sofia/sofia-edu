import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English translations
import enCommon from './resources/en/common.json';
import enNavigation from './resources/en/navigation.json';
import enModules from './resources/en/modules.json';
import enLearning from './resources/en/learning.json';

// Import Spanish translations
import esCommon from './resources/es/common.json';
import esNavigation from './resources/es/navigation.json';
import esModules from './resources/es/modules.json';
import esLearning from './resources/es/learning.json';

// Import Catalan translations
import caCommon from './resources/ca/common.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    modules: enModules,
    learning: enLearning,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    modules: esModules,
    learning: esLearning,
  },
  ca: {
    common: caCommon,
    navigation: esNavigation, // Fallback to Spanish for now
    modules: esModules, // Fallback to Spanish for now
    learning: esLearning, // Fallback to Spanish for now
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Default namespace
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n; 