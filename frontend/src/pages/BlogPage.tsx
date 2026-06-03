import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Clock, Eye, ArrowRight, Search, X, BookOpen, TrendingUp, Rss, PenLine } from "lucide-react";
import { blogApi } from "@/services/api/blog";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";
import { cn } from "@/lib/utils";

// ─── Author avatar ─────────────────────────────────────────────────────────

function AuthorAvatar({ post }: { post: BlogPost }) {
  const initial = post.author?.first_name?.[0] || post.author?.email?.[0] || "A";
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {initial.toUpperCase()}
      </div>
      <span className="text-xs text-muted-foreground">
        {post.author?.first_name} {post.author?.last_name}
      </span>
    </div>
  );
}

// ─── Featured hero post ─────────────────────────────────────────────────────

function FeaturedPost({ post, readLabel }: { post: BlogPost; readLabel: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative rounded-3xl overflow-hidden border border-border hover:border-brand-500/40 transition-all duration-300 mb-10"
    >
      <div className="relative h-72 sm:h-96 bg-gradient-to-br from-brand-900 to-cyan-900">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[120px] font-black text-white/5 select-none">{post.title[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-semibold shadow-lg">
            <TrendingUp className="h-3 w-3" /> Featured
          </span>
          {post.category && (
            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs font-medium border border-white/10">
              {post.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time} min read</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views_count}</span>
          <span>{formatDate(post.published_at)}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-brand-300 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-white/60 line-clamp-2 mb-4 max-w-2xl">{post.excerpt}</p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
              {(post.author?.first_name?.[0] || "A").toUpperCase()}
            </div>
            <span className="text-xs text-white/70">{post.author?.first_name} {post.author?.last_name}</span>
          </div>
          <Link to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30">
            {readLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Post card ──────────────────────────────────────────────────────────────

function PostCard({ post, index, readLabel, minReadLabel }: { post: BlogPost; index: number; readLabel: string; minReadLabel: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col"
    >
      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-br from-brand-950/80 to-cyan-950/80 overflow-hidden shrink-0">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl font-black text-white/5 select-none">{post.title[0]}</span>
          </div>
        )}
        {post.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-brand-500 text-white text-[11px] font-semibold shadow">
            {post.category.name}
          </span>
        )}
        {post.is_featured && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500/90 text-white text-[10px] font-bold">
            ★
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time} {minReadLabel}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views_count.toLocaleString()}</span>
          <span className="ml-auto">{formatDate(post.published_at)}</span>
        </div>

        <h2 className="font-semibold text-base text-foreground mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <AuthorAvatar post={post} />
          <Link to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors group/link">
            {readLabel}
            <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mb-6">
        <BookOpen className="h-10 w-10 text-brand-400/60" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {hasFilters ? "No posts match your search" : "No posts yet"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {hasFilters
          ? "Try a different keyword or clear your filters to see all posts."
          : "Check back soon — new articles are on the way."}
      </p>
      {hasFilters && (
        <button onClick={onClear}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500/10 text-brand-400 text-sm font-medium hover:bg-brand-500/20 transition-colors border border-brand-500/20">
          <X className="h-4 w-4" /> Clear filters
        </button>
      )}
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const canWrite = isAuthenticated && (user?.role === "admin" || user?.role === "editor");
  const [search, setSearch]               = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage]                   = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.categories.list().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
  const categories = categoriesData?.results ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["blog", search, selectedCategory, page],
    queryFn: () =>
      blogApi.list({
        ...(search && { search }),
        ...(selectedCategory !== "all" && { category__slug: selectedCategory }),
        page,
      }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const posts: BlogPost[] = data?.results ?? [];
  const featuredPost = posts.find((p) => p.is_featured) ?? posts[0] ?? null;
  const gridPosts    = featuredPost && page === 1 && !search && selectedCategory === "all"
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  const hasFilters = search !== "" || selectedCategory !== "all";
  const clearFilters = () => { setSearch(""); setSelectedCategory("all"); setPage(1); };

  return (
    <>
      <SEOHead
        pageKey="blog"
        fallback={{
          title: "Blog — BlackMarlinBD",
          description: "Technical insights, engineering guides, and industry analysis from BlackMarlinBD.",
        }}
      />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-5">
              <Rss className="h-3.5 w-3.5" />
              {t("blog.page_title")}
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              <span className="gradient-text">{t("blog.page_title")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
              {t("blog.page_subtitle")}
            </p>
            {canWrite && (
              <Link to="/blog/write"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                <PenLine className="h-4 w-4" /> Write a Post
              </Link>
            )}
          </motion.div>

          {/* ── Search + Filters ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-10 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={t("blog.search_placeholder")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => { setSelectedCategory("all"); setPage(1); }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                    selectedCategory === "all"
                      ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20"
                      : "bg-card border-border text-muted-foreground hover:border-brand-500/40 hover:text-foreground"
                  )}
                >
                  {t("common.all")}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                      selectedCategory === cat.slug
                        ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20"
                        : "bg-card border-border text-muted-foreground hover:border-brand-500/40 hover:text-foreground"
                    )}
                  >
                    {cat.name}
                    {cat.post_count > 0 && (
                      <span className="ml-1.5 opacity-60 text-xs">({cat.post_count})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Results count + clear ──────────────────────────────────── */}
          {!isLoading && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {posts.length > 0
                  ? `${data?.count ?? posts.length} article${(data?.count ?? posts.length) !== 1 ? "s" : ""}`
                  : ""}
              </p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  <X className="h-3 w-3" /> Clear filters
                </button>
              )}
            </div>
          )}

          {/* ── Content ───────────────────────────────────────────────── */}
          {isLoading ? (
            <SkeletonGrid />
          ) : posts.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
          ) : (
            <>
              {/* Featured post — only on first page with no filters */}
              <AnimatePresence>
                {featuredPost && page === 1 && !search && selectedCategory === "all" && (
                  <FeaturedPost post={featuredPost} readLabel={t("blog.read")} />
                )}
              </AnimatePresence>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i}
                    readLabel={t("blog.read")} minReadLabel={t("blog.min_read")} />
                ))}
              </div>
            </>
          )}

          {/* ── Pagination ────────────────────────────────────────────── */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-all"
              >
                ← {t("projects.previous")}
              </button>

              {Array.from({ length: Math.min(data.total_pages, 7) }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-sm font-medium transition-all",
                    pg === page
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                      : "border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-all"
              >
                {t("btn.next")} →
              </button>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
