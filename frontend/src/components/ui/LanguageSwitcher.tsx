import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguageStore, type SupportedLanguage } from "@/store/languageStore";

const LANGUAGES: { code: SupportedLanguage; flag: string; short: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", short: "EN",  label: "English"    },
  { code: "bn", flag: "🇧🇩", short: "বাং", label: "বাংলা"      },
  { code: "ar", flag: "🇸🇦", short: "AR",  label: "العربية"    },
  { code: "fr", flag: "🇫🇷", short: "FR",  label: "Français"   },
  { code: "es", flag: "🇪🇸", short: "ES",  label: "Español"    },
  { code: "zh", flag: "🇨🇳", short: "中文", label: "中文"        },
];

interface LanguageSwitcherProps {
  variant?: "flags" | "pills";
  className?: string;
}

export function LanguageSwitcher({ variant = "pills", className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Desktop: compact dropdown trigger + popover list
  if (variant === "flags") {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Select language"
        >
          <span>{current.flag}</span>
          <span>{current.short}</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-popover border border-border shadow-xl shadow-black/10 z-50 overflow-hidden py-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  language === l.code
                    ? "bg-brand-500/10 text-brand-400 font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
                {language === l.code && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mobile: wrapped pill grid
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          title={l.label}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            language === l.code
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.flag} {l.short}
        </button>
      ))}
    </div>
  );
}
