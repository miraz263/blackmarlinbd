import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SupportedLanguage = "en" | "bn";
export type TextDirection = "ltr" | "rtl";

interface LanguageState {
  language:  SupportedLanguage;
  direction: TextDirection;
  setLanguage: (lang: SupportedLanguage) => void;
}

const DIRECTION_MAP: Record<string, TextDirection> = {
  en: "ltr",
  bn: "ltr",
  ar: "rtl",
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language:  "en",
      direction: "ltr",

      setLanguage: (lang) => {
        const direction = DIRECTION_MAP[lang] ?? "ltr";
        set({ language: lang, direction });

        // Apply RTL to the document root for Arabic-ready layout
        const root = document.documentElement;
        root.setAttribute("dir", direction);
        root.setAttribute("lang", lang);
      },
    }),
    { name: "bmbd-language" }
  )
);

// Apply persisted direction on initial load (before React renders)
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("bmbd-language");
  if (stored) {
    try {
      const { state } = JSON.parse(stored) as { state: { language: string; direction: string } };
      if (state?.language) {
        document.documentElement.setAttribute("dir",  state.direction ?? "ltr");
        document.documentElement.setAttribute("lang", state.language);
      }
    } catch {
      // ignore
    }
  }
}
