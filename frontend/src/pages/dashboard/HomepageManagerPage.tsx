import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, Trash2, Pencil, X, Loader2,
  Home, BarChart2, MousePointerClick, GripVertical,
  Upload, Image as ImageIcon,
} from "lucide-react";
import { useRef } from "react";
import { homepageService, homepageKeys } from "@/services/homepageService";
import type { HeroSection, HeroButton, StatisticCard } from "@/types";
import { cn } from "@/lib/utils";

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-muted-foreground/50";
const textareaCls = `${inputCls} resize-none`;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function SaveBar({ dirty, saving, onSave }: { dirty: boolean; saving: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center justify-end pt-5 border-t border-border mt-5">
      <button onClick={onSave} disabled={!dirty || saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium shadow-lg">
      {msg}
    </motion.div>
  );
}

function Skeleton() {
  return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-accent animate-pulse" />)}</div>;
}

// ─── Tab: Hero ────────────────────────────────────────────────────────────────

function HeroTab() {
  const qc      = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast,       setToast]       = useState(false);
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const { data: raw, isLoading } = useQuery({
    queryKey: homepageKeys.all,
    queryFn: () => homepageService.getAll().then((r) => r.data),
    staleTime: 60_000,
  });

  const [form, setForm] = useState<Partial<HeroSection>>({
    badge_text: "", title: "", subtitle: "", description: "", video_url: "",
  });
  const [saved, setSaved] = useState(form);

  useEffect(() => {
    if (!raw?.hero) return;
    const next: Partial<HeroSection> = {
      badge_text:  raw.hero.badge_text  ?? "",
      title:       raw.hero.title        ?? "",
      subtitle:    raw.hero.subtitle     ?? "",
      description: raw.hero.description  ?? "",
      video_url:   raw.hero.video_url    ?? "",
    };
    setForm(next);
    setSaved(next);
    if (raw.hero.background_image_url) setImagePreview(raw.hero.background_image_url);
  }, [raw?.hero]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved) || !!imageFile || removeImage;
  const set   = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setRemoveImage(false);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(raw?.hero?.background_image_url ?? null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const save = useMutation({
    mutationFn: () => {
      if (imageFile || removeImage) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== undefined) fd.append(k, String(v)); });
        if (imageFile)    fd.append("background_image", imageFile);
        if (removeImage)  fd.append("background_image", "");
        return homepageService.updateHero(fd);
      }
      return homepageService.updateHero(form);
    },
    onSuccess: () => {
      setSaved(form);
      setImageFile(null);
      setRemoveImage(false);
      qc.invalidateQueries({ queryKey: homepageKeys.all });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-5">

      {/* ── Hero Image ─────────────────────────────────────────────── */}
      <Field label="Hero Background / Title Image" hint="Shown as the hero section background or beside the title">
        <div
          onClick={() => !imagePreview && fileRef.current?.click()}
          className={cn(
            "relative w-full rounded-2xl border-2 border-dashed overflow-hidden transition-all",
            imagePreview
              ? "border-border h-52 cursor-default"
              : "border-border hover:border-brand-500/50 h-36 flex items-center justify-center cursor-pointer bg-background/50"
          )}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <Upload className="h-4 w-4" /> Change Image
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/70 backdrop-blur text-white text-sm font-medium hover:bg-red-500 transition-colors"
                >
                  <X className="h-4 w-4" /> Remove
                </button>
              </div>
              {/* Corner badge */}
              {imageFile && (
                <span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-brand-500 text-white text-[10px] font-semibold">
                  New — unsaved
                </span>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="h-6 w-6 text-brand-400" />
              </div>
              <p className="text-sm font-medium text-foreground">Upload hero image</p>
              <p className="text-xs mt-1">Click to browse · JPG, PNG, WebP · Max 5 MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
        />
      </Field>

      {/* ── Text fields ────────────────────────────────────────────── */}
      <Field label="Badge Text" hint='The pill above the title — e.g. "Trusted by Fortune 500 Companies"'>
        <input className={inputCls} value={form.badge_text ?? ""} onChange={(e) => set("badge_text", e.target.value)} placeholder="Trusted by Fortune 500 Companies" />
      </Field>
      <Field label="Hero Title">
        <textarea className={textareaCls} rows={3} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="We Build Intelligent Systems That Scale" />
      </Field>
      <Field label="Subtitle" hint="Optional — smaller text beneath the title">
        <input className={inputCls} value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="Optional subtitle" />
      </Field>
      <Field label="Description">
        <textarea className={textareaCls} rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="BlackMarlinBD is a global IT firm…" />
      </Field>
      <Field label="Video URL" hint="Optional — used for a 'Watch Demo' modal or background">
        <input className={inputCls} value={form.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)} placeholder="https://youtube.com/…" />
      </Field>

      <SaveBar dirty={dirty} saving={save.isPending} onSave={() => save.mutate()} />
      <AnimatePresence>{toast && <Toast msg="Hero section saved!" />}</AnimatePresence>
    </div>
  );
}

