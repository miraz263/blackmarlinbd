import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, Package2, Layers, Star, EyeOff, Briefcase,
  ArrowRightLeft, ChevronDown, Loader2, Globe, Tag,
  CheckCircle2, Clock, Archive, type LucideIcon,
} from "lucide-react";
import { projectsApi } from "@/services/api/projects";
import { productsApi } from "@/services/api/products";
import { servicesService, servicesKeys } from "@/services/serviceService";
import type { Project, ProductDB, ServiceListItem, ServiceCategory } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "projects" | "products" | "services";

type ProductNavSection = "products" | "services" | "featured" | "hidden";

// For projects we derive a virtual "section" from status + is_featured
function projectSection(p: Project): string {
  if (p.status === "archived") return "archived";
  if (p.status === "draft")    return "draft";
  if (p.is_featured)           return "featured";
  return "portfolio";
}

// ─── Section configs ────────────────────────────────────────────────────────

interface SectionCfg {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

const PRODUCT_SECTIONS: SectionCfg[] = [
  { id: "products", label: "Products Menu",     icon: Package2,    color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  { id: "services", label: "Services Menu",     icon: Layers,      color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20"  },
  { id: "featured", label: "Homepage Featured", icon: Star,        color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  { id: "hidden",   label: "Hidden",            icon: EyeOff,      color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border"         },
];

const PROJECT_SECTIONS: SectionCfg[] = [
  { id: "featured",  label: "Homepage Featured", icon: Star,        color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
  { id: "portfolio", label: "Portfolio",         icon: Briefcase,   color: "text-brand-400",  bg: "bg-brand-500/10",  border: "border-brand-500/20"  },
  { id: "draft",     label: "Draft",             icon: Clock,       color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "archived",  label: "Archived",          icon: Archive,     color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border"      },
];

// ─── Transfer dropdown ──────────────────────────────────────────────────────

function TransferDropdown({
  sections,
  currentId,
  onTransfer,
  isPending,
}: {
  sections: SectionCfg[];
  currentId: string;
  onTransfer: (id: string) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = sections.find((s) => s.id === currentId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all",
          current ? `${current.color} ${current.bg} ${current.border}` : "text-muted-foreground bg-muted/20 border-border",
          "hover:opacity-80"
        )}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          current && <current.icon className="h-3 w-3 shrink-0" />
        )}
        <span className="truncate max-w-[100px]">{current?.label ?? "—"}</span>
        <ChevronDown className={cn("h-3 w-3 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden py-1"
            >
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { onTransfer(s.id); setOpen(false); }}
                  disabled={s.id === currentId}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left",
                    s.id === currentId
                      ? `${s.color} ${s.bg} cursor-default`
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <s.icon className={cn("h-3.5 w-3.5 shrink-0", s.id === currentId ? s.color : "")} />
                  {s.label}
                  {s.id === currentId && <span className="ml-auto text-[10px] opacity-60">current</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Products tab ───────────────────────────────────────────────────────────

function ProductsTab() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sections-products"],
    queryFn: () => productsApi.list({ page_size: 200 }).then((r) => r.data),
    staleTime: 30_000,
  });

  const transfer = useMutation({
    mutationFn: ({ slug, section }: { slug: string; section: string }) =>
      productsApi.update(slug, { nav_section: section as ProductNavSection }),
    onMutate: ({ slug }) => setPending(slug),
    onSettled: () => {
      setPending(null);
      qc.invalidateQueries({ queryKey: ["sections-products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-products"] });
    },
  });

  const products: ProductDB[] = data?.results ?? [];

  if (isLoading) return <TabSkeleton />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {PRODUCT_SECTIONS.map((sec) => {
        const items = products.filter((p) => (p.nav_section ?? "products") === sec.id);
        return (
          <SectionColumn key={sec.id} cfg={sec} count={items.length}>
            {items.map((p) => (
              <ItemCard key={p.slug} title={p.name} subtitle={p.tagline} badge={p.badge}>
                <TransferDropdown
                  sections={PRODUCT_SECTIONS}
                  currentId={p.nav_section ?? "products"}
                  onTransfer={(id) => transfer.mutate({ slug: p.slug, section: id })}
                  isPending={pending === p.slug}
                />
              </ItemCard>
            ))}
          </SectionColumn>
        );
      })}
    </div>
  );
}

// ─── Projects tab ───────────────────────────────────────────────────────────

function ProjectsTab() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sections-projects"],
    queryFn: () => projectsApi.list({ page_size: 200 }).then((r) => r.data),
    staleTime: 30_000,
  });

  const transfer = useMutation({
    mutationFn: ({ slug, section }: { slug: string; section: string }) => {
      const fd = new FormData();
      if (section === "featured")  { fd.append("status", "published"); fd.append("is_featured", "true");  }
      if (section === "portfolio") { fd.append("status", "published"); fd.append("is_featured", "false"); }
      if (section === "draft")     { fd.append("status", "draft");     fd.append("is_featured", "false"); }
      if (section === "archived")  { fd.append("status", "archived");  fd.append("is_featured", "false"); }
      return projectsApi.update(slug, fd);
    },
    onMutate: ({ slug }) => setPending(slug),
    onSettled: () => {
      setPending(null);
      qc.invalidateQueries({ queryKey: ["sections-projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard-projects"] });
    },
  });

  const projects: Project[] = data?.results ?? [];

  if (isLoading) return <TabSkeleton />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {PROJECT_SECTIONS.map((sec) => {
        const items = projects.filter((p) => projectSection(p) === sec.id);
        return (
          <SectionColumn key={sec.id} cfg={sec} count={items.length}>
            {items.map((p) => (
              <ItemCard key={p.slug} title={p.title} subtitle={p.short_description}
                badge={p.category?.name} thumbnail={p.thumbnail ?? undefined}>
                <TransferDropdown
                  sections={PROJECT_SECTIONS}
                  currentId={projectSection(p)}
                  onTransfer={(id) => transfer.mutate({ slug: p.slug, section: id })}
                  isPending={pending === p.slug}
                />
              </ItemCard>
            ))}
          </SectionColumn>
        );
      })}
    </div>
  );
}

