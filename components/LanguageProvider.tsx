"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultLanguage,
  getTranslation,
  type LanguageCode,
  type TranslationKey,
} from "../lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === "fr" || value === "ln" || value === "sw" || value === "en" || value === "es";
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);

  useEffect(() => {
    const saved = localStorage.getItem("rb-language");
    const nextLanguage = isLanguageCode(saved) ? saved : defaultLanguage;

    setLanguageState(nextLanguage);
    document.documentElement.lang = nextLanguage === "ln" ? "ln" : nextLanguage;
    document.documentElement.dataset.lang = nextLanguage;
  }, []);

  function setLanguage(nextLanguage: LanguageCode) {
    setLanguageState(nextLanguage);
    localStorage.setItem("rb-language", nextLanguage);
    document.documentElement.lang = nextLanguage === "ln" ? "ln" : nextLanguage;
    document.documentElement.dataset.lang = nextLanguage;
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => getTranslation(language, key),
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
