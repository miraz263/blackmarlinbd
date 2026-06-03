import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, ArrowRight, Briefcase, Package2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/services/api/projects";
import { productsApi } from "@/services/api/products";
import { getIcon } from "@/lib/iconMap";
import { useTranslation } from "@/hooks/useTranslation";
import type { Project, ProductDB, ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

// ─── Portfolio tab ────────────────────────────────────────────────────────────

function PortfolioTab() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ["project-categories"],
    queryFn: () => projectsApi.categories.list().then((r) => r.data.results),
    staleTime: 5 * 60 * 1000,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", selectedCategory, search, page],
    queryFn: () =>
      projectsApi.list({
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(search && { search }),
        page,
      }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("projects.search_placeholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setSelectedCategory("all"); setPage(1); }}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedCategory === "all" ? "bg-brand-500 text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t("common.all")}
          </button>
          {categories?.map((cat) => (
            <button key={cat.slug}
              onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === cat.slug ? "bg-brand-500 text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-card border border-border h-72 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.results.map((project: Project, i: number) => (
              <motion.div key={project.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-brand-500/50 transition-all duration-300"
              >
                <div className="relative h-48 bg-gradient-to-br from-brand-900 to-brand-800">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-brand-700/50">
                      {project.title[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.short_description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(Array.isArray(project.tech_stack) ? project.tech_stack : []).slice(0, 3).map((tech) => (
                      <span key={tech} className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">{tech}</span>
                    ))}
                  </div>
                  <Link to={`/projects/${project.slug}`} className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 font-medium">
                    {t("projects.view_details")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {projects && projects.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors text-sm">
                {t("projects.previous")}
              </button>
              <span className="text-sm text-muted-foreground">{page} / {projects.total_pages}</span>
              <button onClick={() => setPage((p) => Math.min(projects.total_pages, p + 1))} disabled={page === projects.total_pages}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors text-sm">
                {t("btn.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Products tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [activeCategorySlug, setActiveCategorySlug] = useState("");

  const { data: catsData, isLoading: catsLoading } = useQuery({
    queryKey: ["product-categories-work"],
    queryFn: () => productsApi.categories.list().then((r) => r.data),
    staleTime: 300_000,
  });

  const categories = (catsData?.results ?? []) as ProductCategory[];
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug) ?? categories[0];

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products-work", activeCategory?.slug],
    queryFn: () => productsApi.list({ "category__slug": activeCategory!.slug, is_active: true, page_size: 100 }).then((r) => r.data),
    enabled: !!activeCategory,
    staleTime: 120_000,
  });

  const products = (productsData?.results ?? []) as ProductDB[];

  if (catsLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar — categories */}
      <aside className="lg:w-56 shrink-0">
        <div className="sticky top-28 rounded-2xl bg-card border border-border p-3 space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 py-2">Categories</p>
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon_name);
            return (
              <button key={cat.slug} onClick={() => setActiveCategorySlug(cat.slug)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all",
                  activeCategory?.slug === cat.slug
                    ? "bg-brand-500/10 text-brand-400 border border-brand-500/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{cat.name}</span>
                <span className="ml-auto text-[11px] tabular-nums opacity-60">{cat.product_count}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Products grid */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold">{activeCategory?.name}</h3>
            <p className="text-sm text-muted-foreground">{products.length} product{products.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory?.slug} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((product, i) => {
                const Icon = getIcon(product.icon_name);
                return (
                  <motion.div key={product.slug}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/products/${product.slug}`}
                      className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200"
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: product.icon_color + "22", border: `1.5px solid ${product.icon_color}44` }}>
                        <Icon className="h-5 w-5" style={{ color: product.icon_color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-semibold text-sm group-hover:text-brand-400 transition-colors">{product.name}</span>
                          {product.is_new && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">NEW</span>}
                          {product.badge && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">{product.badge}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.tagline}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-400 transition-all shrink-0 self-center" />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Unified "Our Work" page ──────────────────────────────────────────────────

type Tab = "portfolio" | "products";

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");
  const { t } = useTranslation();

  const tabs: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "portfolio", label: t("projects.tab_portfolio"), icon: Briefcase, desc: t("projects.tab_portfolio_desc") },
    { id: "products",  label: t("projects.tab_products"),  icon: Package2,  desc: t("projects.tab_products_desc") },
  ];

  return (
    <>
      <SEOHead
        pageKey="projects"
        fallback={{ title: "Our Work — BlackMarlinBD", description: "Explore our portfolio of projects and enterprise software products." }}
      />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
              {t("projects.our_work")}
            </span>
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">{t("projects.unified_title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("projects.unified_subtitle")}
            </p>
          </motion.div>

          {/* Tab switcher */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-3 justify-center mb-12">
            {tabs.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl border text-left transition-all duration-200",
                  activeTab === id
                    ? "bg-brand-500/10 border-brand-500/40 text-brand-400 shadow-lg shadow-brand-500/10"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-brand-500/20"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", activeTab === id ? "text-brand-400" : "text-muted-foreground")} />
                <div>
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs opacity-70">{desc}</div>
                </div>
              </button>
            ))}
          </motion.div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "portfolio" ? <PortfolioTab /> : <ProductsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
