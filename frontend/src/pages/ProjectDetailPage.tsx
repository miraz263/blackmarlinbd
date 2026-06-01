import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft, ExternalLink, Github, Calendar, User,
  Tag, Layers, Eye, BookOpen,
} from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { projectsApi } from "@/services/api/projects";

function TechBadge({ name }: { name: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
      {name}
    </span>
  );
}

function Tag_({ name }: { name: string }) {
  return (
    <span className="px-2.5 py-1 rounded-md text-xs bg-accent text-accent-foreground">
      #{name}
    </span>
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => projectsApi.get(slug!).then((r) => r.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-accent rounded" />
            <div className="h-72 rounded-2xl bg-accent" />
            <div className="h-8 w-2/3 bg-accent rounded" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-accent rounded" />)}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !project) {
    return (
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Project not found</h1>
          <p className="text-muted-foreground mb-8">This project doesn't exist or has been removed.</p>
          <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </div>
      </main>
    );
  }

  const categoryColor = project.category?.color ?? "#6366f1";

  return (
    <>
      <SEOHead
        pageKey="projects"
        overrides={{
          title: `${project.title} — BlackMarlinBD`,
          description: project.short_description,
          ogType: "article",
          ogImage: project.thumbnail ?? undefined,
        }}
      />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Projects
            </Link>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden mb-10 aspect-video relative"
            style={{ background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}44)` }}
          >
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-bold text-white/80 shadow-2xl"
                  style={{ background: categoryColor }}
                >
                  {project.title[0]}
                </div>
                <div className="flex flex-wrap gap-2 justify-center px-8">
                  {project.tech_stack.slice(0, 6).map((t) => (
                    <span key={t} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur text-white border border-white/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {project.category && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 border"
                    style={{ color: categoryColor, borderColor: `${categoryColor}44`, background: `${categoryColor}15` }}
                  >
                    {project.category.name}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{project.title}</h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{project.short_description}</p>

                {/* Gallery */}
                {project.images && project.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-10">
                    {project.images.map((img) => (
                      <div key={img.id} className="rounded-xl overflow-hidden aspect-video bg-accent">
                        <img src={img.image} alt={img.alt_text || project.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Description (markdown) */}
                <div className="prose prose-invert prose-brand max-w-none
                  prose-headings:font-semibold prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
                  prose-code:text-brand-300 prose-code:bg-brand-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-xl
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                  prose-li:marker:text-brand-400
                  prose-table:text-sm prose-thead:border-border prose-tbody:border-border
                  prose-th:text-foreground prose-th:font-semibold prose-th:p-3
                  prose-td:p-3 prose-td:text-muted-foreground
                  prose-hr:border-border
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.description}
                  </ReactMarkdown>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Tag className="h-4 w-4" /> Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => <Tag_ key={tag} name={tag} />)}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              {/* Action buttons */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-accent border border-border font-medium text-sm transition-colors"
                  >
                    <Github className="h-4 w-4" /> Source Code
                  </a>
                )}
                {project.case_study_url && (
                  <a
                    href={project.case_study_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-accent border border-border font-medium text-sm transition-colors"
                  >
                    <BookOpen className="h-4 w-4" /> Case Study
                  </a>
                )}
              </div>

              {/* Project info */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Project Info</h3>

                {project.client_name && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Client</p>
                      <p className="text-sm font-medium">{project.client_name}</p>
                    </div>
                  </div>
                )}

                {project.completion_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-sm font-medium">
                        {new Date(project.completion_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}

                {project.category && (
                  <div className="flex items-start gap-3">
                    <Layers className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="text-sm font-medium">{project.category.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="text-sm font-medium">{project.views_count.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Tech stack */}
              {project.tech_stack.length > 0 && (
                <div className="rounded-2xl bg-card border border-border p-5">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((t) => <TechBadge key={t} name={t} />)}
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      </main>
    </>
  );
}
