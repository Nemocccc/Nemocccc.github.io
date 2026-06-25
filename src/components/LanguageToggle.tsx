"use client";

import { useTranslations } from "@/i18n/index";

export default function LanguageToggle() {
  const { lang, setLang } = useTranslations();

  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      className={`
        relative px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-300
        hover:bg-muted/80 active:scale-95
        text-muted-foreground hover:text-foreground
        border border-border/50
      `}
      aria-label={`Switch to ${lang === "zh" ? "English" : "中文"}`}
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}