// ─── Services tab ───────────────────────────────────────────────────────────

function ServicesTab() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const { data: catData } = useQuery({
    queryKey: servicesKeys.categories,
    queryFn: () => servicesService.getCategories().then((r) => r.data.results),
    staleTime: 60_000,
  });

  const { data: svcData, isLoading } = useQuery({
    queryKey: ["sections-services"],
    queryFn: () => servicesService.getAll({ page_size: 200 }).then((r) => r.data.results),
    staleTime: 30_000,
  });

  const categories: ServiceCategory[] = catData ?? [];
  const services: ServiceListItem[]   = svcData  ?? [];

  const transfer = useMutation({
    mutationFn: ({ slug, categoryId }: { slug: string; categoryId: number | null }) =>
      servicesService.update(slug, { category_id: categoryId }),
    onMutate: ({ slug }) => setPending(slug),
    onSettled: () => {
      setPending(null);
      qc.invalidateQueries({ queryKey: ["sections-services"] });
      qc.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });

  // Build section configs dynamically from API categories
  const serviceSections: SectionCfg[] = [
    ...categories.map((c) => ({
      id: String(c.id),
      label: c.name,
      icon: Tag as LucideIcon,
      color: "text-foreground",
      bg: "bg-card",
      border: "border-border",
    })),
    {
      id: "uncategorized",
      label: "Uncategorized",
      icon: Globe,
      color: "text-muted-foreground",
      bg: "bg-muted/20",
      border: "border-border",
    },
  ];

  if (isLoading) return <TabSkeleton />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {serviceSections.map((sec) => {
        const items =
          sec.id === "uncategorized"
            ? services.filter((s) => !s.category)
            : services.filter((s) => String(s.category?.id) === sec.id);

        const cat = categories.find((c) => String(c.id) === sec.id);

        return (
          <SectionColumn
            key={sec.id}
            cfg={{ ...sec, color: cat ? "text-foreground" : sec.color }}
            count={items.length}
            accentColor={cat?.color}
          >
            {items.map((s) => (
              <ItemCard key={s.slug} title={s.title} subtitle={s.tagline ?? s.short_description}
                badge={s.featured ? "Featured" : undefined}
                icon={
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (s.category?.color ?? "#6366f1") + "22" }}>
                    <Layers className="h-3.5 w-3.5" style={{ color: s.category?.color ?? "#6366f1" }} />
                  </div>
                }>
                <TransferDropdown
                  sections={serviceSections}
                  currentId={s.category ? String(s.category.id) : "uncategorized"}
                  onTransfer={(id) =>
                    transfer.mutate({
                      slug: s.slug,
                      categoryId: id === "uncategorized" ? null : Number(id),
                    })
                  }
                  isPending={pending === s.slug}
                />
              </ItemCard>
            ))}
          </SectionColumn>
        );
      })}
    </div>
  );
}

