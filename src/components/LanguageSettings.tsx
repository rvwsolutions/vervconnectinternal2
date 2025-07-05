import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Check, 
  ChevronDown, 
  Languages, 
  Calendar, 
  Clock, 
  LayoutGrid, 
  Save,
  RefreshCw
} from 'lucide-react';

export function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [interfaceDirection, setInterfaceDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Update interface direction when language changes
  useEffect(() => {
    // Set interface direction based on current language
    const rtlLanguages = ['ar'];
    const direction = rtlLanguages.includes(selectedLanguage) ? 'rtl' : 'ltr';
    setInterfaceDirection(direction);
  }, [selectedLanguage]);

  const languages = [
    { code: 'en', name: t('admin.english'), flag: '🇺🇸' },
    { code: 'ar', name: t('admin.arabic'), flag: '🇦🇪' },
    { code: 'hi', name: t('admin.hindi'), flag: '🇮🇳' },
    { code: 'te', name: t('admin.telugu'), flag: '🇮🇳' },
    { code: 'es', name: t('admin.spanish'), flag: '🇪🇸' }
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setSelectedLanguage(langCode);
    setShowLanguageDropdown(false);
    
    // Update interface direction based on language
    const rtlLanguages = ['ar'];
    const direction = rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
    setInterfaceDirection(direction);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const saveSettings = () => {
    // In a real app, this would save settings to a database or localStorage
    localStorage.setItem('dateFormat', dateFormat);
    localStorage.setItem('timeFormat', timeFormat);
    localStorage.setItem('i18nextLng', selectedLanguage);
    
    // Apply interface direction - this is now handled by i18n.on('languageChanged')
    // but we'll keep it here for manual changes
    document.documentElement.dir = interfaceDirection;
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      // Store current language in localStorage before reload
      localStorage.setItem('i18nextLng', selectedLanguage);
      
      // Set a flag to indicate we're changing language to prevent infinite reload
      localStorage.setItem('languageChangeInProgress', 'true');
      
      // Apply RTL/LTR direction immediately
      document.documentElement.dir = interfaceDirection;
      document.documentElement.lang = selectedLanguage;

      // Force reload to apply RTL/LTR changes properly
      const rtlLanguages = ['ar'];
      const currentDir = document.documentElement.dir;
      const newDir = rtlLanguages.includes(selectedLanguage) ? 'rtl' : 'ltr';
      
      // Only reload if direction is changing
      if (currentDir !== newDir) {
        // Reload the page after a short delay to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.languageSettings')}</h1>
          <p className="text-gray-600 mt-2">Customize language and localization preferences</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{t('admin.languageChanged')}</p>
          </div>
        </div>
      )}

      {/* Language Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Languages className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">{t('admin.selectLanguage')}</h2>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{languages.find(lang => lang.code === selectedLanguage)?.flag}</span>
              <span className="font-medium">{languages.find(lang => lang.code === selectedLanguage)?.name}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showLanguageDropdown ? 'transform rotate-180' : ''}`} />
          </button>

          {showLanguageDropdown && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 ${
                    selectedLanguage === language.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                  {selectedLanguage === language.code && (
                    <Check className="w-5 h-5 text-indigo-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.interfaceDirection')}</label>
            <div className="flex space-x-4">
              <label className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                interfaceDirection === 'ltr' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="direction"
                  checked={interfaceDirection === 'ltr'} 
                  onChange={() => {
                    setInterfaceDirection('ltr');
                    // If changing to LTR but language is RTL, switch to English
                    if (rtlLanguages.includes(selectedLanguage)) {
                      setSelectedLanguage('en');
                      i18n.changeLanguage('en');
                    }
                  }}
                  className="hidden"
                />
                <LayoutGrid className="w-5 h-5" />
                <span>{t('admin.ltr')}</span>
              </label>
              <label className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                interfaceDirection === 'rtl' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="direction"
                  checked={interfaceDirection === 'rtl'} 
                  onChange={() => {
                    setInterfaceDirection('rtl');
                    // If changing to RTL but language is not RTL, switch to Arabic
                    if (!rtlLanguages.includes(selectedLanguage)) {
                      setSelectedLanguage('ar');
                      i18n.changeLanguage('ar');
                    }
                  }}
                  className="hidden"
                />
                <LayoutGrid className="w-5 h-5 transform rotate-180" />
                <span>{t('admin.rtl')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.dateFormat')}</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.timeFormat')}</label>
            <div className="flex space-x-4">
              <label className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                timeFormat === '12h' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="timeFormat"
                  checked={timeFormat === '12h'}
                  onChange={() => setTimeFormat('12h')}
                  className="hidden"
                />
                <Clock className="w-5 h-5" />
                <span>12h (1:30 PM)</span>
              </label>
              <label className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                timeFormat === '24h' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="timeFormat"
                  checked={timeFormat === '24h'}
                  onChange={() => setTimeFormat('24h')}
                  className="hidden"
                />
                <Clock className="w-5 h-5" />
                <span>24h (13:30)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Language Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Advanced Language Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Default Language</h3>
            <p className="text-gray-600 mb-4">Set the default language for new users and guests</p>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.flag} {language.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Translation Management</h3>
            <p className="text-gray-600 mb-4">Manage custom translations and missing keys</p>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Sync Translations</span>
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>View Missing Keys</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{t('common.save')}</span>
        </button>
      </div>
    </div>
  );
}