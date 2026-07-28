import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, Upload, X, Loader2, Eye, PenLine,
  Tag, Hash, Image as ImageIcon, BookOpen,
  CheckCircle2, Clock, AlertTriangle, Save, Send,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { blogApi } from "@/services/api/blog";
import { useAuthStore } from "@/store/authStore";
import { WorkflowStatusPanel } from "@/components/workflow/WorkflowStatusPanel";
import type { BlogPost, BlogCategory } from "@/types";
import { cn } from "@/lib/utils";

// ─── Suggested tags ──────────────────────────────────────────────────────────

const SUGGESTED_TAGS = [
  "software-development",
  "custom-software",
  "enterprise-software",
  "artificial-intelligence",
  "cloud-computing",
  "digital-transformation",
  "blackmarlin-technologies",
  "technology",
  "business-software",
];

// ─── Auth guard ─────────────────────────────────────────────────────────────

function useWriteAccess() {
  const { user, isAuthenticated } = useAuthStore();
  const isEditor = user?.role === "admin" || user?.role === "editor";
  // Any signed-in user can write — non-editors just need admin approval before it's published.
  const canWrite = isAuthenticated;
  return { canWrite, isEditor };
}

// ─── Cover image picker ─────────────────────────────────────────────────────

function CoverPicker({ preview, onChange }: { preview: string | null; onChange: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className={cn(
        "relative w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden group",
        preview
          ? "border-transparent h-64 sm:h-80"
          : "border-border hover:border-brand-500/50 h-40 flex items-center justify-center bg-card/50"
      )}
    >
      {preview ? (
        <>
          <img src={preview} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-white text-sm font-medium border border-white/20">
              <Upload className="h-4 w-4" /> Change Cover
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <div className="text-center text-muted-foreground py-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="h-7 w-7 text-brand-400" />
          </div>
          <p className="text-sm font-medium text-foreground">Add a cover image</p>
          <p className="text-xs mt-1">Click to upload · JPG, PNG, WebP · Max 5 MB</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}

// ─── Tag input ───────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim().toLowerCase();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-border bg-background/50 min-h-[44px] focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-medium border border-brand-500/20">
          <Hash className="h-2.5 w-2.5" />{t}
          <button onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-red-400 transition-colors ml-0.5">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        placeholder={tags.length === 0 ? "Add tags (press Enter)…" : ""}
        className="flex-1 min-w-24 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

// ─── Markdown preview ─────────────────────────────────────────────────────────

function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40">
        <Eye className="h-10 w-10 mb-3" />
        <p className="text-sm">Nothing to preview yet</p>
      </div>
    );
  }
  const html = content
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-bold mt-6 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-8 mb-3'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mt-8 mb-4'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='px-1.5 py-0.5 rounded bg-muted text-sm font-mono'>$1</code>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li class='ml-4 list-decimal'>$2</li>")
    .replace(/\n\n/g, "</p><p class='mb-4 leading-relaxed text-muted-foreground'>")
    .replace(/\n/g, "<br />");
  return (
    <div
      className="prose prose-sm max-w-none text-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class='mb-4 leading-relaxed text-muted-foreground'>${html}</p>` }}
    />
  );
}

// ─── Collapsible sidebar section ──────────────────────────────────────────────

function SideSection({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-400" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">{children}</div>}
    </div>
  );
}

// ─── Character counter ────────────────────────────────────────────────────────

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  return (
    <span className={cn("text-[10px] tabular-nums",
      len > max ? "text-red-400" : len > max * 0.85 ? "text-amber-400" : "text-muted-foreground")}>
      {len}/{max}
    </span>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl bg-background/50 border border-border text-foreground text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 placeholder:text-muted-foreground/50 transition-all";

// ─── Form state ──────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  category_id: number | "";
  tags: string[];
  status: BlogPost["status"];
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
}