// ─── Tab: Buttons ─────────────────────────────────────────────────────────────

const BLANK_BTN: Partial<HeroButton> = { label: "", url: "", variant: "primary", order: 0, is_published: true };

function ButtonsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Partial<HeroButton> & { id?: number }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: buttons = [], isLoading } = useQuery({
    queryKey: homepageKeys.buttons,
    queryFn: () => homepageService.getButtons().then((r) => r.data.results ?? []),
    staleTime: 60_000,
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const inv = () => { qc.invalidateQueries({ queryKey: homepageKeys.buttons }); qc.invalidateQueries({ queryKey: homepageKeys.all }); };

  const create = useMutation({ mutationFn: (d: Partial<HeroButton>) => homepageService.createButton(d), onSuccess: () => { inv(); setEditing(null); showToast("Button created!"); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<HeroButton> }) => homepageService.updateButton(id, d), onSuccess: () => { inv(); setEditing(null); showToast("Button updated!"); } });
  const remove = useMutation({ mutationFn: (id: number) => homepageService.deleteButton(id), onSuccess: () => { inv(); showToast("Deleted!"); } });
  const togglePub = useMutation({ mutationFn: ({ id, val }: { id: number; val: boolean }) => homepageService.updateButton(id, { is_published: val }), onSuccess: () => inv() });

  const openNew = () => { setEditing({ ...BLANK_BTN, order: buttons.length }); setIsNew(true); };
  const openEdit = (b: HeroButton) => { setEditing({ ...b }); setIsNew(false); };
  const save = () => {
    if (!editing) return;
    if (isNew) create.mutate(editing);
    else { const { id, ...rest } = editing; update.mutate({ id: id!, d: rest }); }
  };
  const isSaving = create.isPending || update.isPending;

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{buttons.length} button{buttons.length !== 1 ? "s" : ""} — shown in the hero CTA row</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Button
        </button>
      </div>

      <div className="space-y-2">
        {buttons.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{b.label}</p>
              <p className="text-xs text-muted-foreground truncate">{b.url}</p>
            </div>
            <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border", b.variant === "primary" ? "bg-brand-500/10 text-brand-400 border-brand-500/20" : "bg-muted text-muted-foreground border-border")}>
              {b.variant}
            </span>
            <button onClick={() => togglePub.mutate({ id: b.id, val: !b.is_published })}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-colors", b.is_published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground")}>
              {b.is_published ? "Visible" : "Hidden"}
            </button>
            <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button onClick={() => remove.mutate(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
          </div>
        ))}
        {buttons.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
            No buttons yet. Add your first CTA button above.
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setEditing(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold">{isNew ? "New Button" : "Edit Button"}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Field label="Label"><input className={inputCls} value={editing.label ?? ""} onChange={(e) => setEditing((d) => d && { ...d, label: e.target.value })} placeholder="Start Your Project" /></Field>
                <Field label="URL" hint="Relative (/contact) or absolute (https://…)">
                  <input className={inputCls} value={editing.url ?? ""} onChange={(e) => setEditing((d) => d && { ...d, url: e.target.value })} placeholder="/contact" />
                </Field>
                <Field label="Style">
                  <select className={inputCls} value={editing.variant ?? "primary"} onChange={(e) => setEditing((d) => d && { ...d, variant: e.target.value as "primary" | "outline" })}>
                    <option value="primary">Primary (gradient fill)</option>
                    <option value="outline">Outline</option>
                  </select>
                </Field>
                <Field label="Order"><input type="number" className={inputCls} value={editing.order ?? 0} onChange={(e) => setEditing((d) => d && { ...d, order: parseInt(e.target.value) || 0 })} /></Field>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                  <span className="text-sm font-medium">Visible</span>
                  <button onClick={() => setEditing((d) => d && { ...d, is_published: !d.is_published })}
                    className={cn("relative w-10 h-5 rounded-full transition-colors", editing.is_published ? "bg-brand-500" : "bg-muted")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", editing.is_published ? "left-5" : "left-0.5")} />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border">
                <button onClick={save} disabled={isSaving || !editing.label || !editing.url}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isNew ? "Create Button" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast msg={toast} />}</AnimatePresence>
    </div>
  );
}

// ─── Tab: Statistics ──────────────────────────────────────────────────────────

