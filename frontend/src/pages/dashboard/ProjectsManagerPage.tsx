import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, ExternalLink, Github,
  Star, StarOff, Eye, X, Upload, Loader2, ChevronLeft,
  ChevronRight, FolderKanban,
  CheckCircle2, Clock, Archive, AlertTriangle,
} from "lucide-react";
import { projectsApi } from "@/services/api/projects";
import type { Project, Category } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUSES = [
  { value: "all",       label: "All",       color: "" },
  { value: "published", label: "Published", color: "text-green-500" },
  { value: "draft",     label: "Draft",     color: "text-amber-500" },
  { value: "archived",  label: "Archived",  color: "text-muted-foreground" },
] as const;

type StatusFilter = "all" | "draft" | "published" | "archived";

function StatusBadge({ status }: { status: Project["status"] }) {
  const cfg = {
    published: { icon: CheckCircle2, label: "Published", cls: "bg-green-500/10 text-green-500 border-green-500/20" },
    draft:     { icon: Clock,        label: "Draft",     cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    archived:  { icon: Archive,      label: "Archived",  cls: "bg-muted/40 text-muted-foreground border-border" },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.cls}`}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </span>
  );
}

function useDebounce<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// ─── Tag input ─────────────────────────────────────────────────────────────

function TagInput({
  label, placeholder, tags, onChange,
}: { label: string; placeholder: string; tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-background min-h-[42px]">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 text-xs font-medium">
            {t}
            <button onClick={() => remove(t)} className="hover:text-red-400 transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={tags.length === 0 ? placeholder : "add more…"}
          className="flex-1 min-w-24 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Press Enter or comma to add</p>
    </div>
  );
}

// ─── Thumbnail upload ───────────────────────────────────────────────────────

function ThumbnailPicker({
  currentUrl, file, onFileChange,
}: { currentUrl?: string | null; file: File | null; onFileChange: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : currentUrl ?? null;

  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Thumbnail</label>
      <div
        onClick={() => ref.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden",
          preview ? "border-border h-44" : "border-border hover:border-brand-500/50 h-32 flex items-center justify-center"
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
              <span className="text-white text-sm ml-2">Change photo</span>
            </div>
            {file && (
              <button
                onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <Upload className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Click to upload thumbnail</p>
            <p className="text-xs mt-0.5">JPG, PNG, WebP — max 5 MB</p>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}

// ─── Project form modal ─────────────────────────────────────────────────────

interface FormState {
  title: string;
  short_description: string;
  description: string;
  category_id: number | "";
  tech_stack: string[];
  tags: string[];
  demo_url: string;
  github_url: string;
  case_study_url: string;
  client_name: string;
  completion_date: string;
  is_featured: boolean;
  status: Project["status"];
}

const EMPTY_FORM: FormState = {
  title: "", short_description: "", description: "", category_id: "",
  tech_stack: [], tags: [], demo_url: "", github_url: "",
  case_study_url: "", client_name: "", completion_date: "",
  is_featured: false, status: "draft",
};

function toFormState(p: Project): FormState {
  return {
    title: p.title,
    short_description: p.short_description,
    description: p.description,
    category_id: p.category?.id ?? "",
    tech_stack: p.tech_stack ?? [],
    tags: p.tags ?? [],
    demo_url: p.demo_url,
    github_url: p.github_url,
    case_study_url: p.case_study_url,
    client_name: p.client_name,
    completion_date: p.completion_date ?? "",
    is_featured: p.is_featured,
    status: p.status,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 transition-all";

function ProjectModal({
  project, categories, onClose,
}: { project: Project | null; categories: Category[]; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = project !== null;
  const [form, setForm] = useState<FormState>(isEdit ? toFormState(project!) : EMPTY_FORM);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [error, setError] = useState("");

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("short_description", form.short_description);
    fd.append("description", form.description);
    if (form.category_id !== "") fd.append("category_id", String(form.category_id));
    fd.append("demo_url", form.demo_url);
    fd.append("github_url", form.github_url);
    fd.append("case_study_url", form.case_study_url);
    fd.append("client_name", form.client_name);
    fd.append("completion_date", form.completion_date);
    fd.append("is_featured", String(form.is_featured));
    fd.append("status", form.status);
    form.tech_stack.forEach((t) => fd.append("tech_stack", t));
    form.tags.forEach((t) => fd.append("tags", t));
    if (thumbnail) fd.append("thumbnail", thumbnail);
    return fd;
  };

  const saveMut = useMutation({
    mutationFn: () => {
      const fd = buildFormData();
      return isEdit
        ? projectsApi.update(project!.slug, fd)
        : projectsApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-projects"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Failed to save project.");
    },
  });

  const isValid = form.title.trim().length > 0 && form.short_description.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-2xl h-full bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold">{isEdit ? "Edit Project" : "New Project"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit ? `Editing: ${project!.title}` : "Fill in the details below"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <ThumbnailPicker
            currentUrl={project?.thumbnail}
            file={thumbnail}
            onFileChange={setThumbnail}
          />

          <Field label="Title *">
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className={inputCls} placeholder="Project title" />
          </Field>

          <Field label="Short Description *">
            <textarea value={form.short_description} onChange={(e) => set("short_description", e.target.value)}
              rows={2} className={cn(inputCls, "resize-none")}
              placeholder="One-line summary shown in project cards" />
          </Field>

          <Field label="Full Description (Markdown)">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={8} className={cn(inputCls, "resize-y font-mono text-xs")}
              placeholder="## Overview&#10;&#10;Describe the project in detail…" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value === "" ? "" : Number(e.target.value))}
                className={inputCls}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value as Project["status"])}
                className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <TagInput label="Tech Stack" placeholder="React, Django, PostgreSQL…"
            tags={form.tech_stack} onChange={(v) => set("tech_stack", v)} />

          <TagInput label="Tags" placeholder="fintech, ai, saas…"
            tags={form.tags} onChange={(v) => set("tags", v)} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Client Name">
              <input value={form.client_name} onChange={(e) => set("client_name", e.target.value)}
                className={inputCls} placeholder="Client or company" />
            </Field>
            <Field label="Completion Date">
              <input type="date" value={form.completion_date} onChange={(e) => set("completion_date", e.target.value)}
                className={inputCls} />
            </Field>
          </div>

          <Field label="Demo URL">
            <input value={form.demo_url} onChange={(e) => set("demo_url", e.target.value)}
              className={inputCls} placeholder="https://demo.example.com" type="url" />
          </Field>

          <Field label="GitHub URL">
            <input value={form.github_url} onChange={(e) => set("github_url", e.target.value)}
              className={inputCls} placeholder="https://github.com/org/repo" type="url" />
          </Field>

          <Field label="Case Study URL">
            <input value={form.case_study_url} onChange={(e) => set("case_study_url", e.target.value)}
              className={inputCls} placeholder="https://…" type="url" />
          </Field>

          {/* Featured toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
            <div>
              <p className="text-sm font-semibold">Featured Project</p>
              <p className="text-xs text-muted-foreground">Show prominently on the homepage</p>
            </div>
            <button
              onClick={() => set("is_featured", !form.is_featured)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                form.is_featured ? "bg-brand-500" : "bg-muted"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                form.is_featured ? "left-6" : "left-1"
              )} />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0 bg-card/80 backdrop-blur">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={() => saveMut.mutate()}
            disabled={!isValid || saveMut.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saveMut.isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete confirm ─────────────────────────────────────────────────────────

function DeleteDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: () => projectsApi.delete(project.slug),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-projects"] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="text-lg font-bold mb-1">Delete Project</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{project.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={() => del.mutate()}
            disabled={del.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {del.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {del.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Project row ────────────────────────────────────────────────────────────

function ProjectRow({
  project, onEdit, onDelete,
}: { project: Project; onEdit: () => void; onDelete: () => void }) {
  const qc = useQueryClient();

  const toggleFeatured = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("is_featured", String(!project.is_featured));
      return projectsApi.update(project.slug, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-projects"] }),
  });

  const cycleStatus = useMutation({
    mutationFn: () => {
      const next: Project["status"] = project.status === "draft" ? "published"
        : project.status === "published" ? "archived" : "draft";
      const fd = new FormData();
      fd.append("status", next);
      return projectsApi.update(project.slug, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-projects"] }),
  });

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border hover:bg-accent/30 transition-colors group"
    >
      {/* Thumbnail */}
      <td className="pl-4 pr-3 py-3 w-[80px]">
        <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderKanban className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </td>

      {/* Title + description */}
      <td className="py-3 pr-4 min-w-[200px] max-w-[280px]">
        <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{project.short_description}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {project.tech_stack?.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-accent text-muted-foreground text-[10px] font-medium">
              {t}
            </span>
          ))}
          {(project.tech_stack?.length ?? 0) > 3 && (
            <span className="px-1.5 py-0.5 rounded bg-accent text-muted-foreground text-[10px]">
              +{project.tech_stack.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="py-3 pr-4 hidden md:table-cell">
        {project.category ? (
          <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: project.category.color + "22", color: project.category.color }}>
            {project.category.name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Client */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">{project.client_name || "—"}</span>
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <button onClick={() => cycleStatus.mutate()} title="Click to cycle status" className="hover:opacity-80 transition-opacity">
          <StatusBadge status={project.status} />
        </button>
      </td>

      {/* Featured */}
      <td className="py-3 pr-4 text-center hidden sm:table-cell">
        <button
          onClick={() => toggleFeatured.mutate()}
          className={cn(
            "transition-colors",
            project.is_featured ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground/30 hover:text-amber-400"
          )}
          title={project.is_featured ? "Unfeature" : "Feature"}
        >
          {project.is_featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
        </button>
      </td>

      {/* Views */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" /> {project.views_count.toLocaleString()}
        </span>
      </td>

      {/* Date */}
      <td className="py-3 pr-4 hidden xl:table-cell">
        <span className="text-xs text-muted-foreground">
          {project.completion_date
            ? new Date(project.completion_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : new Date(project.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-3.5 w-3.5" />
            </a>
          )}
          <button onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-500/10 text-muted-foreground hover:text-brand-400 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function ProjectsManagerPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [editProject, setEditProject] = useState<Project | null | "new">(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter]);

  const params: Record<string, string | number | boolean> = { page, page_size: 15 };
  if (debouncedSearch)     params.search = debouncedSearch;
  if (statusFilter !== "all") params.status = statusFilter;
  if (categoryFilter !== "") params.category = categoryFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-projects", params],
    queryFn: () => projectsApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: catsData } = useQuery({
    queryKey: ["project-categories"],
    queryFn: () => projectsApi.categories.list().then((r) => r.data),
    staleTime: 120_000,
  });

  const projects = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 15);
  const categories: Category[] = (catsData?.results ?? []) as Category[];

  // Stats from the full list (regardless of filter)
  const { data: allData } = useQuery({
    queryKey: ["dashboard-projects-all-stats"],
    queryFn: () => projectsApi.list({ page_size: 1000 }).then((r) => r.data),
    staleTime: 60_000,
  });
  const allProjects = allData?.results ?? [];
  const stats = {
    total:     allProjects.length,
    published: allProjects.filter((p) => p.status === "published").length,
    draft:     allProjects.filter((p) => p.status === "draft").length,
    featured:  allProjects.filter((p) => p.is_featured).length,
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-brand-400" /> Projects
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage portfolio projects — create, edit, publish, and organise
          </p>
        </div>
        <button
          onClick={() => setEditProject("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: stats.total,     icon: FolderKanban, color: "text-brand-400", bg: "bg-brand-500/10" },
          { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-green-500",  bg: "bg-green-500/10" },
          { label: "Draft",     value: stats.draft,     icon: Clock,        color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Featured",  value: stats.featured,  icon: Star,         color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2.5 rounded-xl bg-card border border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value as StatusFilter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === s.value
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-card border border-border text-sm outline-none focus:border-brand-500/50 min-w-40"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="pl-4 pr-3 py-3 text-left w-[80px]" />
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Project</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Category</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Client</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="py-3 pr-4 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">★</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Views</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden xl:table-cell">Date</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="pl-4 pr-3 py-3"><div className="w-16 h-10 rounded-lg bg-muted animate-pulse" /></td>
                    <td className="py-3 pr-4">
                      <div className="h-4 w-40 bg-muted animate-pulse rounded mb-1.5" />
                      <div className="h-3 w-60 bg-muted animate-pulse rounded" />
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell"><div className="h-5 w-20 bg-muted animate-pulse rounded-lg" /></td>
                    <td className="py-3 pr-4 hidden lg:table-cell"><div className="h-3 w-24 bg-muted animate-pulse rounded" /></td>
                    <td className="py-3 pr-4"><div className="h-5 w-20 bg-muted animate-pulse rounded-full" /></td>
                    <td colSpan={4} />
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <FolderKanban className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No projects found</p>
                    {(search || statusFilter !== "all") && (
                      <button onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter(""); }}
                        className="mt-3 text-xs text-brand-400 hover:text-brand-300">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <ProjectRow
                    key={p.slug}
                    project={p}
                    onEdit={() => setEditProject(p)}
                    onDelete={() => setDeleteProject(p)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, totalCount)} of {totalCount} projects
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      pg === page ? "bg-brand-500 text-white" : "hover:bg-accent text-muted-foreground"
                    )}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editProject !== null && (
          <ProjectModal
            project={editProject === "new" ? null : editProject}
            categories={categories}
            onClose={() => setEditProject(null)}
          />
        )}
        {deleteProject && (
          <DeleteDialog project={deleteProject} onClose={() => setDeleteProject(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
