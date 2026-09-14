"use client";
import { useCallback, useEffect, useState } from "react";

export type Lang = "en" | "fi";

const STORAGE_KEY = "gryps-lang";

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "fi" || stored === "en") return stored;
  } catch {
    /* private mode / blocked storage */
  }
  return "en";
}

/** Persist EN/FI across refresh and routes — same pattern as theme. */
export function useLang(defaultLang: Lang = "en"): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(defaultLang);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLangState(readStoredLang());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === "fi" ? "fi" : "en";
  }, [lang, hydrated]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  return [lang, setLang];
}
