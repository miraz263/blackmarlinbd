import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, Trash2, Pencil, X, Loader2,
  Info, Target, BarChart2, Star, Users, GripVertical,
} from "lucide-react";
import { aboutService, aboutKeys } from "@/services/aboutService";
import type { AboutPage, CoreValue, TeamMember, AboutStatistic } from "@/types";
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

// ─── Tab: Hero ───────────────────────────────────────────────────────────────

function HeroTab() {
  const qc = useQueryClient();
  const [toast, setToast] = useState(false);

  const { data: raw, isLoading } = useQuery({
    queryKey: aboutKeys.all,
    queryFn: () => aboutService.getAll().then((r) => r.data),
    staleTime: 60_000,
  });

  const [form, setForm] = useState<Partial<AboutPage>>({
    badge_text: "", hero_title: "", hero_subtitle: "", hero_description: "", founded_year: new Date().getFullYear(), tagline: "",
  });
  const [saved, setSaved] = useState(form);

  useEffect(() => {
    if (!raw?.page) return;
    const next: Partial<AboutPage> = {
      badge_text: raw.page.badge_text ?? "",
      hero_title: raw.page.hero_title ?? "",
      hero_subtitle: raw.page.hero_subtitle ?? "",
      hero_description: raw.page.hero_description ?? "",
      founded_year: raw.page.founded_year ?? new Date().getFullYear(),
      tagline: raw.page.tagline ?? "",
    };
    setForm(next);
    setSaved(next);
  }, [raw?.page]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => aboutService.updatePage(form),
    onSuccess: () => {
      setSaved(form);
      qc.invalidateQueries({ queryKey: aboutKeys.all });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    },
  });

  if (isLoading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-accent animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      <Field label="Badge Text" hint='Small pill above the title — e.g. "Our Story"'>
        <input className={inputCls} value={form.badge_text ?? ""} onChange={(e) => set("badge_text", e.target.value)} placeholder="Our Story" />
      </Field>
      <Field label="Hero Title">
        <input className={inputCls} value={form.hero_title ?? ""} onChange={(e) => set("hero_title", e.target.value)} placeholder="Engineering the Digital Future" />
      </Field>
      <Field label="Hero Subtitle" hint="Optional — appears below the title">
        <input className={inputCls} value={form.hero_subtitle ?? ""} onChange={(e) => set("hero_subtitle", e.target.value)} placeholder="Optional subtitle" />
      </Field>
      <Field label="Hero Description">
        <textarea className={textareaCls} rows={5} value={form.hero_description ?? ""} onChange={(e) => set("hero_description", e.target.value)} placeholder="Describe your company…" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Founded Year">
          <input type="number" className={inputCls} value={form.founded_year ?? ""} onChange={(e) => set("founded_year", parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Tagline" hint="Optional — used in some footers/meta">
          <input className={inputCls} value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} placeholder="Building the future, one line at a time." />
        </Field>
      </div>
      <SaveBar dirty={dirty} saving={save.isPending} onSave={() => save.mutate()} />
      <AnimatePresence>{toast && <Toast msg="Hero section saved!" />}</AnimatePresence>
    </div>
  );
}

// ─── Tab: Mission & Vision ────────────────────────────────────────────────────

