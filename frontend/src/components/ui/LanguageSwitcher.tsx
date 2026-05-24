import { useLanguageStore, type SupportedLanguage } from "@/store/languageStore";

const LANGUAGES: { code: SupportedLanguage; flag: string; short: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", short: "EN",  label: "English" },
  { code: "bn", flag: "🇧🇩", short: "বাং", label: "বাংলা"   },
];

interface LanguageSwitcherProps {
  variant?: "flags" | "pills" | "dropdown";
  className?: string;
}

export function LanguageSwitcher({ variant = "pills", className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageStore();

  if (variant === "flags") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            title={l.label}
            className={`px-2 py-1 rounded-lg text-sm transition-all ${
              language === l.code
                ? "bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {l.flag} {l.short}
          </button>
        ))}
      </div>
    );
  }

  // pills (default)
  return (
    <div className={`flex items-center gap-1 p-1 bg-accent rounded-xl ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          title={l.label}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            language === l.code
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.flag} {l.short}
        </button>
      ))}
    </div>
  );
}
