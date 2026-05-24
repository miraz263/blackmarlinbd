import { BlockRenderer } from "./BlockRenderer";
import type { BuilderSection } from "@/types";

const PADDING: Record<string, string> = { sm: "py-8", md: "py-16", lg: "py-24", xl: "py-32" };
const MAX_W:   Record<string, string> = {
  sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-none",
};

export function SectionRenderer({ section }: { section: BuilderSection }) {
  const s   = section.style_json as Record<string, string>;
  const pad = PADDING[s?.padding ?? "md"]   ?? "py-16";
  const mw  = MAX_W[s?.max_width ?? "xl"]   ?? "max-w-7xl";

  const inlineStyle: React.CSSProperties = {};
  if (s?.background_color) inlineStyle.backgroundColor = s.background_color;
  if (s?.background_image) {
    inlineStyle.backgroundImage    = `url(${s.background_image})`;
    inlineStyle.backgroundSize     = "cover";
    inlineStyle.backgroundPosition = "center";
  }
  if (s?.text_color) inlineStyle.color = s.text_color;

  const publishedBlocks = section.blocks
    .filter((b) => b.is_published)
    .sort((a, b) => a.order - b.order);

  return (
    <section style={inlineStyle} className={pad}>
      <div className={`container mx-auto px-4 ${mw} space-y-12`}>
        {publishedBlocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
}
