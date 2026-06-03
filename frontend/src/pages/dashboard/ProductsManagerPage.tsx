import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, X, Loader2,
  ChevronLeft, ChevronRight, Package2,
  CheckCircle2, EyeOff, Star, StarOff, AlertTriangle,
} from "lucide-react";
import { productsApi } from "@/services/api/products";
import type { ProductDB, ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

// ─── Icon preview ───────────────────────────────────────────────────────────

function ColorDot({ color, name }: { color: string; name: string }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs"
      style={{ backgroundColor: color }}
      title={name}
    >
      {name.slice(0, 2)}
    </div>
  );
}

// ─── Status badge ───────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-green-500/10 text-green-500 border-green-500/20">
      <CheckCircle2 className="h-2.5 w-2.5" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-muted/40 text-muted-foreground border-border">
      <EyeOff className="h-2.5 w-2.5" /> Inactive
    </span>
  );
}

// ─── Debounce ────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// ─── Form state ──────────────────────────────────────────────────────────────

type NavSection = "products" | "services" | "featured" | "hidden";

const NAV_SECTIONS: { value: NavSection; label: string; desc: string }[] = [
  { value: "products",  label: "Products Menu",      desc: "Appears in the Products mega-menu dropdown" },
  { value: "services",  label: "Services Menu",      desc: "Appears in the Services dropdown" },
  { value: "featured",  label: "Homepage Featured",  desc: "Shown on the homepage featured section" },
  { value: "hidden",    label: "Hidden",             desc: "Not shown in any navigation menu" },
];

interface FormState {
  name: string;
  tagline: string;
  description: string;
  category_id: number | "";
  icon_name: string;
  icon_color: string;
  badge: string;
  is_new: boolean;
  is_featured: boolean;
  is_active: boolean;
  nav_section: NavSection;
  demo_url: string;
  order: number;
}

const EMPTY: FormState = {
  name: "", tagline: "", description: "", category_id: "",
  icon_name: "", icon_color: "#6366f1", badge: "",
  is_new: false, is_featured: false, is_active: true,
  nav_section: "products", demo_url: "", order: 0,
};

function toForm(p: ProductDB): FormState {
  return {
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    category_id: p.category?.id ?? "",
    icon_name: p.icon_name,
    icon_color: p.icon_color,
    badge: p.badge,
    is_new: p.is_new,
    is_featured: p.is_featured,
    is_active: p.is_active,
    nav_section: p.nav_section ?? "products",
    demo_url: p.demo_url,
    order: p.order,
  };
}

const inputCls = "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 transition-all";

function Toggle({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0", value ? "bg-brand-500" : "bg-muted")}
      >
        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", value ? "left-5" : "left-0.5")} />
      </button>
    </div>
  );
}

// ─── Product modal ───────────────────────────────────────────────────────────

