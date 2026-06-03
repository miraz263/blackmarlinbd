import { useState, useEffect, useRef } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ArrowRight, X,
  Brain, BarChart3, Cloud, Globe, ShieldCheck, Zap, Server, Code, Database, Lock,
  Landmark, TrendingUp, ShoppingCart, Radio, GraduationCap, Heart, Cpu, Shield,
  Microscope, Factory, Building2, ShoppingBag, Plane, Layers, Package, FlaskConical,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import { servicesService, servicesKeys } from "@/services/serviceService";
import { useTranslation } from "@/hooks/useTranslation";
import type { ServiceListItem, ServiceParams } from "@/types";

// ─── Maps ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, BarChart3, Cloud, Globe, ShieldCheck, Zap, Server, Code, Database, Lock,
  Landmark, TrendingUp, ShoppingCart, Radio, GraduationCap, Heart, Cpu, Shield,
  Microscope, Factory, Building2, ShoppingBag, Plane, Layers, Package, FlaskConical,
  HeartHandshake,
};

const GRADIENT_MAP: Record<string, { card: string; icon: string }> = {
  "purple-brand":  { card: "from-purple-500/10 to-brand-500/10",   icon: "from-purple-500 to-brand-500"   },
  "green-emerald": { card: "from-green-500/10 to-emerald-500/10",  icon: "from-green-500 to-emerald-500"  },
  "cyan-blue":     { card: "from-cyan-500/10 to-blue-500/10",      icon: "from-cyan-500 to-blue-500"      },
  "orange-pink":   { card: "from-orange-500/10 to-pink-500/10",    icon: "from-orange-500 to-pink-500"    },
  "red-rose":      { card: "from-red-500/10 to-rose-500/10",       icon: "from-red-500 to-rose-500"       },
  "brand-cyan":    { card: "from-brand-500/10 to-cyan-500/10",     icon: "from-brand-500 to-cyan-500"     },
  "yellow-orange": { card: "from-yellow-500/10 to-orange-500/10",  icon: "from-yellow-500 to-orange-500"  },
};

// ─── Debounce ──────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Fallback data (shown while API loads) ─────────────────────────────────

const FALLBACK_SERVICES: ServiceListItem[] = [
  { id: -1, title: "AI & Machine Learning", slug: "ai-ml", tagline: "Intelligent Systems at Scale",
    short_description: "Custom LLM pipelines, RAG architectures, computer vision, and predictive analytics for production.",
    icon_name: "Brain", gradient: "purple-brand", cover_image_url: null, category: null,
    technologies: [{ id: -1, name: "Python", logo: "🐍", order: 0 }, { id: -2, name: "PyTorch", logo: "🔥", order: 1 }],
    featured: true, order: 0, status: "published", views_count: 0 },
  { id: -2, title: "Financial Systems", slug: "financial", tagline: "Sub-millisecond. Zero-error.",
    short_description: "OMS, HFT engines, risk platforms, and real-time pipelines with institutional-grade reliability.",
    icon_name: "BarChart3", gradient: "green-emerald", cover_image_url: null, category: null,
    technologies: [{ id: -3, name: "Rust", logo: "⚙️", order: 0 }, { id: -4, name: "Kafka", logo: "📨", order: 1 }],
    featured: true, order: 1, status: "published", views_count: 0 },
  { id: -3, title: "Cloud & DevOps", slug: "cloud", tagline: "99.99% Uptime, Engineered",
    short_description: "Multi-cloud architecture, Kubernetes, GitOps pipelines, and SRE practices.",
    icon_name: "Cloud", gradient: "cyan-blue", cover_image_url: null, category: null,
    technologies: [{ id: -5, name: "AWS", logo: "☁️", order: 0 }, { id: -6, name: "Kubernetes", logo: "☸️", order: 1 }],
    featured: false, order: 2, status: "published", views_count: 0 },
  { id: -4, title: "Web & Mobile Apps", slug: "web-mobile", tagline: "Pixel-perfect. Blazing fast.",
    short_description: "React, Next.js, Flutter, and React Native applications at any scale.",
    icon_name: "Globe", gradient: "orange-pink", cover_image_url: null, category: null,
    technologies: [{ id: -7, name: "React", logo: "⚛️", order: 0 }, { id: -8, name: "Flutter", logo: "📱", order: 1 }],
    featured: false, order: 3, status: "published", views_count: 0 },
  { id: -5, title: "Cybersecurity", slug: "security", tagline: "Secure by Design",
    short_description: "Pen testing, zero-trust architecture, SOC 2 / ISO 27001 compliance.",
    icon_name: "ShieldCheck", gradient: "red-rose", cover_image_url: null, category: null,
    technologies: [{ id: -9, name: "OWASP", logo: "🛡️", order: 0 }, { id: -10, name: "Vault", logo: "🔒", order: 1 }],
    featured: false, order: 4, status: "published", views_count: 0 },
];

// ─── Service Card ──────────────────────────────────────────────────────────