// ─── Shared primitives ──────────────────────────────────────────────────────

function SectionColumn({
  cfg, count, accentColor, children,
}: {
  cfg: SectionCfg;
  count: number;
  accentColor?: string;
  children: React.ReactNode;
}) {
  const Icon = cfg.icon;
  return (
    <div className={cn("rounded-2xl border flex flex-col min-h-[200px]", cfg.border)}>
      {/* Column header */}
      <div className={cn("flex items-center justify-between px-4 py-3 rounded-t-2xl border-b", cfg.bg, cfg.border)}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", cfg.color)} style={accentColor ? { color: accentColor } : {}} />
          <span className="text-sm font-semibold text-foreground">{cfg.label}</span>
        </div>
        <span className={cn("text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full", cfg.bg, cfg.color,
          "border", cfg.border)}>
          {count}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {count === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground/50">No items</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ItemCard({
  title, subtitle, badge, thumbnail, icon, children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  thumbnail?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group p-3 rounded-xl bg-card border border-border hover:border-brand-500/30 transition-all"
    >
      <div className="flex items-start gap-2.5">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
        ) : icon ? (
          icon
        ) : (
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 text-brand-400 text-xs font-bold">
            {title[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs font-semibold text-foreground truncate">{title}</p>
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-500/10 text-brand-400 shrink-0">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <ArrowRightLeft className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        {children}
      </div>
    </motion.div>
  );
}

function TabSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border overflow-hidden">
          <div className="h-12 bg-muted/30 animate-pulse" />
          <div className="p-3 space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-16 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab stats bar ──────────────────────────────────────────────────────────

function TabButton({
  active, label, icon: Icon, count, onClick,
}: {
  tab?: Tab; active: boolean; label: string; icon: LucideIcon; count?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-medium transition-all",
        active
          ? "bg-brand-500/10 border-brand-500/40 text-brand-400 shadow-lg shadow-brand-500/10"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-brand-500/20"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-brand-400" : "text-muted-foreground")} />
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn("text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full",
          active ? "bg-brand-500/20 text-brand-400" : "bg-muted text-muted-foreground")}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function SectionsManagerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  const { data: projectsData } = useQuery({
    queryKey: ["sections-projects-count"],
    queryFn: () => projectsApi.list({ page_size: 1 }).then((r) => r.data.count),
    staleTime: 60_000,
  });

  const { data: productsData } = useQuery({
    queryKey: ["sections-products-count"],
    queryFn: () => productsApi.list({ page_size: 1 }).then((r) => r.data.count),
    staleTime: 60_000,
  });

  const { data: servicesData } = useQuery({
    queryKey: ["sections-services-count"],
    queryFn: () => servicesService.getAll({ page_size: 1 }).then((r) => r.data.count),
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ArrowRightLeft className="h-6 w-6 text-brand-400" /> Sections
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Organise and transfer projects, products, and services between display sections
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20">
        <CheckCircle2 className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Use the <span className="font-semibold text-foreground">section badge</span> on each item to instantly move it to a different display area.
          Product transfers update the navigation menu immediately.
          Project transfers update publish status and homepage visibility.
          Service transfers reassign the content category.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-3">
        <TabButton tab="products"  active={activeTab === "products"}  label="Products"  icon={Package2}     count={productsData}  onClick={() => setActiveTab("products")}  />
        <TabButton tab="projects"  active={activeTab === "projects"}  label="Projects"  icon={FolderKanban} count={projectsData}  onClick={() => setActiveTab("projects")}  />
        <TabButton tab="services"  active={activeTab === "services"}  label="Services"  icon={Layers}       count={servicesData}  onClick={() => setActiveTab("services")}  />
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "services" && <ServicesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
