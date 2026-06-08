import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart2, Heart, Brain, Building2, ArrowRight, type LucideIcon } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/data/productCatalog";
import { useTranslation } from "@/hooks/useTranslation";

interface SuiteConfig {
  categorySlug: string;
  nameKey: string;
  taglineKey: string;
  icon: LucideIcon;
  cardGradient: string;
  iconGradient: string;
}

const SUITE_CONFIGS: SuiteConfig[] = [
  {
    categorySlug: "fintech",
    nameKey: "suites.fintech_name",
    taglineKey: "suites.fintech_tagline",
    icon: BarChart2,
    cardGradient: "from-purple-500/10 to-brand-500/10",
    iconGradient: "from-purple-500 to-brand-500",
  },
  {
    categorySlug: "healthcare",
    nameKey: "suites.healthcare_name",
    taglineKey: "suites.healthcare_tagline",
    icon: Heart,
    cardGradient: "from-red-500/10 to-rose-500/10",
    iconGradient: "from-red-500 to-rose-500",
  },
  {
    categorySlug: "ai-suite",
    nameKey: "suites.ai_name",
    taglineKey: "suites.ai_tagline",
    icon: Brain,
    cardGradient: "from-brand-500/10 to-cyan-500/10",
    iconGradient: "from-brand-500 to-cyan-500",
  },
  {
    categorySlug: "business-solution",
    nameKey: "suites.enterprise_name",
    taglineKey: "suites.enterprise_tagline",
    icon: Building2,
    cardGradient: "from-green-500/10 to-emerald-500/10",
    iconGradient: "from-green-500 to-emerald-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function SuiteCard({ config }: { config: SuiteConfig }) {
  const { t } = useTranslation();
  const Icon = config.icon;
  const cat = PRODUCT_CATEGORIES.find((c) => c.slug === config.categorySlug);
  const products = cat ? cat.products.slice(0, 5) : [];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl bg-card border border-border hover:border-brand-500/40 transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.cardGradient} opacity-40`} />
      <div className={`absolute inset-0 bg-gradient-to-br ${config.cardGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

      <div className="relative p-7">
        <div
          className={`bg-gradient-to-br ${config.iconGradient} flex items-center justify-center shadow-lg mb-5 rounded-xl`}
          style={{ width: "3.25rem", height: "3.25rem" }}
        >
          <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1 leading-snug">
          {t(config.nameKey)}
        </h3>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {t(config.taglineKey)}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {products.map((p) => (
            <span
              key={p.slug}
              className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium border border-border"
            >
              {p.name}
            </span>
          ))}
          {cat && cat.products.length > 5 && (
            <span className="px-2.5 py-1 rounded-full bg-accent text-muted-foreground text-xs font-medium border border-border">
              {t("products.more_count", { count: cat.products.length - 5 })}
            </span>
          )}
        </div>

        <Link
          to={`/products?category=${config.categorySlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors group/link"
        >
          {t("products.explore_suite")}
          <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

export function ProductSuites() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useTranslation();

  return (
    <section className="py-24 relative" id="product-suites">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-brand-950/5 to-background" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
            {t("products.suites_badge")}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            <span className="gradient-text">{t("products.suites_heading")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("products.suites_desc")}
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {SUITE_CONFIGS.map((config) => (
            <SuiteCard key={config.categorySlug} config={config} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
