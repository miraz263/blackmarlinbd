import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, X, Loader2,
  ChevronLeft, ChevronRight, Briefcase,
  Star, StarOff, Users, Clock, CheckCircle2,
  XCircle, AlertTriangle, MapPin, Calendar,
} from "lucide-react";
import { jobsApi } from "@/services/api/jobs";
import type { Job } from "@/types";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const JOB_TYPES: { value: Job["type"]; label: string }[] = [
  { value: "full_time",  label: "Full Time"  },
  { value: "part_time",  label: "Part Time"  },
  { value: "contract",   label: "Contract"   },
  { value: "internship", label: "Internship" },
  { value: "remote",     label: "Remote"     },
];

const EXPERIENCE: { value: Job["experience"]; label: string }[] = [
  { value: "junior", label: "Junior (0–2 yrs)" },
  { value: "mid",    label: "Mid (3–5 yrs)"    },
  { value: "senior", label: "Senior (5+ yrs)"  },
  { value: "lead",   label: "Lead / Principal"  },
];

const CURRENCIES = ["USD", "BDT", "EUR", "GBP", "AED", "SGD"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Job["status"] }) {
  const cfg = {
    open:   { icon: CheckCircle2, label: "Open",   cls: "bg-green-500/10 text-green-500 border-green-500/20" },
    draft:  { icon: Clock,        label: "Draft",  cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    closed: { icon: XCircle,      label: "Closed", cls: "bg-muted/40 text-muted-foreground border-border"   },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.cls}`}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: Job["type"] }) {
  const labels: Record<Job["type"], string> = {
    full_time: "Full Time", part_time: "Part Time",
    contract: "Contract", internship: "Internship", remote: "Remote",
  };
  return (
    <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-semibold">
      {labels[type]}
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

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  department: string;
  location: string;
  type: Job["type"];
  experience: Job["experience"];
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  description: string;
  requirements: string;
  benefits: string;
  skills: string[];
  status: Job["status"];
  deadline: string;
  is_featured: boolean;
}

const EMPTY: FormState = {
  title: "", department: "", location: "",
  type: "full_time", experience: "mid",
  salary_min: "", salary_max: "", salary_currency: "USD",
  description: "", requirements: "", benefits: "",
  skills: [], status: "draft", deadline: "", is_featured: false,
};

function toForm(j: Job): FormState {
  return {
    title: j.title, department: j.department, location: j.location,
    type: j.type, experience: j.experience,
    salary_min: j.salary_min != null ? String(j.salary_min) : "",
    salary_max: j.salary_max != null ? String(j.salary_max) : "",
    salary_currency: j.salary_currency,
    description: j.description, requirements: j.requirements, benefits: j.benefits,
    skills: j.skills ?? [], status: j.status,
    deadline: j.deadline ?? "", is_featured: j.is_featured,
  };
}

const inputCls = "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
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

// ─── Job modal ────────────────────────────────────────────────────────────────

function JobModal({ job, onClose }: { job: Job | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = job !== null;
  const [form, setForm] = useState<FormState>(isEdit ? toForm(job) : EMPTY);
  const [error, setError] = useState("");

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value })), []);

  const buildPayload = () => ({
    title: form.title, department: form.department, location: form.location,
    type: form.type, experience: form.experience,
    salary_min: form.salary_min ? Number(form.salary_min) : null,
    salary_max: form.salary_max ? Number(form.salary_max) : null,
    salary_currency: form.salary_currency,
    description: form.description, requirements: form.requirements, benefits: form.benefits,
    skills: form.skills, status: form.status,
    deadline: form.deadline || null,
    is_featured: form.is_featured,
  });

  const saveMut = useMutation({
    mutationFn: () => isEdit ? jobsApi.update(job!.id, buildPayload()) : jobsApi.create(buildPayload()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-jobs"] }); onClose(); },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      if (typeof data === "string") { setError("Server error — check backend logs."); return; }
      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (typeof obj.detail === "string") { setError(obj.detail); return; }
        const first = Object.entries(obj).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(" · ");
        setError(first || "Failed to save job.");
      } else setError("Failed to save job.");
    },
  });

  const isValid = form.title.trim().length > 0 && form.department.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-2xl h-full bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold">{isEdit ? "Edit Job" : "New Job"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Editing: ${job!.title}` : "Post a new position"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Title + Department + Location */}
          <Field label="Job Title *">
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="e.g. Senior React Engineer" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Department *">
              <input value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls} placeholder="Engineering" />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} placeholder="Remote / Dhaka" />
            </Field>
          </div>

          {/* Type + Experience + Status */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Type">
              <select value={form.type} onChange={(e) => set("type", e.target.value as Job["type"])}
                style={{ colorScheme: "dark" }} className={inputCls}>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Experience">
              <select value={form.experience} onChange={(e) => set("experience", e.target.value as Job["experience"])}
                style={{ colorScheme: "dark" }} className={inputCls}>
                {EXPERIENCE.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value as Job["status"])}
                style={{ colorScheme: "dark" }} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
          </div>

          {/* Salary */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Salary Range</label>
            <div className="flex gap-3">
              <select value={form.salary_currency} onChange={(e) => set("salary_currency", e.target.value)}
                style={{ colorScheme: "dark" }} className={cn(inputCls, "w-28 shrink-0")}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" value={form.salary_min} onChange={(e) => set("salary_min", e.target.value)}
                className={inputCls} placeholder="Min" min={0} />
              <span className="flex items-center text-muted-foreground text-sm">–</span>
              <input type="number" value={form.salary_max} onChange={(e) => set("salary_max", e.target.value)}
                className={inputCls} placeholder="Max" min={0} />
            </div>
          </div>

          {/* Deadline */}
          <Field label="Application Deadline">
            <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={inputCls} />
          </Field>

          {/* Skills */}
          <TagInput label="Required Skills" placeholder="React, TypeScript, Python…"
            tags={form.skills} onChange={(v) => set("skills", v)} />

          {/* Description */}
          <Field label="Job Description * (Markdown)">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={6} className={cn(inputCls, "resize-y font-mono text-xs")}
              placeholder="## About the Role&#10;&#10;Describe the position…" />
          </Field>

          {/* Requirements */}
          <Field label="Requirements (Markdown)">
            <textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)}
              rows={5} className={cn(inputCls, "resize-y font-mono text-xs")}
              placeholder="- 3+ years of experience&#10;- Strong communication…" />
          </Field>

          {/* Benefits */}
          <Field label="Benefits (Markdown)">
            <textarea value={form.benefits} onChange={(e) => set("benefits", e.target.value)}
              rows={4} className={cn(inputCls, "resize-y font-mono text-xs")}
              placeholder="- Competitive salary&#10;- Remote-first…" />
          </Field>

          {/* Featured toggle */}
          <Toggle value={form.is_featured} onChange={(v) => set("is_featured", v)}
            label="Featured Position" desc="Highlighted on the Careers page" />

          {/* Error */}
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
            {saveMut.isPending ? "Saving…" : isEdit ? "Save Changes" : "Post Job"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ job, onClose }: { job: Job; onClose: () => void }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: () => jobsApi.delete(job.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-jobs"] }); onClose(); },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="text-lg font-bold mb-1">Delete Job</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{job.title}"</span>?
          All {job.application_count} application{job.application_count !== 1 ? "s" : ""} will also be deleted.
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

// ─── Job row ──────────────────────────────────────────────────────────────────

function JobRow({ job, onEdit, onDelete }: { job: Job; onEdit: () => void; onDelete: () => void }) {
  const qc = useQueryClient();

  const cycleStatus = useMutation({
    mutationFn: () => {
      const next: Job["status"] = job.status === "draft" ? "open" : job.status === "open" ? "closed" : "draft";
      return jobsApi.update(job.id, { status: next });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-jobs"] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: () => jobsApi.update(job.id, { is_featured: !job.is_featured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-jobs"] }),
  });

  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="border-b border-border hover:bg-accent/30 transition-colors group">

      {/* Title + meta */}
      <td className="py-3 pl-4 pr-4 min-w-[220px] max-w-[300px]">
        <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">{job.department}</span>
          {job.location && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
              <MapPin className="h-2.5 w-2.5" /> {job.location}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          <TypeBadge type={job.type} />
          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border text-[10px] font-medium">
            {EXPERIENCE.find((e) => e.value === job.experience)?.label}
          </span>
        </div>
      </td>

      {/* Salary */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        {job.salary_min || job.salary_max ? (
          <span className="text-xs text-muted-foreground">
            {job.salary_currency} {job.salary_min?.toLocaleString() ?? "?"} – {job.salary_max?.toLocaleString() ?? "?"}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <button onClick={() => cycleStatus.mutate()} title="Click to cycle status" className="hover:opacity-80 transition-opacity">
          <StatusBadge status={job.status} />
        </button>
      </td>

      {/* Featured */}
      <td className="py-3 pr-4 text-center hidden sm:table-cell">
        <button onClick={() => toggleFeatured.mutate()}
          className={cn("transition-colors", job.is_featured ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground/30 hover:text-amber-400")}>
          {job.is_featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
        </button>
      </td>

      {/* Applications */}
      <td className="py-3 pr-4 hidden md:table-cell">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" /> {job.application_count}
        </span>
      </td>

      {/* Deadline */}
      <td className="py-3 pr-4 hidden xl:table-cell">
        {job.deadline ? (
          <span className={cn("flex items-center gap-1 text-xs", isExpired ? "text-red-400" : "text-muted-foreground")}>
            <Calendar className="h-3 w-3" />
            {new Date(job.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            {isExpired && <span className="text-[9px] font-bold ml-1">EXPIRED</span>}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">No deadline</span>
        )}
      </td>

      {/* Skills */}
      <td className="py-3 pr-4 hidden 2xl:table-cell max-w-[160px]">
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 3).map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-accent text-muted-foreground text-[10px]">{s}</span>
          ))}
          {job.skills.length > 3 && <span className="text-[10px] text-muted-foreground/60">+{job.skills.length - 3}</span>}
        </div>
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

type StatusFilter = "all" | "open" | "draft" | "closed";

export default function JobsManagerPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editJob, setEditJob] = useState<Job | null | "new">(null);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  useEffect(() => setPage(1), [debouncedSearch, statusFilter, typeFilter]);

  const params: Record<string, string | number | boolean> = { page, page_size: 15 };
  if (debouncedSearch)     params.search = debouncedSearch;
  if (statusFilter !== "all") params.status = statusFilter;
  if (typeFilter)          params.type = typeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-jobs", params],
    queryFn: () => jobsApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: allData } = useQuery({
    queryKey: ["dashboard-jobs-stats"],
    queryFn: () => jobsApi.list({ page_size: 1000 }).then((r) => r.data),
    staleTime: 60_000,
  });

  const jobs = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 15);
  const allJobs = allData?.results ?? [];

  const stats = {
    total:        allJobs.length,
    open:         allJobs.filter((j) => j.status === "open").length,
    draft:        allJobs.filter((j) => j.status === "draft").length,
    closed:       allJobs.filter((j) => j.status === "closed").length,
    applications: allJobs.reduce((s, j) => s + j.application_count, 0),
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-brand-400" /> Jobs
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Post and manage open positions — draft, publish, and track applications</p>
        </div>
        <button onClick={() => setEditJob("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
          <Plus className="h-4 w-4" /> Post Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",        value: stats.total,        icon: Briefcase,    color: "text-brand-400",  bg: "bg-brand-500/10"  },
          { label: "Open",         value: stats.open,         icon: CheckCircle2, color: "text-green-500",  bg: "bg-green-500/10"  },
          { label: "Draft",        value: stats.draft,        icon: Clock,        color: "text-amber-500",  bg: "bg-amber-500/10"  },
          { label: "Closed",       value: stats.closed,       icon: XCircle,      color: "text-muted-foreground", bg: "bg-muted/40" },
          { label: "Applications", value: stats.applications, icon: Users,        color: "text-cyan-400",   bg: "bg-cyan-500/10"   },
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs…"
            className="flex-1 bg-transparent text-sm outline-none" />
          {search && <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
          {(["all", "open", "draft", "closed"] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                statusFilter === s ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          style={{ colorScheme: "dark" }}
          className="px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-brand-500/50 min-w-36">
          <option value="">All Types</option>
          {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="pl-4 pr-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Position</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Salary</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="py-3 pr-4 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">★</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Applicants</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden xl:table-cell">Deadline</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden 2xl:table-cell">Skills</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 pl-4 pr-4">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded mb-1.5" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </td>
                    <td colSpan={7} />
                  </tr>
                ))
                : jobs.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">No jobs found</p>
                        {(search || statusFilter !== "all" || typeFilter) && (
                          <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter(""); }}
                            className="mt-3 text-xs text-brand-400 hover:text-brand-300">Clear filters</button>
                        )}
                      </td>
                    </tr>
                  )
                  : jobs.map((j) => (
                    <JobRow key={j.id} job={j} onEdit={() => setEditJob(j)} onDelete={() => setDeleteJob(j)} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, totalCount)} of {totalCount} jobs
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
        {editJob !== null && (
          <JobModal job={editJob === "new" ? null : editJob} onClose={() => setEditJob(null)} />
        )}
        {deleteJob && (
          <DeleteDialog job={deleteJob} onClose={() => setDeleteJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