function MissionVisionTab() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: aboutKeys.all,
    queryFn: () => aboutService.getAll().then((r) => r.data),
    staleTime: 60_000,
  });

  const [mission, setMission] = useState({ title: "", description: "" });
  const [vision,  setVision]  = useState({ title: "", description: "" });
  const [savedM, setSavedM] = useState(mission);
  const [savedV, setSavedV] = useState(vision);

  useEffect(() => {
    if (!raw?.mission) return;
    const m = { title: raw.mission.title ?? "", description: raw.mission.description ?? "" };
    setMission(m); setSavedM(m);
  }, [raw?.mission]);

  useEffect(() => {
    if (!raw?.vision) return;
    const v = { title: raw.vision.title ?? "", description: raw.vision.description ?? "" };
    setVision(v); setSavedV(v);
  }, [raw?.vision]);

  const mDirty = JSON.stringify(mission) !== JSON.stringify(savedM);
  const vDirty = JSON.stringify(vision)  !== JSON.stringify(savedV);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const saveMission = useMutation({
    mutationFn: () => aboutService.updateMission(mission),
    onSuccess: () => { setSavedM(mission); qc.invalidateQueries({ queryKey: aboutKeys.all }); showToast("Mission saved!"); },
  });
  const saveVision = useMutation({
    mutationFn: () => aboutService.updateVision(vision),
    onSuccess: () => { setSavedV(vision); qc.invalidateQueries({ queryKey: aboutKeys.all }); showToast("Vision saved!"); },
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-accent animate-pulse" />)}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Mission */}
      <div className="space-y-4 p-6 rounded-2xl border border-border bg-card">
        <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-brand-400" /> Mission</h3>
        <Field label="Title">
          <input className={inputCls} value={mission.title} onChange={(e) => setMission((m) => ({ ...m, title: e.target.value }))} placeholder="Our Mission" />
        </Field>
        <Field label="Description">
          <textarea className={textareaCls} rows={5} value={mission.description} onChange={(e) => setMission((m) => ({ ...m, description: e.target.value }))} />
        </Field>
        <SaveBar dirty={mDirty} saving={saveMission.isPending} onSave={() => saveMission.mutate()} />
      </div>

      {/* Vision */}
      <div className="space-y-4 p-6 rounded-2xl border border-border bg-card">
        <h3 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-purple-400" /> Vision</h3>
        <Field label="Title">
          <input className={inputCls} value={vision.title} onChange={(e) => setVision((v) => ({ ...v, title: e.target.value }))} placeholder="Our Vision" />
        </Field>
        <Field label="Description">
          <textarea className={textareaCls} rows={5} value={vision.description} onChange={(e) => setVision((v) => ({ ...v, description: e.target.value }))} />
        </Field>
        <SaveBar dirty={vDirty} saving={saveVision.isPending} onSave={() => saveVision.mutate()} />
      </div>

      <AnimatePresence>{toast && <Toast msg={toast} />}</AnimatePresence>
    </div>
  );
}

// ─── Tab: Statistics ──────────────────────────────────────────────────────────

const BLANK_STAT: Omit<AboutStatistic, "id"> = { icon_name: "Code2", value: "", label: "", order: 0, is_published: true };

function StatisticsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<AboutStatistic | typeof BLANK_STAT | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: stats = [] } = useQuery({
    queryKey: aboutKeys.statistics,
    queryFn: () => aboutService.getStatistics().then((r) => r.data.results ?? []),
    staleTime: 60_000,
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const inv = () => { qc.invalidateQueries({ queryKey: aboutKeys.statistics }); qc.invalidateQueries({ queryKey: aboutKeys.all }); };

  const create = useMutation({
    mutationFn: (d: Omit<AboutStatistic, "id">) => aboutService.createStatistic(d),
    onSuccess: () => { inv(); setEditing(null); showToast("Statistic created!"); },
  });
  const update = useMutation({
    mutationFn: ({ id, d }: { id: number; d: Partial<AboutStatistic> }) => aboutService.updateStatistic(id, d),
    onSuccess: () => { inv(); setEditing(null); showToast("Statistic updated!"); },
  });
  const remove = useMutation({
    mutationFn: (id: number) => aboutService.deleteStatistic(id),
    onSuccess: () => { inv(); showToast("Deleted!"); },
  });
  const togglePub = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) => aboutService.updateStatistic(id, { is_published: val }),
    onSuccess: () => inv(),
  });

  const openNew = () => { setEditing({ ...BLANK_STAT, order: stats.length }); setIsNew(true); };
  const openEdit = (s: AboutStatistic) => { setEditing({ ...s }); setIsNew(false); };

  const save = () => {
    if (!editing) return;
    if (isNew) {
      create.mutate(editing as Omit<AboutStatistic, "id">);
    } else {
      const { id, ...rest } = editing as AboutStatistic;
      update.mutate({ id, d: rest });
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{stats.length} statistic{stats.length !== 1 ? "s" : ""}</p>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Statistic
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {stats.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
              <BarChart2 className="h-4 w-4 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{s.value}</p>
              <p className="text-xs text-muted-foreground truncate">{s.label}</p>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">icon: {s.icon_name}</span>
            <button onClick={() => togglePub.mutate({ id: s.id, val: !s.is_published })}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-colors", s.is_published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground")}>
              {s.is_published ? "Published" : "Hidden"}
            </button>
            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => remove.mutate(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
            No statistics yet. Add your first one above.
          </div>
        )}
      </div>

      {/* Edit drawer */}
      <AnimatePresence>
        {editing && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setEditing(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold">{isNew ? "New Statistic" : "Edit Statistic"}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Field label="Value" hint='e.g. "1M+", "120+", "25+"'>
                  <input className={inputCls} value={editing.value} onChange={(e) => setEditing((d) => d && { ...d, value: e.target.value })} placeholder="1M+" />
                </Field>
                <Field label="Label" hint='e.g. "Lines of Production Code"'>
                  <input className={inputCls} value={editing.label} onChange={(e) => setEditing((d) => d && { ...d, label: e.target.value })} placeholder="Lines of Production Code" />
                </Field>
                <Field label="Icon Name" hint="Lucide icon in PascalCase: Code2, Globe2, Users, Award, Rocket…">
                  <input className={inputCls} value={editing.icon_name} onChange={(e) => setEditing((d) => d && { ...d, icon_name: e.target.value })} placeholder="Code2" />
                </Field>
                <Field label="Order">
                  <input type="number" className={inputCls} value={editing.order} onChange={(e) => setEditing((d) => d && { ...d, order: parseInt(e.target.value) || 0 })} />
                </Field>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                  <span className="text-sm font-medium">Published</span>
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

// ─── Tab: Core Values ─────────────────────────────────────────────────────────

const BLANK_VALUE: Omit<CoreValue, "id"> = { title: "", description: "", icon_name: "Zap", order: 0, is_published: true };

function ValuesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CoreValue | typeof BLANK_VALUE | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: raw } = useQuery({
    queryKey: aboutKeys.all,
    queryFn: () => aboutService.getAll().then((r) => r.data),
    staleTime: 60_000,
  });
  const values = raw?.values ?? [];

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const inv = () => qc.invalidateQueries({ queryKey: aboutKeys.all });

  const create = useMutation({ mutationFn: (d: Omit<CoreValue, "id">) => aboutService.createValue(d), onSuccess: () => { inv(); setEditing(null); showToast("Value created!"); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<CoreValue> }) => aboutService.updateValue(id, d), onSuccess: () => { inv(); setEditing(null); showToast("Value updated!"); } });
  const remove = useMutation({ mutationFn: (id: number) => aboutService.deleteValue(id), onSuccess: () => { inv(); showToast("Deleted!"); } });
  const togglePub = useMutation({ mutationFn: ({ id, val }: { id: number; val: boolean }) => aboutService.updateValue(id, { is_published: val }), onSuccess: () => inv() });

  const openNew = () => { setEditing({ ...BLANK_VALUE, order: values.length }); setIsNew(true); };
  const openEdit = (v: CoreValue) => { setEditing({ ...v }); setIsNew(false); };

  const save = () => {
    if (!editing) return;
    if (isNew) create.mutate(editing as Omit<CoreValue, "id">);
    else { const { id, ...rest } = editing as CoreValue; update.mutate({ id, d: rest }); }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{values.length} value{values.length !== 1 ? "s" : ""}</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Value
        </button>
      </div>
      <div className="space-y-2">
        {values.map((v) => (
          <div key={v.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{v.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{v.description}</p>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">icon: {v.icon_name}</span>
            <button onClick={() => togglePub.mutate({ id: v.id, val: !v.is_published })}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-colors", v.is_published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground")}>
              {v.is_published ? "Published" : "Hidden"}
            </button>
            <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => remove.mutate(v.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        ))}
        {values.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
            No core values yet.
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
                <h3 className="font-semibold">{isNew ? "New Value" : "Edit Value"}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Field label="Title"><input className={inputCls} value={editing.title} onChange={(e) => setEditing((d) => d && { ...d, title: e.target.value })} placeholder="Engineering Excellence" /></Field>
                <Field label="Description"><textarea className={textareaCls} rows={4} value={editing.description} onChange={(e) => setEditing((d) => d && { ...d, description: e.target.value })} /></Field>
                <Field label="Icon Name" hint="Lucide PascalCase: Zap, Shield, Heart, Lightbulb, Star, Code2…">
                  <input className={inputCls} value={editing.icon_name} onChange={(e) => setEditing((d) => d && { ...d, icon_name: e.target.value })} placeholder="Zap" />
                </Field>
                <Field label="Order"><input type="number" className={inputCls} value={editing.order} onChange={(e) => setEditing((d) => d && { ...d, order: parseInt(e.target.value) || 0 })} /></Field>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                  <span className="text-sm font-medium">Published</span>
                  <button onClick={() => setEditing((d) => d && { ...d, is_published: !d.is_published })}
                    className={cn("relative w-10 h-5 rounded-full transition-colors", editing.is_published ? "bg-brand-500" : "bg-muted")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", editing.is_published ? "left-5" : "left-0.5")} />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border">
                <button onClick={save} disabled={isSaving || !editing.title}
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

// ─── Tab: Team ────────────────────────────────────────────────────────────────

const BLANK_MEMBER: Partial<TeamMember> & { photo_file?: File | null } = {
  name: "", designation: "", bio: "", linkedin: "", github: "", email: "",
  display_order: 0, is_published: true, photo_url: null, photo_file: null,
};

function TeamTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Partial<TeamMember> & { photo_file?: File | null; id?: number }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: raw } = useQuery({
    queryKey: aboutKeys.all,
    queryFn: () => aboutService.getAll().then((r) => r.data),
    staleTime: 60_000,
  });
  const team = raw?.team ?? [];

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const inv = () => qc.invalidateQueries({ queryKey: aboutKeys.all });

  const create = useMutation({
    mutationFn: (d: Partial<TeamMember> & { photo_file?: File | null }) => {
      const fd = new FormData();
      Object.entries(d).forEach(([k, v]) => {
        if (k === "photo_file") { if (v) fd.append("photo", v as File); }
        else if (v !== null && v !== undefined && k !== "photo_url") fd.append(k, String(v));
      });
      return aboutService.createTeamMember(fd);
    },
    onSuccess: () => { inv(); setEditing(null); showToast("Member created!"); },
  });

  const update = useMutation({
    mutationFn: ({ id, d }: { id: number; d: Partial<TeamMember> & { photo_file?: File | null } }) => {
      const fd = new FormData();
      Object.entries(d).forEach(([k, v]) => {
        if (k === "photo_file") { if (v) fd.append("photo", v as File); }
        else if (v !== null && v !== undefined && k !== "photo_url") fd.append(k, String(v));
      });
      return aboutService.updateTeamMember(id, fd);
    },
    onSuccess: () => { inv(); setEditing(null); showToast("Member updated!"); },
  });

  const remove = useMutation({ mutationFn: (id: number) => aboutService.deleteTeamMember(id), onSuccess: () => { inv(); showToast("Deleted!"); } });
  const togglePub = useMutation({ mutationFn: ({ id, val }: { id: number; val: boolean }) => aboutService.updateTeamMember(id, { is_published: val }), onSuccess: () => inv() });

  const openNew = () => { setEditing({ ...BLANK_MEMBER, display_order: team.length }); setIsNew(true); };
  const openEdit = (m: TeamMember) => { setEditing({ ...m, photo_file: null }); setIsNew(false); };

  const save = () => {
    if (!editing) return;
    if (isNew) create.mutate(editing);
    else { const { id, ...rest } = editing; update.mutate({ id: id!, d: rest }); }
  };

  const isSaving = create.isPending || update.isPending;

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const GRADIENTS = ["from-purple-500 to-brand-500", "from-cyan-500 to-blue-500", "from-green-500 to-emerald-500", "from-orange-500 to-red-500"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{team.length} member{team.length !== 1 ? "s" : ""}</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((m, i) => (
          <div key={m.id} className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center text-center gap-3">
            {m.photo_url ? (
              <img src={m.photo_url} alt={m.name} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-lg font-bold`}>
                {initials(m.name)}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.designation}</p>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <button onClick={() => togglePub.mutate({ id: m.id, val: !m.is_published })}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-colors", m.is_published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground")}>
                {m.is_published ? "Published" : "Hidden"}
              </button>
              <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
              <button onClick={() => remove.mutate(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
        {team.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
            No team members yet.
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
                <h3 className="font-semibold">{isNew ? "New Member" : "Edit Member"}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Field label="Name"><input className={inputCls} value={editing.name ?? ""} onChange={(e) => setEditing((d) => d && { ...d, name: e.target.value })} placeholder="Jane Doe" /></Field>
                <Field label="Designation"><input className={inputCls} value={editing.designation ?? ""} onChange={(e) => setEditing((d) => d && { ...d, designation: e.target.value })} placeholder="CTO" /></Field>
                <Field label="Bio"><textarea className={textareaCls} rows={3} value={editing.bio ?? ""} onChange={(e) => setEditing((d) => d && { ...d, bio: e.target.value })} /></Field>
                <Field label="Photo">
                  <input type="file" accept="image/*" className={inputCls}
                    onChange={(e) => setEditing((d) => d && { ...d, photo_file: e.target.files?.[0] ?? null })} />
                  {editing.photo_url && !editing.photo_file && <img src={editing.photo_url} className="mt-2 h-14 w-14 rounded-xl object-cover" alt="" />}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="LinkedIn"><input className={inputCls} value={editing.linkedin ?? ""} onChange={(e) => setEditing((d) => d && { ...d, linkedin: e.target.value })} placeholder="https://…" /></Field>
                  <Field label="GitHub"><input className={inputCls} value={editing.github ?? ""} onChange={(e) => setEditing((d) => d && { ...d, github: e.target.value })} placeholder="https://…" /></Field>
                </div>
                <Field label="Email"><input type="email" className={inputCls} value={editing.email ?? ""} onChange={(e) => setEditing((d) => d && { ...d, email: e.target.value })} placeholder="jane@example.com" /></Field>
                <Field label="Display Order"><input type="number" className={inputCls} value={editing.display_order ?? 0} onChange={(e) => setEditing((d) => d && { ...d, display_order: parseInt(e.target.value) || 0 })} /></Field>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                  <span className="text-sm font-medium">Published</span>
                  <button onClick={() => setEditing((d) => d && { ...d, is_published: !d.is_published })}
                    className={cn("relative w-10 h-5 rounded-full transition-colors", editing.is_published ? "bg-brand-500" : "bg-muted")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", editing.is_published ? "left-5" : "left-0.5")} />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border">
                <button onClick={save} disabled={isSaving || !editing.name || !editing.designation}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isNew ? "Create Member" : "Save Changes"}
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
  { key: "hero",    label: "Hero",           icon: Info     },
  { key: "mv",      label: "Mission & Vision", icon: Target  },
  { key: "stats",   label: "Statistics",     icon: BarChart2 },
  { key: "values",  label: "Core Values",    icon: Star     },
  { key: "team",    label: "Team",           icon: Users    },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function AboutManagerPage() {
  const [tab, setTab] = useState<Tab>("hero");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Info className="h-6 w-6 text-brand-400" /> About Page
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Edit every section of the About page — hero, mission, stats, values, and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              tab === key ? "bg-brand-500 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {tab === "hero"   && <HeroTab />}
        {tab === "mv"     && <MissionVisionTab />}
        {tab === "stats"  && <StatisticsTab />}
        {tab === "values" && <ValuesTab />}
        {tab === "team"   && <TeamTab />}
      </div>
    </div>
  );
}
