import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';
import hiTranslation from './locales/hi.json';
import teTranslation from './locales/te.json';
import esTranslation from './locales/es.json';

// Function to handle RTL/LTR direction changes
const setDocumentDirection = (language: string) => {
  const rtlLanguages = ['ar'];
  const direction = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      ar: {
        translation: arTranslation
      },
      hi: {
        translation: hiTranslation
      },
      te: {
        translation: teTranslation
      },
      es: {
        translation: esTranslation
      },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    detection: { 
      lookupLocalStorage: 'i18nextLng',
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Set initial document direction based on current language
setDocumentDirection(i18n.language);

// Listen for language changes and update document direction
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

export default i18n;