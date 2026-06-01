import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Clock, Eye, ArrowRight, Search } from "lucide-react";
import { blogApi } from "@/services/api/blog";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function BlogPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.categories.list().then((r) => r.data.results),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["blog", search, selectedCategory, page],
    queryFn: () =>
      blogApi
        .list({
          ...(search && { search }),
          ...(selectedCategory !== "all" && { category__slug: selectedCategory }),
          page,
        })
        .then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">{t("blog.page_title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("blog.page_subtitle")}
            </p>
          </motion.div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("blog.search_placeholder")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === "all" ? "bg-brand-500 text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
              >
                {t("common.all")}
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.slug ? "bg-brand-500 text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.results.map((post: BlogPost, i: number) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-brand-500/50 transition-all duration-300"
                >
                  {/* Cover */}
                  <div className="relative h-48 bg-gradient-to-br from-brand-900 to-cyan-900 overflow-hidden">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-white/10">{post.title[0]}</span>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-brand-500 text-white text-xs font-medium">
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.read_time} {t("blog.min_read")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views_count}
                      </span>
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                    <h2 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                          {post.author?.first_name?.[0] || "A"}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {post.author?.first_name} {post.author?.last_name}
                        </span>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium"
                      >
                        {t("blog.read")} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors text-sm">
                {t("projects.previous")}
              </button>
              <span className="text-sm text-muted-foreground">{page} / {data.total_pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))} disabled={page === data.total_pages}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors text-sm">
                {t("btn.next")}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
