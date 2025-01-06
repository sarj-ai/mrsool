"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/language-context";
import { Language } from "@/lib/types";
import { Globe } from "lucide-react";

const languageNames: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  ar: "العربية",
};

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select
      value={language}
      onValueChange={(value: Language) => setLanguage(value)}
    >
      <SelectTrigger className="w-[140px] fixed top-4 right-4">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{languageNames.en}</SelectItem>
        <SelectItem value="de">{languageNames.de}</SelectItem>
        <SelectItem value="ar">{languageNames.ar}</SelectItem>
      </SelectContent>
    </Select>
  );
}