const EMPTY: FormState = {
  title: "", excerpt: "", content: "", category_id: "",
  tags: [], status: "draft", is_featured: false,
  seo_title: "", seo_description: "",
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlogWritePage() {
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const editSlug     = params.get("edit");
  const { canWrite, isEditor } = useWriteAccess();
  const qc           = useQueryClient();

  const [form, setForm]       = useState<FormState>(EMPTY);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [error, setError]     = useState("");
  const [saved, setSaved]     = useState(false);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value })), []);

  // Load post if editing
  const { data: existingPost } = useQuery({
    queryKey: ["blog-edit", editSlug],
    queryFn: () => blogApi.get(editSlug!).then((r) => r.data),
    enabled: !!editSlug,
  });

  useEffect(() => {
    if (existingPost) {
      setForm({
        title: existingPost.title,
        excerpt: existingPost.excerpt,
        content: existingPost.content,
        category_id: existingPost.category?.id ?? "",
        tags: existingPost.tags ?? [],
        status: existingPost.status,
        is_featured: existingPost.is_featured,
        seo_title: existingPost.seo_title ?? "",
        seo_description: existingPost.seo_description ?? "",
      });
      if (existingPost.cover_image) setCoverPreview(existingPost.cover_image);
    }
  }, [existingPost]);

  // Cover preview
  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (!existingPost?.cover_image) {
      setCoverPreview(null);
    }
  }, [coverFile, existingPost]);

  const { data: catsData } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.categories.list().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
  const categories: BlogCategory[] = catsData?.results ?? [];

  const buildFormData = (status: BlogPost["status"]): FormData => {
    const fd = new FormData();
    fd.append("title",   form.title);
    fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    if (form.category_id !== "") fd.append("category_id", String(form.category_id));
    // Send at least one empty string so the field is present; backend treats "" as no tag
    if (form.tags.length > 0) {
      form.tags.forEach((t) => fd.append("tags", t));
    } else {
      fd.append("tags", "");
    }
    fd.append("status",      status);
    fd.append("is_featured", String(form.is_featured));
    if (form.seo_title)       fd.append("seo_title",       form.seo_title);
    if (form.seo_description) fd.append("seo_description", form.seo_description);
    if (coverFile)            fd.append("cover_image",     coverFile);
    return fd;
  };

  const saveMut = useMutation({
    mutationFn: (status: BlogPost["status"]) => {
      const fd = buildFormData(status);
      return editSlug
        ? blogApi.update(editSlug, fd)
        : blogApi.create(fd);
    },
    onSuccess: (res, status) => {
      qc.invalidateQueries({ queryKey: ["blog"] });
      qc.invalidateQueries({ queryKey: ["dashboard-blog"] });
      if (status === "published") {
        navigate(`/blog/${res.data.slug}`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (!editSlug) navigate(`/blog/write?edit=${res.data.slug}`, { replace: true });
      }
    },
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

  // Redirect if not authorized
  if (!canWrite) {
    return (
      <main className="pt-28 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to write a blog post.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 min-h-screen">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Back */}
            <Link to="/blog"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Blog</span>
            </Link>

            {/* Title preview */}
            <p className="text-sm font-medium text-muted-foreground truncate hidden md:block flex-1 text-center">
              {form.title || "Untitled Post"}
            </p>

            {/* Status + Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Status indicator */}
              {isEditor && (
                <span className={cn(
                  "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                  form.status === "published"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {form.status === "published"
                    ? <><CheckCircle2 className="h-3 w-3" /> Published</>
                    : <><Clock className="h-3 w-3" /> Draft</>}
                </span>
              )}

              {saved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-green-500 font-medium"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </motion.span>
              )}

              {error && (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> {error}
                </span>
              )}

              {/* Save Draft */}
              <button
                onClick={() => { setError(""); saveMut.mutate("draft"); }}
                disabled={!isValid || saveMut.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-all"
              >
                {saveMut.isPending && saveMut.variables === "draft"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Save className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Save Draft</span>
              </button>

              {/* Publish — editors/admins only; others submit for review instead */}
              {isEditor && (
                <button
                  onClick={() => { setError(""); saveMut.mutate("published"); }}
                  disabled={!isValid || saveMut.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-40 transition-all shadow-md shadow-brand-500/20"
                >
                  {saveMut.isPending && saveMut.variables === "published"
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Send className="h-3.5 w-3.5" />}
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {/* ── Main editor (2/3) ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cover image */}
            <CoverPicker
              preview={coverPreview}
              onChange={(f) => {
                setCoverFile(f);
                if (!f) setCoverPreview(existingPost?.cover_image ?? null);
              }}
            />

            {/* Title */}
            <div>
              <textarea
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Post title…"
                rows={2}
                className="w-full bg-transparent text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted-foreground/30 outline-none resize-none leading-tight border-none p-0"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                Excerpt <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  rows={3}
                  placeholder="A short description shown in blog cards and search results…"
                  maxLength={500}
                  className={cn(inputCls, "resize-none")}
                />
                <div className="flex justify-end mt-1">
                  <CharCount value={form.excerpt} max={500} />
                </div>
              </div>
            </div>

            {/* Content editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Content</label>
                <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-lg">
                  <button onClick={() => setEditorTab("write")}
                    className={cn("flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                      editorTab === "write" ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground")}>
                    <PenLine className="h-3 w-3" /> Write
                  </button>
                  <button onClick={() => setEditorTab("preview")}
                    className={cn("flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                      editorTab === "preview" ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground")}>
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>

              {editorTab === "write" ? (
                <textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  rows={24}
                  placeholder={"## Introduction\n\nStart writing your post here…\n\nMarkdown is supported:\n- **Bold**, *italic*, `code`\n- ## Headings\n- - Lists"}
                  className={cn(inputCls, "resize-y font-mono text-sm leading-relaxed min-h-[400px]")}
                />
              ) : (
                <div className="min-h-[400px] p-5 rounded-xl border border-border bg-card/50">
                  <MarkdownPreview content={form.content} />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Markdown supported: **bold**, *italic*, `code`, ## Heading, - list items
              </p>
            </div>

          </div>

          {/* ── Sidebar (1/3) ────────────────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">

            {isEditor ? (
              /* Publishing — editors/admins publish directly */
              <SideSection title="Publishing" icon={Send}>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value as BlogPost["status"])}
                    style={{ colorScheme: "dark" }} className={inputCls}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50">
                  <div>
                    <p className="text-sm font-medium">Featured Post</p>
                    <p className="text-[11px] text-muted-foreground">Show in featured section</p>
                  </div>
                  <button type="button" onClick={() => set("is_featured", !form.is_featured)}
                    className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0", form.is_featured ? "bg-brand-500" : "bg-muted")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", form.is_featured ? "left-5" : "left-0.5")} />
                  </button>
                </div>
              </SideSection>
            ) : existingPost?.id ? (
              /* Everyone else submits the draft for admin review */
              <WorkflowStatusPanel appLabel="blog" modelName="blogpost" objectId={existingPost.id} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center">
                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Save your draft first — you'll be able to submit it for admin review here.
                </p>
              </div>
            )}

            {/* Category & Tags */}
            <SideSection title="Category & Tags" icon={Tag}>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                <select value={form.category_id}
                  onChange={(e) => set("category_id", e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ colorScheme: "dark" }} className={inputCls}>
                  <option value="">— None —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags</label>
                <TagInput tags={form.tags} onChange={(v) => set("tags", v)} />

                {/* Suggested tags */}
                <div className="mt-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
                    Suggested
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TAGS.map((tag) => {
                      const active = form.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            set("tags", active
                              ? form.tags.filter((t) => t !== tag)
                              : [...form.tags, tag])
                          }
                          className={cn(
                            "px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all",
                            active
                              ? "bg-brand-500/20 text-brand-400 border-brand-500/40"
                              : "bg-muted/30 text-muted-foreground border-border hover:border-brand-500/30 hover:text-foreground"
                          )}
                        >
                          {active ? "✓ " : "# "}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SideSection>

            {/* SEO */}
            <SideSection title="SEO & Meta" icon={BookOpen} defaultOpen={false}>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">SEO Title</label>
                <input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)}
                  className={inputCls} placeholder={form.title || "SEO title…"} maxLength={70} />
                <div className="flex justify-end mt-1"><CharCount value={form.seo_title} max={70} /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Meta Description</label>
                <textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)}
                  rows={3} className={cn(inputCls, "resize-none")}
                  placeholder={form.excerpt || "Meta description…"} maxLength={160} />
                <div className="flex justify-end mt-1"><CharCount value={form.seo_description} max={160} /></div>
              </div>

              {/* SERP preview */}
              <div className="p-3 rounded-xl bg-background border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Search Preview</p>
                <p className="text-[13px] text-blue-400 font-medium truncate">
                  {form.seo_title || form.title || "Post Title"}
                </p>
                <p className="text-[11px] text-green-600 dark:text-green-500 mt-0.5">
                  blackmarlinbd.com/blog/…
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">
                  {form.seo_description || form.excerpt || "Description will appear here…"}
                </p>
              </div>
            </SideSection>

            {/* Validation error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            {/* Bottom action buttons */}
            <div className="flex flex-col gap-2">
              {isEditor && (
                <button
                  onClick={() => { setError(""); saveMut.mutate("published"); }}
                  disabled={!isValid || saveMut.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-40 transition-all shadow-lg shadow-brand-500/20"
                >
                  {saveMut.isPending && saveMut.variables === "published"
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />}
                  Publish Post
                </button>
              )}
              <button
                onClick={() => { setError(""); saveMut.mutate("draft"); }}
                disabled={!isValid || saveMut.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-all"
              >
                {saveMut.isPending && saveMut.variables === "draft"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Save className="h-3.5 w-3.5" />}
                Save as Draft
              </button>
              {!isEditor && (
                <p className="text-[11px] text-muted-foreground text-center px-2">
                  {existingPost?.id
                    ? "Ready? Submit it for review from the panel above."
                    : "Save a draft, then submit it for admin review."}
                </p>
              )}
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}
