import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

// Import language files
import enTranslations from '../locales/en.json';
import viTranslations from '../locales/vi.json';

interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string) => string;
  isLoading: boolean;
}

const defaultLanguage: Language = {
  code: 'vi',
  name: 'Vietnamese'
};

const translations = {
  en: enTranslations,
  vi: viTranslations
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Load language from backend on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const response = await settingsAPI.getLanguage();
        // Ensure the language object has the required properties
        if (response && response.language && response.language.code) {
          setLanguageState(response.language);
        } else {
          console.warn('Invalid language data received, using default');
          setLanguageState(defaultLanguage);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
        // Keep default language if loading fails
        setLanguageState(defaultLanguage);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Update language in backend and local state
  const setLanguage = async (newLanguage: Language) => {
    try {
      await settingsAPI.updateLanguage(newLanguage);
      setLanguageState(newLanguage);
      toast.success(t('toast.languageUpdated'));
    } catch (error) {
      console.error('Failed to update language:', error);
      toast.error(t('toast.failedToUpdateLanguage'));
      throw error;
    }
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language.code as keyof typeof translations] || translations.vi;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Vietnamese if key not found
        value = translations.vi;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if translation not found
          }
        }
        return value;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
