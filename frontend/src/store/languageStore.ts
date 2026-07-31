import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SupportedLanguage = "en" | "bn" | "ar" | "fr" | "es" | "zh";
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
  zh: "ltr",
};

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "bn", "ar", "fr", "es", "zh"];

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
  } else {
    // Brand-new visitor, no saved preference yet — ask the backend to suggest
    // a language based on IP geolocation. Failure or "no suggestion" is fine;
    // this only ever runs once, before any explicit choice exists.
    import("@/services/translationsService").then(({ translationsService }) => {
      translationsService
        .getGeoLanguage()
        .then((res) => {
          const suggested = res.data?.language;
          if (
            suggested &&
            !localStorage.getItem("bmbd-language") &&
            (SUPPORTED_LANGUAGES as string[]).includes(suggested)
          ) {
            useLanguageStore.getState().setLanguage(suggested as SupportedLanguage);
          }
        })
        .catch(() => {
          // Offline, geo DB not present, or lookup failed — keep the default.
        });
    });
  }
}
