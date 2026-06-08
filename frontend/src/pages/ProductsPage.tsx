import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo/SEOHead";
import { productsApi } from "@/services/api/products";
import type { ProductDB, ProductCategory } from "@/types";
import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: ProductDB; index: number }) {
  const { t } = useTranslation();
  const Icon = getIcon(product.icon_name);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      layout
    >
      <Link
        to={`/products/${product.slug}`}
        className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: product.icon_color + "22", border: `1.5px solid ${product.icon_color}44` }}
        >
          <Icon className="h-5 w-5" style={{ color: product.icon_color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-semibold text-foreground group-hover:text-brand-400 transition-colors text-sm">{product.name}</span>
            {product.is_new && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">{t("products.badge_new")}</span>
            )}
            {product.badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">{product.badge}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">{product.tagline}</p>
          <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">{product.description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
      </Link>
    </motion.div>
  );
}

// ─── Category tab ─────────────────────────────────────────────────────────────

function CategoryTab({ cat, active, onClick }: { cat: ProductCategory; active: boolean; onClick: () => void }) {
  const Icon = getIcon(cat.icon_name);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-150",
        active ? "bg-brand-500/10 text-brand-400 border border-brand-500/30" : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-400" : "text-muted-foreground")} />
      <span className="truncate">{cat.name}</span>
      <span className={cn("ml-auto text-[11px] tabular-nums", active ? "text-brand-400" : "text-muted-foreground/60")}>{cat.product_count}</span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [activeCategorySlug, setActiveCategorySlug] = useState(searchParams.get("category") ?? "");
  const { t } = useTranslation();

  const { data: catsData, isLoading: catsLoading } = useQuery({
    queryKey: ["product-categories-public"],
    queryFn: () => productsApi.categories.list().then((r) => r.data),
    staleTime: 300_000,
  });

  const categories = (catsData?.results ?? []) as ProductCategory[];
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug) ?? categories[0];

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products-public", activeCategory?.slug],
    queryFn: () => productsApi.list({ "category__slug": activeCategory!.slug, is_active: true, page_size: 100 }).then((r) => r.data),
    enabled: !!activeCategory,
    staleTime: 120_000,
  });

  const products = productsData?.results ?? [];
  const totalProducts = categories.reduce((s, c) => s + c.product_count, 0);

  if (catsLoading) {
    return (
      <main className="pt-28 pb-24 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </main>
    );
  }

  return (
    <>
      <SEOHead pageKey="products" fallback={{ title: "Products — BlackMarlinBD Enterprise Software", description: "40+ enterprise software products." }} />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> {t("products.badge")}
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4"><span className="gradient-text">{t("products.page_title")}</span></h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("products.page_subtitle")}</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { value: String(categories.length), label: t("products.stat_categories") },
              { value: `${totalProducts}+`,        label: t("products.stat_live") },
              { value: "150+",                     label: t("products.stat_clients") },
              { value: "99.9%",                    label: t("products.stat_uptime") },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-card border border-border py-4 text-center">
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Layout */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar */}
            <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:w-60 shrink-0">
              <div className="sticky top-24 rounded-2xl bg-card border border-border p-3 space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 py-2">{t("products.categories")}</p>
                {categories.map((cat) => (
                  <CategoryTab key={cat.slug} cat={cat} active={activeCategory?.slug === cat.slug} onClick={() => setActiveCategorySlug(cat.slug)} />
                ))}
                <div className="pt-2 px-2">
                  <Link to="/contact" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> {t("products.request_demo")}
                  </Link>
                </div>
              </div>
            </motion.aside>

            {/* Products */}
            <div className="flex-1 min-w-0">
              <motion.div key={activeCategory?.slug + "-hdr"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">{activeCategory?.name}</h2>
                  <p className="text-sm text-muted-foreground">{t("products.product_count", { count: products.length })}</p>
                </div>
              </motion.div>

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />)}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={activeCategory?.slug} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* CTA */}
              <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-500 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white">
                  <p className="font-bold text-lg">{t("products.custom_title")}</p>
                  <p className="text-white/80 text-sm">{t("products.custom_desc")}</p>
                </div>
                <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-600 font-semibold text-sm hover:bg-white/90 transition-colors">
                  {t("products.talk_to_us")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
