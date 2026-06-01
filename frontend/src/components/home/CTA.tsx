import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useHomepageQuery } from "@/hooks/useHomepageQuery";

export function CTA() {
  const { data } = useHomepageQuery();
  const { t } = useTranslation();

  const section = data?.sections?.cta;

  if (section && !section.is_visible) return null;

  const EN_TITLE = "Ready to Build Something Extraordinary?";
  const EN_DESC  = "Join 50+ global enterprises that trust BlackMarlinBD to engineer their most critical technology infrastructure.";
  const EN_TEXT  = "Start Your Project";

  const title       = section?.title       && section.title       !== EN_TITLE ? section.title       : t("cta.title");
  const description = section?.description && section.description !== EN_DESC  ? section.description : t("cta.description");
  const ctaText     = section?.cta_text    && section.cta_text    !== EN_TEXT  ? section.cta_text    : t("cta.primary_text");
  const ctaLink     = section?.cta_link ?? "/contact";

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-500" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.3, 1, 1.3], x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 text-center text-white relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ctaLink}>
              <Button
                size="xl"
                className="bg-white text-brand-600 hover:bg-white/90 shadow-2xl shadow-black/20 group"
              >
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-200 text-base font-semibold">
              <Calendar className="h-5 w-5" />
              {t("cta.schedule_call")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
