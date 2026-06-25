"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import zh from "./zh.json";
import en from "./en.json";

type Lang = "zh" | "en";
type Messages = Record<string, any>;

const messages: Record<Lang, Messages> = { zh, en };

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path;
    current = current[key];
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");

  const t = useCallback(
    (path: string): string => {
      return getNestedValue(messages[lang], path);
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslations must be used within I18nProvider");
  return ctx;
}
