import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check, X } from 'lucide-react';

interface LanguageSettingsProps {
  onClose?: () => void;
}

export function LanguageSettings({ onClose }: LanguageSettingsProps) {
  const { t, i18n } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const currentLanguage = i18n.language;
  
  const languages = [
    { code: 'en', name: t('settings.english'), nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: t('settings.arabic'), nativeName: 'العربية', flag: '🇸🇦', rtl: true }
  ];
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode).then(() => {
      // Update document direction for RTL languages
      const isRtl = languageCode === 'ar';
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Close modal if provided
      if (onClose) {
        setTimeout(onClose, 1000);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4 relative">
        {/* Success notification */}
        {showSuccess && (
          <div className="absolute top-4 right-4 left-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-2" />
              <span>{t('settings.languageChanged')}</span>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Languages className="w-6 h-6 text-indigo-600 mr-2" />
            <h3 className="text-2xl font-bold text-gray-900">{t('settings.languageSettings')}</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.selectLanguage')}
          </label>
        </div>

        <div className="space-y-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                currentLanguage === language.code
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{language.flag}</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{language.nativeName}</p>
                  <p className="text-sm text-gray-500">{language.name}</p>
                </div>
              </div>
              {currentLanguage === language.code && (
                <div className="bg-indigo-500 text-white p-1 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}