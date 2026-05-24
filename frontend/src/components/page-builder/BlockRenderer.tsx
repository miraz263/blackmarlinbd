import type { BuilderBlock } from "@/types";
import { HeroBlock }     from "./blocks/HeroBlock";
import { TextBlock }     from "./blocks/TextBlock";
import { ImageBlock }    from "./blocks/ImageBlock";
import { VideoBlock }    from "./blocks/VideoBlock";
import { FAQBlock }      from "./blocks/FAQBlock";
import { GalleryBlock }  from "./blocks/GalleryBlock";
import { StatsBlock }    from "./blocks/StatsBlock";
import { TeamBlock }     from "./blocks/TeamBlock";
import { ServicesBlock } from "./blocks/ServicesBlock";

export function BlockRenderer({ block }: { block: BuilderBlock }) {
  const c = block.content_json;
  switch (block.block_type) {
    case "hero":     return <HeroBlock     content={c} />;
    case "text":     return <TextBlock     content={c} />;
    case "image":    return <ImageBlock    content={c} />;
    case "video":    return <VideoBlock    content={c} />;
    case "faq":      return <FAQBlock      content={c} />;
    case "gallery":  return <GalleryBlock  content={c} />;
    case "stats":    return <StatsBlock    content={c} />;
    case "team":     return <TeamBlock     content={c} />;
    case "services": return <ServicesBlock content={c} />;
    default:         return null;
  }
}
