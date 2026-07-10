import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";

import { Language, Translations, translations } from "@/constants/i18n";

interface LanguageContextType {
  language: Language;
  t: Translations;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  t: translations.en,
  isRTL: false,
  setLanguage: () => {},
  toggleLanguage: () => {},
});

const STORAGE_KEY = "@sierra_estates_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === "en" || val === "ar") {
        setLangState(val);
      }
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "ar" : "en");
  }, [language, setLanguage]);

  const isRTL = language === "ar";
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, isRTL, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
