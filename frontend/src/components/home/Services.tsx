import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Brain, BarChart3, Cloud, Globe, ShieldCheck, Zap, Server, Code, Database, Lock,
  ArrowRight, type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useHomepageQuery } from "@/hooks/useHomepageQuery";
import type { ServiceItem } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, BarChart3, Cloud, Globe, ShieldCheck, Zap, Server, Code, Database, Lock,
};

const GRADIENT_MAP: Record<string, { gradient: string; shadow: string }> = {
  "purple-brand":  { gradient: "from-purple-500 to-brand-500",   shadow: "shadow-purple-500/20" },
  "green-emerald": { gradient: "from-green-500 to-emerald-500",  shadow: "shadow-green-500/20"  },
  "cyan-blue":     { gradient: "from-cyan-500 to-blue-500",      shadow: "shadow-cyan-500/20"   },
  "orange-pink":   { gradient: "from-orange-500 to-pink-500",    shadow: "shadow-orange-500/20" },
  "red-rose":      { gradient: "from-red-500 to-rose-500",       shadow: "shadow-red-500/20"    },
  "brand-cyan":    { gradient: "from-brand-500 to-cyan-500",     shadow: "shadow-brand-500/20"  },
  "yellow-orange": { gradient: "from-yellow-500 to-orange-500",  shadow: "shadow-yellow-500/20" },
};

const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: -1, title: "AI & Machine Learning", icon_name: "Brain", gradient: "purple-brand",
    href: "/services#ai-ml", order: 0, is_published: true,
    description: "Custom LLM integrations, predictive analytics, computer vision, and NLP solutions that transform raw data into competitive advantage.",
    tags: ["LLMs", "TensorFlow", "PyTorch", "MLOps"],
  },
  {
    id: -2, title: "Financial Systems", icon_name: "BarChart3", gradient: "green-emerald",
    href: "/services#financial", order: 1, is_published: true,
    description: "High-frequency trading platforms, order management systems, risk engines, and real-time financial data pipelines built for sub-millisecond latency.",
    tags: ["OMS", "FIX Protocol", "Risk Mgmt", "Quant"],
  },
  {
    id: -3, title: "Cloud & DevOps", icon_name: "Cloud", gradient: "cyan-blue",
    href: "/services#cloud", order: 2, is_published: true,
    description: "Multi-cloud architecture, Kubernetes orchestration, GitOps pipelines, and SRE practices that guarantee 99.9% uptime at scale.",
    tags: ["AWS", "GCP", "K8s", "Terraform"],
  },
  {
    id: -4, title: "Web & Mobile Apps", icon_name: "Globe", gradient: "orange-pink",
    href: "/services#web-mobile", order: 3, is_published: true,
    description: "React, Next.js, React Native, and Flutter applications with pixel-perfect design, blazing performance, and seamless user experiences.",
    tags: ["React", "Next.js", "Flutter", "GraphQL"],
  },
  {
    id: -5, title: "Cybersecurity", icon_name: "ShieldCheck", gradient: "red-rose",
    href: "/services#security", order: 4, is_published: true,
    description: "Penetration testing, zero-trust architecture, SOC setup, compliance frameworks (ISO 27001, SOC 2), and threat intelligence.",
    tags: ["Pen Testing", "SIEM", "SOC 2", "Zero Trust"],
  },
];

// Known English section header defaults — prefer i18n when DB hasn't been translated
const EN_SECTION_BADGE = "What We Do";
const EN_SECTION_TITLE = "End-to-End Technology Services";
const EN_SECTION_DESC =
  "From AI research to production deployment, we engineer solutions that solve real business problems at enterprise scale.";

// Maps known English service titles to i18n keys for title + description
const SERVICE_I18N: Record<string, { titleKey: string; descKey: string }> = {
  "AI & Machine Learning": { titleKey: "services.s_ai_title",    descKey: "services.s_ai_desc" },
  "Financial Systems":     { titleKey: "services.s_fin_title",   descKey: "services.s_fin_desc" },
  "Cloud & DevOps":        { titleKey: "services.s_cloud_title", descKey: "services.s_cloud_desc" },
  "Web & Mobile Apps":     { titleKey: "services.s_web_title",   descKey: "services.s_web_desc" },
  "Cybersecurity":         { titleKey: "services.s_cyber_title", descKey: "services.s_cyber_desc" },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useHomepageQuery();
  const { t } = useTranslation();

  const section = data?.sections?.services;
  const services = data?.services?.length ? data.services : FALLBACK_SERVICES;

  if (section && !section.is_visible) return null;

  // Use comparison pattern: if DB returns the unchanged English default, show i18n translation
  const sectionBadge =
    section?.badge_text && section.badge_text !== EN_SECTION_BADGE
      ? section.badge_text
      : t("services.badge");
  const sectionTitleIsDefault =
    !section?.title || section.title === EN_SECTION_TITLE;
  const sectionDesc =
    section?.description && section.description !== EN_SECTION_DESC
      ? section.description
      : t("services.subtitle");

  return (
    <section className="py-24 relative" id="services">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-brand-950/5 to-background" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
            {sectionBadge}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {sectionTitleIsDefault ? (
              <span className="gradient-text">{t("services.section_title")}</span>
            ) : (
              section!.title
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionDesc}
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon_name] ?? Zap;
            const { gradient, shadow } =
              GRADIENT_MAP[service.gradient] ?? GRADIENT_MAP["purple-brand"];

            // Translate known service titles/descriptions; pass through custom DB content as-is
            const i18nKeys = SERVICE_I18N[service.title];
            const displayTitle = i18nKeys ? t(i18nKeys.titleKey) : service.title;
            const displayDesc  = i18nKeys ? t(i18nKeys.descKey)  : service.description;

            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-brand-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/0 to-cyan-500/0 group-hover:from-brand-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />

                <div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} mb-4`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="relative font-semibold text-lg text-foreground mb-2">
                  {displayTitle}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed mb-4">
                  {displayDesc}
                </p>

                <div className="relative flex flex-wrap gap-1.5 mb-4">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={service.href}
                  className="relative inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group/link"
                >
                  {t("services.learn_more")}
                  <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}

          {/* CTA Card */}
          <motion.div
            variants={cardVariants}
            className="relative p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            <div className="relative">
              <h3 className="font-bold text-xl mb-2">{t("services.custom_title")}</h3>
              <p className="text-white/80 text-sm mb-6">
                {t("services.custom_desc")}
              </p>
              <Link to="/contact">
                <button className="px-4 py-2 rounded-lg bg-white text-brand-600 font-semibold text-sm hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                  {t("services.talk_expert")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
