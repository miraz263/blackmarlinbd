import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GalleryImage { src: string; alt?: string; caption?: string; }

export function GalleryBlock({ content }: { content: Record<string, unknown> }) {
  const heading = content.heading as string | undefined;
  const images  = (content.images as GalleryImage[] | undefined) ?? [];
  const columns = (content.columns as number | undefined) ?? 3;
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const gridClass = columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3";

  return (
    <div>
      {heading && <h2 className="text-3xl font-bold text-center mb-10">{heading}</h2>}
      {images.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-2xl bg-muted border border-dashed border-border text-muted-foreground text-sm">
          No images added yet
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-4`}>
          {images.map((img, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              onClick={() => setLightbox(img)}
              className="group relative aspect-square rounded-xl overflow-hidden focus:outline-none"
            >
              <img src={img.src} alt={img.alt ?? ""} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs">{img.caption}</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={lightbox.src}
              alt={lightbox.alt ?? ""}
              className="max-w-full max-h-[90vh] rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
