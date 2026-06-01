import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { projectsApi } from "@/services/api/projects";
import { useTranslation } from "@/hooks/useTranslation";
import type { Project } from "@/types";

function ProjectCard({ project, index, viewDetails }: { project: Project; index: number; viewDetails: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:border-brand-500/50 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-brand-900 to-brand-800 overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-brand-700/50">
              {project.title[0]}
            </span>
          </div>
        )}
        {/* Category badge */}
        {project.category && (
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: project.category.color }}
          >
            {project.category.name}
          </div>
        )}
        {/* Links overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.short_description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech_stack.slice(0, 4).map((tech) => (
            <span key={tech} className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground font-medium">
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 4 && (
            <span className="px-2 py-0.5 rounded text-xs bg-accent text-muted-foreground">
              +{project.tech_stack.length - 4}
            </span>
          )}
        </div>

        <Link
          to={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
        >
          {viewDetails} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export function FeaturedProjects() {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: () => projectsApi.featured().then((r) => r.data.results),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
              {t("projects.portfolio")}
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              <span className="gradient-text">{t("projects.featured_title")}</span>
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors whitespace-nowrap"
          >
            {t("projects.view_all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} viewDetails={t("projects.view_details")} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
