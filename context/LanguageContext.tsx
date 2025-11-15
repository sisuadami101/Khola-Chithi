import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

// Basic type for nested JSON object
type Translations = {
  [key: string]: string | Translations;
};

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [translations, setTranslations] = useState<{ [key: string]: Translations } | null>(null);
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('lang');
    return (storedLang === 'bn' || storedLang === 'en') ? storedLang : 'bn';
  });

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const bnResponse = await fetch('/locales/bn.json');
        const bnData = await bnResponse.json();
        const enResponse = await fetch('/locales/en.json');
        const enData = await enResponse.json();
        setTranslations({ bn: bnData, en: enData });
      } catch (error) {
        console.error("Failed to load translations", error);
      }
    };
    loadTranslations();
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('lang', lang);
    setLanguageState(lang);
    document.documentElement.lang = lang;
  };
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    if (!translations) {
        return key; // Return key while loading
    }
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing in the current language
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        result = fallbackResult || key;
        break;
      }
    }

    let resultString = typeof result === 'string' ? result : key;

    if (options) {
        Object.keys(options).forEach(optKey => {
            resultString = resultString.replace(`{{${optKey}}}`, String(options[optKey]));
        });
    }

    return resultString;
  }, [language, translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
