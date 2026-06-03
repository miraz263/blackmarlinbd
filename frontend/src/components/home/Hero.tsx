import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Play, Sparkles, Zap, Star, Users, TrendingUp, Award, Globe,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useHomepageQuery } from "@/hooks/useHomepageQuery";
import type { HeroButton, StatisticCard } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Star, Users, TrendingUp, Award, Globe,
};


const FLOATING_BADGE_CONFIGS = [
  { key: "hero.floating_ai",       color: "from-purple-500 to-brand-500", x: "-5%", y: "20%" },
  { key: "hero.floating_cloud",    color: "from-cyan-500 to-blue-500",    x: "85%", y: "15%" },
  { key: "hero.floating_downtime", color: "from-green-500 to-emerald-500", x: "80%", y: "75%" },
  { key: "hero.floating_secure",   color: "from-orange-500 to-red-500",   x: "-8%", y: "70%" },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

function HeroButtonLink({ btn }: { btn: HeroButton }) {
  const isExternal = btn.url.startsWith("http");
  const inner =
    btn.variant === "primary" ? (
      <Button variant="gradient" size="xl" className="group">
        {btn.label}
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    ) : (
      <Button variant="outline" size="xl">
        {btn.label}
      </Button>
    );

  if (isExternal) {
    return (
      <a href={btn.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <Link to={btn.url}>{inner}</Link>;
}

export function Hero() {
  const { data } = useHomepageQuery();
  const { t } = useTranslation();

  const hero = data?.hero;
  const buttons = hero?.buttons?.filter((b) => b.is_published) ?? [];

  const heroBadge = hero?.badge_text  || t("hero.badge");
  const heroTitle = hero?.title        || t("hero.title");
  const heroDesc  = hero?.description  || t("hero.description");

  const stats: StatisticCard[] = data?.statistics?.length
    ? data.statistics
    : [{ id: 0, label: t("hero.stat_uptime"), value: "99.9%", icon_name: "Zap", order: 0, is_published: true }];

  const floatingBadges = FLOATING_BADGE_CONFIGS.map((cfg) => ({ ...cfg, text: t(cfg.key) }));

  const heroBgImage = hero?.background_image_url;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        {heroBgImage ? (
          <>
            <img src={heroBgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/50 via-background to-background dark:from-brand-950 dark:via-background" />
        )}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Floating badges */}
      {floatingBadges.map((fb, i) => (
        <motion.div
          key={fb.key}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: 1 + i * 0.2 },
            scale: { delay: 1 + i * 0.2 },
            y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
          }}
          className="absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass dark:glass-dark border border-border text-xs font-medium"
          style={{ left: fb.x, top: fb.y }}
        >
          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${fb.color}`} />
          {fb.text}
        </motion.div>
      ))}

      {/* Content */}
      <div className="container mx-auto px-4 text-center">
        <motion.div variants={container} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            {heroBadge}
            <ArrowRight className="h-3 w-3" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            <span className="gradient-text">{heroTitle}</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={item}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {heroDesc}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {buttons.length > 0 ? (
              buttons.map((btn) => <HeroButtonLink key={btn.id} btn={btn} />)
            ) : (
              <>
                <Link to="/contact">
                  <Button variant="gradient" size="xl" className="group">
                    {t("hero.start_project")}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" size="xl" className="group gap-2">
                    <Play className="h-4 w-4 fill-current" />
                    {t("hero.view_work")}
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div variants={item} className="flex flex-wrap justify-center gap-8">
            {stats.map((stat) => {
              const Icon = ICON_MAP[stat.icon_name] ?? Zap;
              return (
                <div key={stat.id} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-brand-400 mr-1.5" />
                    <span className="text-2xl sm:text-3xl font-bold gradient-text">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="text-xs">{t("hero.scroll")}</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
