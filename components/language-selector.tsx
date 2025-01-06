"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/language-context";
import { Language } from "@/lib/types";

const languageNames: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  ar: "العربية",
};

const languageFlags: Record<Language, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  ar: "🇸🇦",
};

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select
      value={language}
      onValueChange={(value: Language) => setLanguage(value)}
    >
      <SelectTrigger className="w-[140px] fixed top-4 right-4">
        <span className="flex items-center gap-2">
          {languageFlags[language]}
          <span>{languageNames[language]}</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languageNames).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              {languageFlags[code as Language]}
              <span>{name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
