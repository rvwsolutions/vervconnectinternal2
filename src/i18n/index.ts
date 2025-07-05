import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';
import hiTranslation from './locales/hi.json';
import teTranslation from './locales/te.json';
import esTranslation from './locales/es.json';
import esTranslation from './locales/es.json';

// Function to handle RTL/LTR direction changes
const setDocumentDirection = (language: string) => {
  const rtlLanguages = ['ar'];
  const direction = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
  
  // Load appropriate font based on language
  const fontFamilies = {
    ar: "'Noto Sans Arabic', sans-serif",
    hi: "'Noto Sans Devanagari', sans-serif",
    te: "'Noto Sans Telugu', sans-serif",
    default: "'Noto Sans', sans-serif"
  };
  
  document.documentElement.style.setProperty(
    '--font-family-base', 
    fontFamilies[language as keyof typeof fontFamilies] || fontFamilies.default
  );
  
  // Load appropriate font based on language
  const fontFamilies = {
    ar: "'Noto Sans Arabic', sans-serif",
    hi: "'Noto Sans Devanagari', sans-serif",
    te: "'Noto Sans Telugu', sans-serif",
    default: "'Noto Sans', sans-serif"
  };
  
  document.documentElement.style.setProperty(
    '--font-family-base', 
    fontFamilies[language as keyof typeof fontFamilies] || fontFamilies.default
  );
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
      es: {
        translation: esTranslation
      }
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
  
  // Force reload after a short delay to ensure all RTL/LTR changes are applied
  // This helps with complex layout changes that might not update properly otherwise
  setTimeout(() => {
    // Only reload if the language change requires it (e.g., switching between RTL and LTR)
    const rtlLanguages = ['ar'];
    const currentDir = document.documentElement.dir;
    const newDir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';

    if (currentDir !== newDir) {
      // Store a flag to prevent infinite reload loops
      const lastReload = localStorage.getItem('lastLanguageReload');
      const now = Date.now();
      
      if (!lastReload || now - parseInt(lastReload) > 5000) {
        localStorage.setItem('lastLanguageReload', now.toString());
        window.location.reload();
      }
    }
  }, 500);
});

export default i18n;