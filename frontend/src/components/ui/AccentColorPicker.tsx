import { Check } from "lucide-react";
import { useThemeStore, ACCENT_COLORS, type AccentColor } from "@/store/themeStore";

// Swatch previews only — the actual site-wide colors come from the
// --brand-* CSS variables in index.css (see .theme-pink/.theme-purple/.theme-green).
const SWATCHES: Record<AccentColor, string> = {
  indigo: "#6366f1",
  pink:   "#ec4899",
  purple: "#a855f7",
  green:  "#22c55e",
};

interface AccentColorPickerProps {
  className?: string;
}

export function AccentColorPicker({ className = "" }: AccentColorPickerProps) {
  const { accentColor, setAccentColor } = useThemeStore();

  return (
    <div className={`flex items-center gap-1.5 ${className}`} role="group" aria-label="Accent color">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => setAccentColor(color)}
          title={color}
          aria-label={`${color} accent color`}
          aria-pressed={accentColor === color}
          className="relative w-5 h-5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/15 transition-transform hover:scale-110"
          style={{ backgroundColor: SWATCHES[color] }}
        >
          {accentColor === color && (
            <Check className="absolute inset-0 m-auto h-3 w-3 text-white" strokeWidth={3} />
          )}
        </button>
      ))}
    </div>
  );
}
