import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, ExternalLink, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { projectsApi } from "@/services/api/projects";
import { useTranslation } from "@/hooks/useTranslation";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
      projectsApi
        .list({
          ...(selectedCategory !== "all" && { category: selectedCategory }),
          ...(search && { search }),
          page,
        })
        .then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <>
      <SEOHead
        pageKey="projects"
        fallback={{
          title: "Projects — BlackMarlinBD",
          description: "Explore our portfolio of enterprise software projects.",
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
              {t("projects.portfolio")}
            </span>
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">{t("projects.page_title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("projects.page_subtitle")}
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {/* Search */}
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

            {/* Category tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setSelectedCategory("all"); setPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedCategory === "all"
                    ? "bg-brand-500 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t("common.all")}
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    selectedCategory === cat.slug
                      ? "bg-brand-500 text-white"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
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
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.results.map((project: Project, i: number) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
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
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.short_description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tech_stack.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">{t}</span>
                        ))}
                      </div>
                      <Link to={`/projects/${project.slug}`} className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 font-medium">
                        {t("projects.view_details")} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {projects && projects.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors text-sm"
                  >
                    {t("projects.previous")}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {projects.total_pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(projects.total_pages, p + 1))}
                    disabled={page === projects.total_pages}
                    className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors text-sm"
                  >
                    {t("btn.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
