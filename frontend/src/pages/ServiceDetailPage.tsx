import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, Check, Eye,
  Brain, BarChart3, Cloud, Globe, ShieldCheck, Zap, Server, Code, Database, Lock,
  Landmark, TrendingUp, ShoppingCart, Radio, GraduationCap, Heart, Cpu, Shield,
  Microscope, Factory, Building2, ShoppingBag, Plane, Layers, Package, FlaskConical,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { servicesService, servicesKeys } from "@/services/serviceService";

// ─── Maps ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, BarChart3, Cloud, Globe, ShieldCheck, Zap, Server, Code, Database, Lock,
  Landmark, TrendingUp, ShoppingCart, Radio, GraduationCap, Heart, Cpu, Shield,
  Microscope, Factory, Building2, ShoppingBag, Plane, Layers, Package, FlaskConical,
  HeartHandshake,
};

const GRADIENT_MAP: Record<string, { hero: string; icon: string; border: string }> = {
  "purple-brand":  { hero: "from-purple-600 to-brand-600",   icon: "from-purple-500 to-brand-500",   border: "border-purple-500/30"  },
  "green-emerald": { hero: "from-green-600 to-emerald-600",  icon: "from-green-500 to-emerald-500",  border: "border-green-500/30"   },
  "cyan-blue":     { hero: "from-cyan-600 to-blue-600",      icon: "from-cyan-500 to-blue-500",      border: "border-cyan-500/30"    },
  "orange-pink":   { hero: "from-orange-600 to-pink-600",    icon: "from-orange-500 to-pink-500",    border: "border-orange-500/30"  },
  "red-rose":      { hero: "from-red-600 to-rose-600",       icon: "from-red-500 to-rose-500",       border: "border-red-500/30"     },
  "brand-cyan":    { hero: "from-brand-600 to-cyan-600",     icon: "from-brand-500 to-cyan-500",     border: "border-brand-500/30"   },
  "yellow-orange": { hero: "from-yellow-600 to-orange-600",  icon: "from-yellow-500 to-orange-500",  border: "border-yellow-500/30"  },
};

// ─── Body renderer — paragraph split ──────────────────────────────────────

