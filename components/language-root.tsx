"use client";

import { useLanguage } from "@/lib/language-context";

export function LanguageRoot({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  return (
    <html
      lang={language}
      className="dark"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {children}
    </html>
  );
}