function ServiceCard({ service, index, exploreLabel, featuredLabel }: { service: ServiceListItem; index: number; exploreLabel: string; featuredLabel: string }) {
  const Icon = ICON_MAP[service.icon_name] ?? Zap;
  const g    = GRADIENT_MAP[service.gradient] ?? GRADIENT_MAP["purple-brand"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      layout
      className="group relative flex flex-col rounded-2xl bg-card border border-border hover:border-brand-500/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5"
    >
      {/* Cover image or gradient strip */}
      {service.cover_image_url ? (
        <img
          src={service.cover_image_url}
          alt={service.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className={`h-40 bg-gradient-to-br ${g.card} flex items-center justify-center`}>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${g.icon} flex items-center justify-center shadow-lg`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6">
        {/* Category badge */}
        {service.category && (
          <span
            className="inline-block self-start px-2.5 py-0.5 rounded-full text-xs font-medium mb-3"
            style={{
              backgroundColor: service.category.color + "20",
              color: service.category.color,
            }}
          >
            {service.category.name}
          </span>
        )}

        {/* Featured badge */}
        {service.featured && !service.category && (
          <span className="inline-block self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 mb-3">
            {featuredLabel}
          </span>
        )}

        <h2 className="font-bold text-lg text-foreground mb-1 group-hover:text-brand-400 transition-colors">
          {service.title}
        </h2>
        {service.tagline && (
          <p className="text-xs text-muted-foreground font-medium mb-3">{service.tagline}</p>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
          {service.short_description}
        </p>

        {/* Tech chips */}
        {service.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {service.technologies.slice(0, 3).map((t) => (
              <span
                key={t.id}
                className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium"
              >
                {t.logo && <span className="mr-1">{t.logo}</span>}
                {t.name}
              </span>
            ))}
            {service.technologies.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-accent text-muted-foreground text-xs">
                +{service.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          to={`/services/${service.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group/link"
        >
          {exploreLabel}
          <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search,      setSearch]      = useState("");
  const [activeCategory, setCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [featuredOnly, setFeatured]   = useState(false);
  const debouncedSearch               = useDebounce(search, 300);
  const inputRef                      = useRef<HTMLInputElement>(null);

  // Sync URL param → filter when the user navigates via the mega-menu
  useEffect(() => {
    const cat = searchParams.get("category") ?? "all";
    setCategory(cat);
  }, [searchParams]);

  const updateCategory = (slug: string) => {
    setCategory(slug);
    if (slug === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const params: ServiceParams = {
    ...(debouncedSearch          && { search: debouncedSearch }),
    ...(activeCategory !== "all" && { category: activeCategory }),
    ...(featuredOnly             && { featured: true }),
    status: "published",
  };

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: servicesKeys.list(params),
    queryFn:  () => servicesService.getAll(params).then((r) => r.data.results),
    staleTime: 2 * 60 * 1000,
    placeholderData: FALLBACK_SERVICES,
  });

  const { data: categories } = useQuery({
    queryKey: servicesKeys.categories,
    queryFn:  () => servicesService.getCategories().then((r) => r.data.results),
    staleTime: 10 * 60 * 1000,
  });

  const displayedServices = services ?? FALLBACK_SERVICES;
  const activeCategoryObj = categories?.find((c) => c.slug === activeCategory);

  const pageTitle    = activeCategoryObj?.name    ?? t("services_page.title");
  const pageSubtitle = activeCategoryObj?.description ?? t("services_page.subtitle");

  return (
    <>
      <SEOHead
        pageKey="services"
        fallback={{
          title: activeCategoryObj ? `${activeCategoryObj.name} — BlackMarlinBD` : "Services — BlackMarlinBD",
          description: pageSubtitle || "Enterprise IT services: AI & ML, financial systems, cloud infrastructure, web & mobile, and cybersecurity.",
        }}
      />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            {activeCategoryObj && (
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium border mb-4"
                style={{ backgroundColor: activeCategoryObj.color + "20", color: activeCategoryObj.color, borderColor: activeCategoryObj.color + "40" }}>
                {t("services_page.browsing_category")}
              </span>
            )}
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              <span className="gradient-text">{pageTitle}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {pageSubtitle}
            </p>
          </motion.div>

          {/* ── Search + Filters ────────────────────────────────────────── */}
          <div className="max-w-3xl mx-auto mb-12 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("services_page.search_placeholder")}
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-card border border-border focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateCategory("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "bg-card border border-border text-muted-foreground hover:border-brand-500/50"
                }`}
              >
                {t("common.all")}
              </button>

              {categories?.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateCategory(cat.slug === activeCategory ? "all" : cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.slug
                      ? "text-white shadow-md"
                      : "bg-card border border-border text-muted-foreground hover:border-brand-500/50"
                  }`}
                  style={
                    activeCategory === cat.slug
                      ? { backgroundColor: cat.color, boxShadow: `0 4px 12px ${cat.color}40` }
                      : undefined
                  }
                >
                  {cat.name}
                  {cat.service_count > 0 && (
                    <span className="ml-1.5 opacity-60">({cat.service_count})</span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setFeatured((f) => !f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  featuredOnly
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-card border border-border text-muted-foreground hover:border-amber-500/50"
                }`}
              >
                {t("services_page.featured_filter")}
              </button>
            </div>
          </div>

          {/* ── Results count ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {servicesLoading ? t("common.loading") : `${displayedServices.length} service${displayedServices.length !== 1 ? "s" : ""}`}
            </p>
            {(search || activeCategory !== "all" || featuredOnly) && (
              <button
                onClick={() => { setSearch(""); updateCategory("all"); setFeatured(false); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="h-3 w-3" /> {t("services_page.clear_filters")}
              </button>
            )}
          </div>

          {/* ── Service grid ────────────────────────────────────────────── */}
          {displayedServices.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">{t("services_page.no_match")}</p>
              <p className="text-sm mt-1">{t("services_page.no_match_hint")}</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {displayedServices.map((service, i) => (
                  <ServiceCard key={service.id} service={service} index={i} exploreLabel={t("services.explore")} featuredLabel={t("services_page.featured_badge")} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
