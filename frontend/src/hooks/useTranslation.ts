import { useLanguageStore } from "@/store/languageStore";
import en from "@/i18n/en.json";
import bn from "@/i18n/bn.json";

type TranslationMap = Record<string, string>;
const STRINGS: Record<string, TranslationMap> = { en, bn };

export function useTranslation() {
  const { language, direction } = useLanguageStore();

  /**
   * Translate a key. Falls back to English, then to the key itself.
   * Supports simple interpolation: t("hello.user", { name: "Alice" }) with "Hello, {{name}}!"
   */
  const t = (key: string, vars?: Record<string, string | number>): string => {
    let value =
      STRINGS[language]?.[key] ??
      STRINGS["en"]?.[key] ??
      key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
      });
    }

    return value;
  };

  /** True when the current language direction is right-to-left. */
  const isRTL = direction === "rtl";

  return { t, language, direction, isRTL };
}
