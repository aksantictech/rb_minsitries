"use client";

import { Globe2 } from "lucide-react";
import { languages, type LanguageCode } from "../lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="language-switcher" aria-label={t("language")}>
      <Globe2 size={17} />
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.short}
          </option>
        ))}
      </select>
    </label>
  );
}