const BLANK_STAT: Omit<StatisticCard, "id"> = { icon_name: "Zap", value: "", label: "", order: 0, is_published: true };

function StatisticsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Partial<StatisticCard> & { id?: number }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: stats = [], isLoading } = useQuery({
    queryKey: homepageKeys.statistics,
    queryFn: () => homepageService.getStatistics().then((r) => r.data.results ?? []),
    staleTime: 60_000,
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const inv = () => { qc.invalidateQueries({ queryKey: homepageKeys.statistics }); qc.invalidateQueries({ queryKey: homepageKeys.all }); };

  const create = useMutation({ mutationFn: (d: Omit<StatisticCard, "id">) => homepageService.createStatistic(d), onSuccess: () => { inv(); setEditing(null); showToast("Statistic created!"); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<StatisticCard> }) => homepageService.updateStatistic(id, d), onSuccess: () => { inv(); setEditing(null); showToast("Statistic updated!"); } });
  const remove = useMutation({ mutationFn: (id: number) => homepageService.deleteStatistic(id), onSuccess: () => { inv(); showToast("Deleted!"); } });
  const togglePub = useMutation({ mutationFn: ({ id, val }: { id: number; val: boolean }) => homepageService.updateStatistic(id, { is_published: val }), onSuccess: () => inv() });

  const openNew = () => { setEditing({ ...BLANK_STAT, order: stats.length }); setIsNew(true); };
  const openEdit = (s: StatisticCard) => { setEditing({ ...s }); setIsNew(false); };
  const save = () => {
    if (!editing) return;
    if (isNew) create.mutate(editing as Omit<StatisticCard, "id">);
    else { const { id, ...rest } = editing as StatisticCard; update.mutate({ id, d: rest }); }
  };
  const isSaving = create.isPending || update.isPending;

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{stats.length} statistic{stats.length !== 1 ? "s" : ""} — shown below the hero buttons</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Statistic
        </button>
      </div>

      <div className="space-y-2">
        {stats.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{s.value}</p>
              <p className="text-xs text-muted-foreground truncate">{s.label}</p>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">icon: {s.icon_name}</span>
            <button onClick={() => togglePub.mutate({ id: s.id, val: !s.is_published })}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-colors", s.is_published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground")}>
              {s.is_published ? "Visible" : "Hidden"}
            </button>
            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button onClick={() => remove.mutate(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
            No statistics yet. Add your first one above.
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setEditing(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold">{isNew ? "New Statistic" : "Edit Statistic"}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Field label="Value" hint='e.g. "99.9%", "50+", "10M+"'>
                  <input className={inputCls} value={editing.value ?? ""} onChange={(e) => setEditing((d) => d && { ...d, value: e.target.value })} placeholder="99.9%" />
                </Field>
                <Field label="Label"><input className={inputCls} value={editing.label ?? ""} onChange={(e) => setEditing((d) => d && { ...d, label: e.target.value })} placeholder="Uptime SLA" /></Field>
                <Field label="Icon Name" hint="Lucide PascalCase: Zap, Star, Users, TrendingUp, Award, Globe…">
                  <input className={inputCls} value={editing.icon_name ?? ""} onChange={(e) => setEditing((d) => d && { ...d, icon_name: e.target.value })} placeholder="Zap" />
                </Field>
                <Field label="Order"><input type="number" className={inputCls} value={editing.order ?? 0} onChange={(e) => setEditing((d) => d && { ...d, order: parseInt(e.target.value) || 0 })} /></Field>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                  <span className="text-sm font-medium">Visible</span>
                  <button onClick={() => setEditing((d) => d && { ...d, is_published: !d.is_published })}
                    className={cn("relative w-10 h-5 rounded-full transition-colors", editing.is_published ? "bg-brand-500" : "bg-muted")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", editing.is_published ? "left-5" : "left-0.5")} />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border">
                <button onClick={save} disabled={isSaving || !editing.value || !editing.label}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isNew ? "Create" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast msg={toast} />}</AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "hero",    label: "Hero Text",   icon: Home              },
  { key: "buttons", label: "CTA Buttons", icon: MousePointerClick },
  { key: "stats",   label: "Statistics",  icon: BarChart2         },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function HomepageManagerPage() {
  const [tab, setTab] = useState<Tab>("hero");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6 text-brand-400" /> Homepage
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Edit the hero section, CTA buttons, and statistics shown on the homepage</p>
      </div>

      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              tab === key ? "bg-brand-500 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {tab === "hero"    && <HeroTab />}
        {tab === "buttons" && <ButtonsTab />}
        {tab === "stats"   && <StatisticsTab />}
      </div>
    </div>
  );
}