function BodyContent({ body }: { body: string }) {
  if (!body.trim()) return null;
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="space-y-5">
      {paragraphs.map((para, i) => {
        // H2 heading
        if (para.startsWith("## ")) {
          return (
            <h2 key={i} className="text-2xl font-bold text-foreground mt-8 first:mt-0">
              {para.slice(3)}
            </h2>
          );
        }
        // H3 heading
        if (para.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-semibold text-foreground mt-6 first:mt-0">
              {para.slice(4)}
            </h3>
          );
        }
        // Unordered list block (lines starting with "- ")
        if (para.split("\n").every((l) => l.startsWith("- ") || l === "")) {
          const items = para.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
          return (
            <ul key={i} className="space-y-2">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {para}
          </p>
        );
      })}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <main className="pt-20">
      <div className="h-72 bg-muted animate-pulse" />
      <div className="container mx-auto px-4 py-16 space-y-6 max-w-4xl">
        <div className="h-8 bg-muted rounded-lg w-2/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
      </div>
    </main>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: service, isLoading, isError } = useQuery({
    queryKey: servicesKeys.detail(slug ?? ""),
    queryFn:  () => servicesService.getBySlug(slug!).then((r) => r.data),
    enabled:  !!slug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Skeleton />;

  if (isError || !service) {
    return (
      <main className="pt-28 pb-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Service not found</h1>
          <p className="text-muted-foreground mb-8">
            This service doesn't exist or has been removed.
          </p>
          <Link to="/services">
            <Button variant="outline">← Back to Services</Button>
          </Link>
        </div>
      </main>
    );
  }

  const Icon = ICON_MAP[service.icon_name] ?? Zap;
  const g    = GRADIENT_MAP[service.gradient] ?? GRADIENT_MAP["purple-brand"];

  return (
    <>
      <SEOHead
        pageKey={`service-${service.slug}`}
        overrides={{
          title: `${service.title} — BlackMarlinBD`,
          description: service.short_description || service.description.slice(0, 160),
          ogType: "article",
          ogImage: service.cover_image_url ?? undefined,
        }}
      />

      <main className="pt-20">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {service.cover_image_url ? (
            <div className="relative h-80 sm:h-96">
              <img
                src={service.cover_image_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
          ) : (
            <div className={`h-72 bg-gradient-to-br ${g.hero} relative`}>
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "32px 32px",
                }}
              />
            </div>
          )}

          {/* Hero content overlay */}
          <div className="container mx-auto px-4">
            <div className="relative -mt-24 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${g.icon} flex items-center justify-center shadow-2xl mb-6 ring-4 ring-background`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Link to="/services" className="hover:text-brand-400 transition-colors">
                    Services
                  </Link>
                  <span>/</span>
                  {service.category && (
                    <>
                      <span
                        className="hover:text-brand-400 transition-colors cursor-pointer"
                        style={{ color: service.category.color }}
                      >
                        {service.category.name}
                      </span>
                      <span>/</span>
                    </>
                  )}
                  <span className="text-foreground font-medium">{service.title}</span>
                </div>

                {service.tagline && (
                  <p
                    className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${g.hero} text-white text-xs font-semibold mb-4`}
                  >
                    {service.tagline}
                  </p>
                )}
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                  {service.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {service.views_count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {service.views_count.toLocaleString()} views
                    </span>
                  )}
                  {service.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                      ★ Featured
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">

              {/* Left — main content */}
              <div className="lg:col-span-2 space-y-12">

                {/* Description */}
                {service.description && (
                  <div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                )}

                {/* Capabilities */}
                {service.capabilities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h2 className="text-2xl font-bold mb-6">What We Deliver</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.capabilities.map((cap, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-4 rounded-xl border ${g.border} bg-card`}
                        >
                          <Check className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Body (long-form content) */}
                {service.body && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="border-t border-border pt-10"
                  >
                    <BodyContent body={service.body} />
                  </motion.div>
                )}

                {/* Case Studies */}
                {service.case_studies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="border-t border-border pt-10"
                  >
                    <h2 className="text-2xl font-bold mb-8">Case Studies</h2>
                    <div className="space-y-6">
                      {service.case_studies.map((cs) => (
                        <article
                          key={cs.id}
                          className="p-6 rounded-2xl bg-card border border-border"
                        >
                          {cs.cover_image_url && (
                            <img
                              src={cs.cover_image_url}
                              alt={cs.title}
                              className="w-full h-40 object-cover rounded-xl mb-5"
                            />
                          )}
                          <h3 className="font-bold text-lg mb-1">{cs.title}</h3>
                          {cs.client_name && (
                            <p className="text-xs text-muted-foreground mb-4">
                              Client: {cs.client_name}
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {cs.challenge && (
                              <div>
                                <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-1">Challenge</p>
                                <p className="text-sm text-muted-foreground">{cs.challenge}</p>
                              </div>
                            )}
                            {cs.solution && (
                              <div>
                                <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-1">Solution</p>
                                <p className="text-sm text-muted-foreground">{cs.solution}</p>
                              </div>
                            )}
                            {cs.results && (
                              <div>
                                <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-1">Results</p>
                                <p className="text-sm text-muted-foreground">{cs.results}</p>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right sidebar */}
              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">

                {/* CTA card */}
                <div
                  className={`p-6 rounded-2xl border ${g.border} bg-gradient-to-br from-card to-card/50`}
                >
                  <h3 className="font-bold text-lg mb-2">Ready to start?</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Tell us about your project and we'll build a tailored proposal.
                  </p>
                  <Link to="/contact" className="block">
                    <Button variant="gradient" className="w-full group">
                      Discuss Your Project
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Technologies */}
                {service.technologies.length > 0 && (
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-4">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((t) => (
                        <span
                          key={t.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium"
                        >
                          {t.logo && <span>{t.logo}</span>}
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category */}
                {service.category && (
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-3">
                      Category
                    </h3>
                    <span
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: service.category.color + "20",
                        color: service.category.color,
                      }}
                    >
                      {service.category.name}
                    </span>
                    {service.category.description && (
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        {service.category.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Back link */}
                <Link
                  to="/services"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All Services
                </Link>
              </aside>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
