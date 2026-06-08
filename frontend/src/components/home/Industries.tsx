import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Landmark,
  Heart,
  Building2,
  Cpu,
  Factory,
  ShoppingBag,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface IndustryDef {
  nameKey: string;
  descKey: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

const INDUSTRY_DEFS: IndustryDef[] = [
  { nameKey: "industries.banking_name",       descKey: "industries.banking_desc",       icon: Landmark,    color: "#6366f1", href: "/services/banking" },
  { nameKey: "industries.healthcare_name",    descKey: "industries.healthcare_desc",    icon: Heart,       color: "#ef4444", href: "/services/healthcare" },
  { nameKey: "industries.government_name",    descKey: "industries.government_desc",    icon: Building2,   color: "#10b981", href: "/services/public-services" },
  { nameKey: "industries.hightech_name",      descKey: "industries.hightech_desc",      icon: Cpu,         color: "#0ea5e9", href: "/services/high-tech" },
  { nameKey: "industries.manufacturing_name", descKey: "industries.manufacturing_desc", icon: Factory,     color: "#f59e0b", href: "/services/manufacturing" },
  { nameKey: "industries.retail_name",        descKey: "industries.retail_desc",        icon: ShoppingBag, color: "#8b5cf6", href: "/services/retail" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function IndustryCard({ def }: { def: IndustryDef }) {
  const { t } = useTranslation();
  const Icon = def.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative p-6 rounded-2xl bg-card border border-border hover:border-brand-500/40 transition-all duration-300"
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at top left, ${def.color}12 0%, transparent 70%)` }}
      />

      <div className="relative">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${def.color}1a` }}
        >
          <Icon className="h-6 w-6" style={{ color: def.color }} strokeWidth={1.8} />
        </div>

        <h3 className="font-semibold text-base text-foreground mb-2 leading-snug">
          {t(def.nameKey)}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {t(def.descKey)}
        </p>

        <Link
          to={def.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group/link"
        >
          {t("services.learn_more")}
          <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

export function Industries() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useTranslation();

  return (
    <section className="py-24 relative" id="industries">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-accent/30 to-background" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
            {t("home.industries_badge")}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            <span className="gradient-text">{t("home.industries_heading")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("home.industries_desc")}
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {INDUSTRY_DEFS.map((def) => (
            <IndustryCard key={def.href} def={def} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
