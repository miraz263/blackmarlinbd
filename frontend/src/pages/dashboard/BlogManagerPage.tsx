import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, X, Loader2,
  ChevronLeft, ChevronRight, FileText,
  Star, StarOff, Eye, Clock, CheckCircle2,
  Calendar, Upload, AlertTriangle,
} from "lucide-react";
import { blogApi } from "@/services/api/blog";
import type { BlogPost, BlogCategory } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BlogPost["status"] }) {
  const cfg = {
    published: { icon: CheckCircle2, label: "Published", cls: "bg-green-500/10 text-green-500 border-green-500/20" },
    draft:     { icon: Clock,        label: "Draft",     cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    scheduled: { icon: Calendar,     label: "Scheduled", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20"   },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.cls}`}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </span>
  );
}

function useDebounce<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ label, placeholder, tags, onChange }: {
  label: string; placeholder: string; tags: string[]; onChange: (t: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setInput(""); };
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-background min-h-[42px]">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 text-xs font-medium">
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-red-400 transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={tags.length === 0 ? placeholder : "add more…"}
          className="flex-1 min-w-24 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Press Enter or comma to add</p>
    </div>
  );
}

// ─── Cover image picker ───────────────────────────────────────────────────────

function CoverPicker({ currentUrl, file, onFileChange }: {
  currentUrl?: string | null; file: File | null; onFileChange: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : currentUrl ?? null;
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Cover Image</label>
      <div
        onClick={() => ref.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden",
          preview ? "border-border h-44" : "border-border hover:border-brand-500/50 h-32 flex items-center justify-center"
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Upload className="h-5 w-5 text-white" />
              <span className="text-white text-sm">Change cover</span>
            </div>
            {file && (
              <button onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <Upload className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Click to upload cover image</p>
            <p className="text-xs mt-0.5">JPG, PNG, WebP — max 5 MB</p>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  category_id: number | "";
  tags: string[];
  status: BlogPost["status"];
  is_featured: boolean;
  published_at: string;
  seo_title: string;
  seo_description: string;
}

const EMPTY: FormState = {
  title: "", excerpt: "", content: "", category_id: "",
  tags: [], status: "draft", is_featured: false,
  published_at: "", seo_title: "", seo_description: "",
};

function toForm(p: BlogPost): FormState {
  return {
    title: p.title, excerpt: p.excerpt, content: p.content,
    category_id: p.category?.id ?? "",
    tags: p.tags ?? [],
    status: p.status, is_featured: p.is_featured,
    published_at: p.published_at ? p.published_at.slice(0, 16) : "",
    seo_title: p.seo_title ?? "", seo_description: p.seo_description ?? "",
  };
}

const inputCls = "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 transition-all";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <button type="button" onClick={() => onChange(!value)}
        className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0", value ? "bg-brand-500" : "bg-muted")}>
        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", value ? "left-5" : "left-0.5")} />
      </button>
    </div>
  );
}

// ─── Character counter ────────────────────────────────────────────────────────

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  return (
    <span className={cn("text-[10px] tabular-nums", len > max ? "text-red-400" : len > max * 0.85 ? "text-amber-400" : "text-muted-foreground")}>
      {len}/{max}
    </span>
  );
}

// ─── Blog post modal ──────────────────────────────────────────────────────────

function BlogModal({ post, categories, onClose }: {
  post: BlogPost | null; categories: BlogCategory[]; onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = post !== null;
  const [form, setForm] = useState<FormState>(isEdit ? toForm(post) : EMPTY);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"content" | "seo">("content");

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value })), []);

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    if (form.category_id !== "") fd.append("category_id", String(form.category_id));
    form.tags.forEach((t) => fd.append("tags", t));
    fd.append("status", form.status);
    fd.append("is_featured", String(form.is_featured));
    if (form.published_at) fd.append("published_at", new Date(form.published_at).toISOString());
    if (form.seo_title)    fd.append("seo_title", form.seo_title);
    if (form.seo_description) fd.append("seo_description", form.seo_description);
    if (cover) fd.append("cover_image", cover);
    return fd;
  };

  const saveMut = useMutation({
    mutationFn: () => {
      const fd = buildFormData();
      return isEdit ? blogApi.update(post!.slug, fd) : blogApi.create(fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-blog"] }); onClose(); },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      if (typeof data === "string") { setError("Server error — check backend logs."); return; }
      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (typeof obj.detail === "string") { setError(obj.detail); return; }
        const first = Object.entries(obj).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(" · ");
        setError(first || "Failed to save post.");
      } else setError("Failed to save post.");
    },
  });

  const isValid = form.title.trim().length > 0 && form.excerpt.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-2xl h-full bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold">{isEdit ? "Edit Post" : "New Post"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit ? `Editing: ${post!.title}` : "Write a new blog post"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border shrink-0 px-6">
          {(["content", "seo"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("py-3 mr-6 text-sm font-medium border-b-2 transition-colors capitalize",
                tab === t ? "border-brand-500 text-brand-400" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t === "content" ? "Content" : "SEO & Meta"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {tab === "content" ? (
            <>
              <CoverPicker currentUrl={post?.cover_image} file={cover} onFileChange={setCover} />

              <Field label="Title *">
                <input value={form.title} onChange={(e) => set("title", e.target.value)}
                  className={inputCls} placeholder="Post title…" />
              </Field>

              <Field label="Excerpt *" hint="Shown in post cards and search results (max 500 chars)">
                <div>
                  <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                    rows={3} className={cn(inputCls, "resize-none")}
                    placeholder="A short summary of this post…" maxLength={500} />
                  <div className="flex justify-end mt-1">
                    <CharCount value={form.excerpt} max={500} />
                  </div>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={form.category_id} onChange={(e) => set("category_id", e.target.value === "" ? "" : Number(e.target.value))}
                    style={{ colorScheme: "dark" }} className={inputCls}>
                    <option value="">— None —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => set("status", e.target.value as BlogPost["status"])}
                    style={{ colorScheme: "dark" }} className={inputCls}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </Field>
              </div>

              {form.status === "scheduled" && (
                <Field label="Publish Date & Time">
                  <input type="datetime-local" value={form.published_at}
                    onChange={(e) => set("published_at", e.target.value)} className={inputCls} />
                </Field>
              )}

              <TagInput label="Tags" placeholder="ai, cloud, fintech…"
                tags={form.tags} onChange={(v) => set("tags", v)} />

              <Field label="Content * (Markdown)" hint="Full article content — Markdown supported">
                <textarea value={form.content} onChange={(e) => set("content", e.target.value)}
                  rows={16} className={cn(inputCls, "resize-y font-mono text-xs leading-relaxed")}
                  placeholder={"## Introduction\n\nWrite your article here…"} />
              </Field>

              <Toggle value={form.is_featured} onChange={(v) => set("is_featured", v)}
                label="Featured Post" desc="Shown in the featured section on the blog page" />
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-400">
                SEO fields override the title and excerpt for search engines. Leave blank to use the post defaults.
              </div>

              <Field label="SEO Title" hint="Ideal length: 50–60 characters">
                <input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)}
                  className={inputCls} placeholder={form.title || "SEO title…"} maxLength={70} />
                <div className="flex justify-end mt-1"><CharCount value={form.seo_title} max={70} /></div>
              </Field>

              <Field label="SEO Description" hint="Ideal length: 120–160 characters">
                <textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)}
                  rows={4} className={cn(inputCls, "resize-none")}
                  placeholder={form.excerpt || "Meta description…"} maxLength={160} />
                <div className="flex justify-end mt-1"><CharCount value={form.seo_description} max={160} /></div>
              </Field>

              {/* SERP preview */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Search Preview</label>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="text-[13px] text-blue-400 font-medium truncate">
                    {form.seo_title || form.title || "Post Title"}
                  </p>
                  <p className="text-[11px] text-green-600 dark:text-green-500 mt-0.5">
                    blackmarlinbd.com/blog/{post?.slug ?? "post-slug"}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">
                    {form.seo_description || form.excerpt || "Post description will appear here…"}
                  </p>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0 bg-card/80 backdrop-blur">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
          <button onClick={() => saveMut.mutate()} disabled={!isValid || saveMut.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors">
            {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveMut.isPending ? "Saving…" : isEdit ? "Save Changes" : "Publish Post"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: () => blogApi.delete(post.slug),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-blog"] }); onClose(); },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="text-lg font-bold mb-1">Delete Post</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{post.title}"</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
          <button onClick={() => del.mutate()} disabled={del.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
            {del.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {del.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Blog post row ────────────────────────────────────────────────────────────

function PostRow({ post, onEdit, onDelete }: { post: BlogPost; onEdit: () => void; onDelete: () => void }) {
  const qc = useQueryClient();

  const cycleStatus = useMutation({
    mutationFn: () => {
      const next: BlogPost["status"] = post.status === "draft" ? "published" : post.status === "published" ? "scheduled" : "draft";
      const fd = new FormData();
      fd.append("status", next);
      return blogApi.update(post.slug, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-blog"] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("is_featured", String(!post.is_featured));
      return blogApi.update(post.slug, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-blog"] }),
  });

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="border-b border-border hover:bg-accent/30 transition-colors group">

      {/* Cover thumbnail */}
      <td className="pl-4 pr-3 py-3 w-[72px]">
        <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
          {post.cover_image ? (
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </td>

      {/* Title + excerpt + tags */}
      <td className="py-3 pr-4 min-w-[220px] max-w-[320px]">
        <p className="text-sm font-semibold truncate">{post.title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {post.tags?.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-accent text-muted-foreground text-[10px]">{t}</span>
          ))}
          {(post.tags?.length ?? 0) > 3 && (
            <span className="text-[10px] text-muted-foreground/60">+{post.tags.length - 3}</span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="py-3 pr-4 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">{post.category?.name ?? "—"}</span>
      </td>

      {/* Author */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            {post.author?.first_name?.[0] ?? post.author?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {post.author?.first_name ? `${post.author.first_name} ${post.author.last_name}` : post.author?.email ?? "—"}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <button onClick={() => cycleStatus.mutate()} title="Click to cycle status" className="hover:opacity-80 transition-opacity">
          <StatusBadge status={post.status} />
        </button>
      </td>

      {/* Featured */}
      <td className="py-3 pr-4 text-center hidden sm:table-cell">
        <button onClick={() => toggleFeatured.mutate()}
          className={cn("transition-colors", post.is_featured ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground/30 hover:text-amber-400")}>
          {post.is_featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
        </button>
      </td>

      {/* Views + read time */}
      <td className="py-3 pr-4 hidden xl:table-cell">
        <div className="space-y-0.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" /> {post.views_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" /> {post.read_time} min
          </span>
        </div>
      </td>

      {/* Date */}
      <td className="py-3 pr-4 hidden xl:table-cell">
        <span className="text-[11px] text-muted-foreground">
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : new Date(post.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

// ─── Main page ────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "published" | "draft" | "scheduled";

export default function BlogManagerPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [editPost, setEditPost] = useState<BlogPost | null | "new">(null);
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  useEffect(() => setPage(1), [debouncedSearch, statusFilter, categoryFilter]);

  const params: Record<string, string | number | boolean> = { page, page_size: 15 };
  if (debouncedSearch)        params.search = debouncedSearch;
  if (statusFilter !== "all") params.status = statusFilter;
  if (categoryFilter !== "")  params.category = categoryFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-blog", params],
    queryFn: () => blogApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: catsData } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.categories.list().then((r) => r.data),
    staleTime: 120_000,
  });

  const { data: allData } = useQuery({
    queryKey: ["dashboard-blog-stats"],
    queryFn: () => blogApi.list({ page_size: 1000 }).then((r) => r.data),
    staleTime: 60_000,
  });

  const posts = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 15);
  const categories = (catsData?.results ?? []) as BlogCategory[];
  const allPosts = allData?.results ?? [];

  const stats = {
    total:     allPosts.length,
    published: allPosts.filter((p) => p.status === "published").length,
    draft:     allPosts.filter((p) => p.status === "draft").length,
    scheduled: allPosts.filter((p) => p.status === "scheduled").length,
    featured:  allPosts.filter((p) => p.is_featured).length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand-400" /> Blog
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Write and manage blog posts — draft, publish, schedule, and feature</p>
        </div>
        <button onClick={() => setEditPost("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",     value: stats.total,     icon: FileText,     color: "text-brand-400",        bg: "bg-brand-500/10" },
          { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-green-500",         bg: "bg-green-500/10" },
          { label: "Draft",     value: stats.draft,     icon: Clock,        color: "text-amber-500",         bg: "bg-amber-500/10" },
          { label: "Scheduled", value: stats.scheduled, icon: Calendar,     color: "text-blue-400",          bg: "bg-blue-500/10"  },
          { label: "Featured",  value: stats.featured,  icon: Star,         color: "text-amber-400",         bg: "bg-amber-500/10" },
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

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2.5 rounded-xl bg-card border border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…"
            className="flex-1 bg-transparent text-sm outline-none" />
          {search && <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
        </div>

        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
          {(["all", "published", "draft", "scheduled"] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                statusFilter === s ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))}
            style={{ colorScheme: "dark" }}
            className="px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-brand-500/50 min-w-40">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="pl-4 pr-3 py-3 w-[72px]" />
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Post</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Category</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Author</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="py-3 pr-4 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">★</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden xl:table-cell">Stats</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden xl:table-cell">Date</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="pl-4 pr-3 py-3"><div className="w-14 h-10 rounded-lg bg-muted animate-pulse" /></td>
                    <td className="py-3 pr-4">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded mb-1.5" />
                      <div className="h-3 w-64 bg-muted animate-pulse rounded" />
                    </td>
                    <td colSpan={7} />
                  </tr>
                ))
                : posts.length === 0
                  ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">No posts found</p>
                        {(search || statusFilter !== "all" || categoryFilter !== "") && (
                          <button onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter(""); }}
                            className="mt-3 text-xs text-brand-400 hover:text-brand-300">Clear filters</button>
                        )}
                      </td>
                    </tr>
                  )
                  : posts.map((p) => (
                    <PostRow key={p.id} post={p} onEdit={() => setEditPost(p)} onDelete={() => setDeletePost(p)} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, totalCount)} of {totalCount} posts
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pg) => (
                <button key={pg} onClick={() => setPage(pg)}
                  className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    pg === page ? "bg-brand-500 text-white" : "hover:bg-accent text-muted-foreground")}>
                  {pg}
                </button>
              ))}
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editPost !== null && (
          <BlogModal post={editPost === "new" ? null : editPost} categories={categories} onClose={() => setEditPost(null)} />
        )}
        {deletePost && (
          <DeleteDialog post={deletePost} onClose={() => setDeletePost(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
