import { motion } from "framer-motion";
import { useHomepageQuery } from "@/hooks/useHomepageQuery";

export function Partners() {
  const { data } = useHomepageQuery();

  const section = data?.sections?.partners;
  const partners = data?.partners ?? [];

  if ((section && !section.is_visible) || partners.length === 0) return null;

  const heading = section?.title ?? "Trusted By";

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-muted-foreground mb-10 uppercase tracking-widest"
        >
          {heading}
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-12 w-max"
          >
            {[...partners, ...partners].map((partner, i) => {
              const inner = partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-8 max-w-[120px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  {partner.name}
                </span>
              );

              return partner.url ? (
                <a
                  key={i}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  {inner}
                </a>
              ) : (
                <div key={i} className="flex items-center">
                  {inner}
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
