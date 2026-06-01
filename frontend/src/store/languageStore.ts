import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SupportedLanguage = "en" | "bn" | "ar" | "fr" | "es";
export type TextDirection = "ltr" | "rtl";

interface LanguageState {
  language:  SupportedLanguage;
  direction: TextDirection;
  setLanguage: (lang: SupportedLanguage) => void;
}

const DIRECTION_MAP: Record<SupportedLanguage, TextDirection> = {
  en: "ltr",
  bn: "ltr",
  ar: "rtl",
  fr: "ltr",
  es: "ltr",
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language:  "en",
      direction: "ltr",

      setLanguage: (lang) => {
        const direction = DIRECTION_MAP[lang] ?? "ltr";
        set({ language: lang, direction });

        // Apply RTL / lang attribute to the document root
        const root = document.documentElement;
        root.setAttribute("dir", direction);
        root.setAttribute("lang", lang);

        // Invalidate all React Query caches so every page refetches with the new lang param.
        // Import is deferred to avoid circular deps at module-init time.
        import("@/lib/queryClient").then(({ queryClient }) => {
          queryClient.invalidateQueries();
        });
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
