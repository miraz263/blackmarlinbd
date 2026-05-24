import { motion } from "framer-motion";

export function ImageBlock({ content }: { content: Record<string, unknown> }) {
  const src       = content.src as string | undefined;
  const alt       = (content.alt as string | undefined) ?? "";
  const caption   = content.caption as string | undefined;
  const fullWidth = content.full_width as boolean | undefined;

  if (!src) {
    return (
      <div className="flex items-center justify-center h-48 rounded-2xl bg-muted border border-dashed border-border text-muted-foreground text-sm">
        No image URL set
      </div>
    );
  }

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
      className={fullWidth ? "w-full" : "max-w-3xl mx-auto"}
    >
      <img
        src={src}
        alt={alt}
        className="w-full rounded-2xl object-cover shadow-xl"
      />
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">{caption}</figcaption>
      )}
    </motion.figure>
  );
}
