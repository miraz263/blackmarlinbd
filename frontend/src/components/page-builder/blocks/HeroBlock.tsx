import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface HeroContent {
  title?: string;
  subtitle?: string;
  description?: string;
  cta_text?: string;
  cta_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  background_image?: string | null;
}

export function HeroBlock({ content }: { content: Record<string, unknown> }) {
  const c = content as HeroContent;
  const isExternal = (url: string) => url.startsWith("http");

  return (
    <section
      className="relative min-h-[70vh] flex items-center overflow-hidden"
      style={c.background_image ? { backgroundImage: `url(${c.background_image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {c.background_image && <div className="absolute inset-0 bg-background/70" />}
      <div className="relative container mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {c.subtitle && (
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-widest mb-4">{c.subtitle}</p>
          )}
          {c.title && (
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 gradient-text">{c.title}</h1>
          )}
          {c.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">{c.description}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {c.cta_text && c.cta_url && (
              isExternal(c.cta_url) ? (
                <a href={c.cta_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25">
                  {c.cta_text} <ArrowRight className="h-5 w-5" />
                </a>
              ) : (
                <Link to={c.cta_url}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25">
                  {c.cta_text} <ArrowRight className="h-5 w-5" />
                </Link>
              )
            )}
            {c.cta_secondary_text && c.cta_secondary_url && (
              <Link to={c.cta_secondary_url}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground font-semibold text-lg hover:bg-accent transition-colors">
                {c.cta_secondary_text}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