function ProductModal({ product, categories, onClose }: { product: ProductDB | null; categories: ProductCategory[]; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = product !== null;
  const [form, setForm] = useState<FormState>(isEdit ? toForm(product) : EMPTY);
  const [error, setError] = useState("");

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const buildPayload = () => ({
    name: form.name,
    tagline: form.tagline,
    description: form.description,
    category_id: form.category_id !== "" ? Number(form.category_id) : null,
    icon_name: form.icon_name,
    icon_color: form.icon_color,
    badge: form.badge,
    is_new: form.is_new,
    is_featured: form.is_featured,
    is_active: form.is_active,
    nav_section: form.nav_section,
    demo_url: form.demo_url || undefined,
    order: form.order,
  });

  const saveMut = useMutation({
    mutationFn: () =>
      isEdit
        ? productsApi.update(product!.slug, buildPayload())
        : productsApi.create(buildPayload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-products"] });
      onClose();
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      if (typeof data === "string") { setError("Server error — check backend logs."); return; }
      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (typeof obj.detail === "string") { setError(obj.detail); return; }
        const first = Object.entries(obj).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(" · ");
        setError(first || "Failed to save product.");
      } else {
        setError("Failed to save product.");
      }
    },
  });

  const isValid = form.name.trim().length > 0 && form.tagline.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-xl h-full bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold">{isEdit ? "Edit Product" : "New Product"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Editing: ${product!.name}` : "Fill in the details below"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Color preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0" style={{ backgroundColor: form.icon_color }}>
              {form.name.slice(0, 2) || "??"}
            </div>
            <div>
              <p className="text-sm font-semibold">{form.name || "Product name"}</p>
              <p className="text-xs text-muted-foreground">{form.tagline || "Tagline"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Product name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Order</label>
              <input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={inputCls} min={0} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Tagline *</label>
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} placeholder="Short one-liner shown in cards" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={cn(inputCls, "resize-none")} placeholder="Longer description of the product" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Category</label>
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value === "" ? "" : Number(e.target.value))} style={{ colorScheme: "dark" }} className={inputCls}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Badge</label>
              <input value={form.badge} onChange={(e) => set("badge", e.target.value)} className={inputCls} placeholder="AI, HFT, Enterprise…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Icon Name</label>
              <input value={form.icon_name} onChange={(e) => set("icon_name", e.target.value)} className={inputCls} placeholder="Lucide icon e.g. Users" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Icon Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.icon_color} onChange={(e) => set("icon_color", e.target.value)} className="w-10 h-9 rounded-lg border border-border cursor-pointer shrink-0 p-0.5 bg-background" />
                <input value={form.icon_color} onChange={(e) => set("icon_color", e.target.value)} className={cn(inputCls, "font-mono")} placeholder="#6366f1" />
              </div>
            </div>
          </div>

          {/* Navigation menu assignment */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Appears In Menu</label>
            <div className="grid grid-cols-2 gap-2">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("nav_section", s.value)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                    form.nav_section === s.value
                      ? "border-brand-500/60 bg-brand-500/10 text-brand-400"
                      : "border-border hover:border-brand-500/30 hover:bg-accent text-muted-foreground"
                  )}
                >
                  <span className="text-xs font-semibold">{s.label}</span>
                  <span className="text-[10px] mt-0.5 leading-tight opacity-70">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Demo URL</label>
            <input type="url" value={form.demo_url} onChange={(e) => set("demo_url", e.target.value)} className={inputCls} placeholder="https://demo.example.com" />
          </div>

          <div className="space-y-2">
            <Toggle value={form.is_active}   onChange={(v) => set("is_active", v)}   label="Active" desc="Show on public website" />
            <Toggle value={form.is_featured} onChange={(v) => set("is_featured", v)} label="Featured" desc="Highlight on homepage / listings" />
            <Toggle value={form.is_new}      onChange={(v) => set("is_new", v)}      label="New" desc='Show "NEW" badge on the card' />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0 bg-card/80 backdrop-blur">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
          <button
            onClick={() => saveMut.mutate()}
            disabled={!isValid || saveMut.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveMut.isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete dialog ───────────────────────────────────────────────────────────

function DeleteDialog({ product, onClose }: { product: ProductDB; onClose: () => void }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: () => productsApi.delete(product.slug),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-products"] }); onClose(); },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="text-lg font-bold mb-1">Delete Product</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{product.name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
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

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete }: { product: ProductDB; onEdit: () => void; onDelete: () => void }) {
  const qc = useQueryClient();

  const toggleFeatured = useMutation({
    mutationFn: () => productsApi.update(product.slug, { is_featured: !product.is_featured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-products"] }),
  });

  const toggleActive = useMutation({
    mutationFn: () => productsApi.update(product.slug, { is_active: !product.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-products"] }),
  });

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-accent/30 transition-colors group">
      {/* Icon */}
      <td className="pl-4 pr-3 py-3 w-14">
        <ColorDot color={product.icon_color} name={product.name.slice(0, 2)} />
      </td>

      {/* Name + tagline */}
      <td className="py-3 pr-4 min-w-[180px] max-w-[260px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold">{product.name}</span>
          {product.badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">{product.badge}</span>
          )}
          {product.is_new && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">NEW</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{product.tagline}</p>
      </td>

      {/* Category */}
      <td className="py-3 pr-4 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">{product.category?.name ?? "—"}</span>
      </td>

      {/* Icon name */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <span className="text-xs font-mono text-muted-foreground">{product.icon_name || "—"}</span>
      </td>

      {/* Active */}
      <td className="py-3 pr-4">
        <button onClick={() => toggleActive.mutate()} className="hover:opacity-80 transition-opacity">
          <ActiveBadge active={product.is_active} />
        </button>
      </td>

      {/* Featured */}
      <td className="py-3 pr-4 text-center hidden sm:table-cell">
        <button
          onClick={() => toggleFeatured.mutate()}
          className={cn("transition-colors", product.is_featured ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground/30 hover:text-amber-400")}
        >
          {product.is_featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
        </button>
      </td>

      {/* Actions */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-500/10 text-muted-foreground hover:text-brand-400 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProductsManagerPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [editProduct, setEditProduct] = useState<ProductDB | null | "new">(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductDB | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  useEffect(() => setPage(1), [debouncedSearch, categoryFilter, activeFilter]);

  const params: Record<string, string | number | boolean> = { page, page_size: 15 };
  if (debouncedSearch)    params.search = debouncedSearch;
  if (categoryFilter)     params["category__slug"] = categoryFilter;
  if (activeFilter !== "") params.is_active = activeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-products", params],
    queryFn: () => productsApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: catsData } = useQuery({
    queryKey: ["product-categories-all"],
    queryFn: () => productsApi.categories.list().then((r) => r.data),
    staleTime: 120_000,
  });

  const { data: allData } = useQuery({
    queryKey: ["dashboard-products-stats"],
    queryFn: () => productsApi.list({ page_size: 1000 }).then((r) => r.data),
    staleTime: 60_000,
  });

  const products = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 15);
  const categories = (catsData?.results ?? []) as ProductCategory[];
  const allProducts = allData?.results ?? [];

  const stats = {
    total:    allProducts.length,
    active:   allProducts.filter((p) => p.is_active).length,
    featured: allProducts.filter((p) => p.is_featured).length,
    inactive: allProducts.filter((p) => !p.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package2 className="h-6 w-6 text-brand-400" /> Products
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog — create, edit, activate, and feature</p>
        </div>
        <button
          onClick={() => setEditProduct("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-4 w-4" /> New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: stats.total,    color: "text-brand-400",  bg: "bg-brand-500/10",  icon: Package2 },
          { label: "Active",   value: stats.active,   color: "text-green-500",  bg: "bg-green-500/10",  icon: CheckCircle2 },
          { label: "Featured", value: stats.featured, color: "text-amber-400",  bg: "bg-amber-500/10",  icon: Star },
          { label: "Inactive", value: stats.inactive, color: "text-muted-foreground", bg: "bg-muted/40", icon: EyeOff },
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="flex-1 bg-transparent text-sm outline-none" />
          {search && <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
        </div>

        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
          {[["", "All"], ["true", "Active"], ["false", "Inactive"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setActiveFilter(val as "" | "true" | "false")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeFilter === val ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {lbl}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-brand-500/50 min-w-40">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="pl-4 pr-3 py-3 w-14" />
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Category</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Icon</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="py-3 pr-4 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">★</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="pl-4 pr-3 py-3"><div className="w-8 h-8 rounded-lg bg-muted animate-pulse" /></td>
                    <td className="py-3 pr-4"><div className="h-4 w-40 bg-muted animate-pulse rounded mb-1.5" /><div className="h-3 w-56 bg-muted animate-pulse rounded" /></td>
                    <td className="py-3 pr-4 hidden md:table-cell"><div className="h-3 w-24 bg-muted animate-pulse rounded" /></td>
                    <td colSpan={4} />
                  </tr>
                ))
                : products.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Package2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">No products found</p>
                        {(search || categoryFilter || activeFilter) && (
                          <button onClick={() => { setSearch(""); setCategoryFilter(""); setActiveFilter(""); }}
                            className="mt-3 text-xs text-brand-400 hover:text-brand-300">Clear filters</button>
                        )}
                      </td>
                    </tr>
                  )
                  : products.map((p) => (
                    <ProductRow key={p.slug} product={p} onEdit={() => setEditProduct(p)} onDelete={() => setDeleteProduct(p)} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, totalCount)} of {totalCount}
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
        {editProduct !== null && (
          <ProductModal product={editProduct === "new" ? null : editProduct} categories={categories} onClose={() => setEditProduct(null)} />
        )}
        {deleteProduct && (
          <DeleteDialog product={deleteProduct} onClose={() => setDeleteProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
