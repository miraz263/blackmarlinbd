import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
export type AccentColor = "indigo" | "pink" | "purple" | "green";

export const ACCENT_COLORS: AccentColor[] = ["indigo", "pink", "purple", "green"];

interface ThemeState {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (accentColor: AccentColor) => void;
}

// "indigo" is the default palette baked into :root — no class needed for it.
export function applyAccentColor(accentColor: AccentColor) {
  const root = window.document.documentElement;
  ACCENT_COLORS.forEach((color) => root.classList.remove(`theme-${color}`));
  if (accentColor !== "indigo") root.classList.add(`theme-${accentColor}`);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      accentColor: "indigo",
      setTheme: (theme) => {
        set({ theme });
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },
      setAccentColor: (accentColor) => {
        set({ accentColor });
        applyAccentColor(accentColor);
      },
    }),
    { name: "theme-storage" }
  )
);
