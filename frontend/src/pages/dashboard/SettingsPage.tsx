import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Save, Upload, Globe, Layout, Phone, Search, Settings,
  FolderKanban, Package2, FileText, Briefcase, Image, Layers,
  GitMerge, Languages, BarChart2, ShieldCheck, Sparkles, Users,
  ChevronRight, AlertTriangle, Trash2, RefreshCw,
  Tag, Loader2,
} from "lucide-react";
import { siteSettingsService, siteSettingsKeys } from "@/services/siteSettingsService";
import { seoService, seoKeys } from "@/services/seoService";
import type { SiteSettings, FooterSettings, ContactSettings, SEOPage } from "@/types";
import { cn } from "@/lib/utils";

// ─── Shared primitives ───────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all text-foreground placeholder:text-muted-foreground/50";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={props.rows ?? 3} className={`${inputCls} resize-none`} />;
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
      <div><p className="text-sm font-medium">{label}</p>{desc && <p className="text-xs text-muted-foreground">{desc}</p>}</div>
      <button type="button" onClick={() => onChange(!checked)}
        className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0", checked ? "bg-brand-500" : "bg-muted")}>
        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", checked ? "left-5" : "left-0.5")} />
      </button>
    </div>
  );
}

function SaveBar({ dirty, saving, onSave }: { dirty: boolean; saving: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center justify-end pt-4 border-t border-border">
      <button onClick={onSave} disabled={!dirty || saving}
        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
        <Save className="h-4 w-4" />
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function ImageUploadField({ label, currentUrl, onFile }: { label: string; currentUrl?: string | null; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label={label}>
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="h-12 w-auto max-w-[120px] rounded-lg object-contain border border-border bg-background p-1" />
        ) : (
          <div className="h-12 w-24 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">None</div>
        )}
        <button type="button" onClick={() => ref.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors">
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
    </Field>
  );
}

// ─── Section: Overview (control panel) ───────────────────────────────────────

const QUICK_LINKS = [
  { label: "Projects",     href: "/dashboard/projects",     icon: FolderKanban, color: "text-brand-400",        bg: "bg-brand-500/10",   desc: "Portfolio CRUD"        },
  { label: "Products",     href: "/dashboard/products",     icon: Package2,     color: "text-cyan-400",         bg: "bg-cyan-500/10",    desc: "Product catalog"       },
  { label: "Blog",         href: "/dashboard/blog",         icon: FileText,     color: "text-green-400",        bg: "bg-green-500/10",   desc: "Posts & content"       },
  { label: "Jobs",         href: "/dashboard/jobs",         icon: Briefcase,    color: "text-amber-400",        bg: "bg-amber-500/10",   desc: "Open positions"        },
  { label: "Media",        href: "/dashboard/media",        icon: Image,        color: "text-purple-400",       bg: "bg-purple-500/10",  desc: "Files & uploads"       },
  { label: "Pages",        href: "/dashboard/pages",        icon: Layers,       color: "text-blue-400",         bg: "bg-blue-500/10",    desc: "Custom pages"          },
  { label: "Users",        href: "/dashboard/users",        icon: Users,        color: "text-red-400",          bg: "bg-red-500/10",     desc: "Accounts & roles"      },
  { label: "Roles",        href: "/dashboard/roles",        icon: ShieldCheck,  color: "text-orange-400",       bg: "bg-orange-500/10",  desc: "Permissions"           },
  { label: "Workflow",     href: "/dashboard/workflow",     icon: GitMerge,     color: "text-indigo-400",       bg: "bg-indigo-500/10",  desc: "Review & approvals"    },
  { label: "Translations", href: "/dashboard/translations", icon: Languages,    color: "text-teal-400",         bg: "bg-teal-500/10",    desc: "Multilingual content"  },
  { label: "Analytics",   href: "/dashboard/analytics",    icon: BarChart2,    color: "text-pink-400",         bg: "bg-pink-500/10",    desc: "Traffic & insights"    },
  { label: "AI",           href: "/dashboard/ai",           icon: Sparkles,     color: "text-violet-400",       bg: "bg-violet-500/10",  desc: "AI tools"              },
];

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold mb-1">Control Panel</h3>
        <p className="text-sm text-muted-foreground">Quick access to every section of the dashboard.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {QUICK_LINKS.map(({ label, href, icon: Icon, color, bg, desc }) => (
          <Link key={href} to={href}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold group-hover:text-brand-400 transition-colors">{label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-brand-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Site ────────────────────────────────────────────────────────────

function SiteSection() {
  const qc = useQueryClient();
  const { data: initial } = useQuery({ queryKey: siteSettingsKeys.site, queryFn: () => siteSettingsService.getSiteSettings().then((r) => r.data) });
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [fav, setFav]   = useState<File | null>(null);
  const dirty = Object.keys(form).length > 0 || !!logo || !!fav;
  const set = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const val = (k: keyof SiteSettings) => (form[k] ?? initial?.[k] ?? "") as string;
  const mut = useMutation({
    mutationFn: () => {
      if (logo || fav) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        if (logo) fd.append("logo", logo);
        if (fav)  fd.append("favicon", fav);
        return siteSettingsService.updateSiteSettings(fd);
      }
      return siteSettingsService.updateSiteSettings(form);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: siteSettingsKeys.site }); setForm({}); setLogo(null); setFav(null); },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Company Name"><Input value={val("company_name")} onChange={set("company_name")} placeholder="BlackMarlinBD" /></Field>
        <Field label="Short Name"><Input value={val("company_short_name")} onChange={set("company_short_name")} placeholder="BMB" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField label="Logo" currentUrl={initial?.logo_url} onFile={setLogo} />
        <ImageUploadField label="Favicon" currentUrl={initial?.favicon_url} onFile={setFav} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email"><Input type="email" value={val("email")} onChange={set("email")} placeholder="info@company.com" /></Field>
        <Field label="Phone"><Input value={val("phone")} onChange={set("phone")} placeholder="+880…" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="WhatsApp"><Input value={val("whatsapp")} onChange={set("whatsapp")} placeholder="+880…" /></Field>
      </div>
      <Field label="Address"><Textarea value={val("address")} onChange={set("address")} placeholder="Dhaka, Bangladesh" /></Field>
      <Field label="Google Maps Embed URL" hint="Paste the full iframe embed src URL">
        <Input value={val("google_map_embed")} onChange={set("google_map_embed")} placeholder="https://maps.google.com/…" />
      </Field>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Social Links</p>
        <div className="grid grid-cols-2 gap-4">
          {(["facebook","linkedin","youtube","twitter","instagram"] as const).map((s) => (
            <Field key={s} label={s.charAt(0).toUpperCase() + s.slice(1)}>
              <Input value={val(s)} onChange={set(s)} placeholder={`https://${s}.com/…`} />
            </Field>
          ))}
        </div>
      </div>
      <SaveBar dirty={dirty} saving={mut.isPending} onSave={() => mut.mutate()} />
    </div>
  );
}

// ─── Section: Footer ──────────────────────────────────────────────────────────

function FooterSection() {
  const qc = useQueryClient();
  const { data: initial } = useQuery({ queryKey: siteSettingsKeys.footer, queryFn: () => siteSettingsService.getFooterSettings().then((r) => r.data) });
  const [form, setForm] = useState<Partial<FooterSettings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const dirty = Object.keys(form).length > 0 || !!logoFile;
  const set = (k: keyof FooterSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const val = (k: keyof FooterSettings) => (form[k] ?? initial?.[k] ?? "") as string;
  const mut = useMutation({
    mutationFn: () => {
      if (logoFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append("footer_logo", logoFile);
        return siteSettingsService.updateFooterSettings(fd);
      }
      return siteSettingsService.updateFooterSettings(form);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: siteSettingsKeys.footer }); setForm({}); setLogoFile(null); },
  });

  return (
    <div className="space-y-6">
      <Field label="Copyright Text"><Input value={val("copyright_text")} onChange={set("copyright_text")} placeholder="© 2025 BlackMarlinBD" /></Field>
      <Field label="Footer About Text"><Textarea value={val("footer_about")} onChange={set("footer_about")} rows={4} placeholder="Brief company description…" /></Field>
      <ImageUploadField label="Footer Logo" currentUrl={initial?.footer_logo_url} onFile={setLogoFile} />
      <Toggle checked={Boolean(form.newsletter_enabled ?? initial?.newsletter_enabled)}
        onChange={(v) => setForm((p) => ({ ...p, newsletter_enabled: v }))}
        label="Newsletter Signup" desc="Show email subscribe form in footer" />
      <SaveBar dirty={dirty} saving={mut.isPending} onSave={() => mut.mutate()} />
    </div>
  );
}

// ─── Section: Contact ─────────────────────────────────────────────────────────

function ContactSection() {
  const qc = useQueryClient();
  const { data: initial } = useQuery({ queryKey: siteSettingsKeys.contact, queryFn: () => siteSettingsService.getContactSettings().then((r) => r.data) });
  const [form, setForm] = useState<Partial<ContactSettings>>({});
  const dirty = Object.keys(form).length > 0;
  const set = (k: keyof ContactSettings) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const val = (k: keyof ContactSettings) => (form[k] ?? initial?.[k] ?? "") as string;
  const mut = useMutation({
    mutationFn: () => siteSettingsService.updateContactSettings(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: siteSettingsKeys.contact }); setForm({}); },
  });

  return (
    <div className="space-y-6">
      <Field label="Office Hours"><Input value={val("office_hours")} onChange={set("office_hours")} placeholder="Mon–Fri, 9 AM – 6 PM" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Support Email"><Input type="email" value={val("support_email")} onChange={set("support_email")} placeholder="support@company.com" /></Field>
        <Field label="Sales Email"><Input type="email" value={val("sales_email")} onChange={set("sales_email")} placeholder="sales@company.com" /></Field>
      </div>
      <SaveBar dirty={dirty} saving={mut.isPending} onSave={() => mut.mutate()} />
    </div>
  );
}

// ─── Section: SEO ─────────────────────────────────────────────────────────────

const SEO_PAGE_KEYS = [
  "home", "about", "services", "projects", "blog", "careers", "contact", "products",
];

function SEOPageEditor({ pageKey }: { pageKey: string }) {
  const qc = useQueryClient();
  const { data: initial, isLoading } = useQuery({
    queryKey: seoKeys.page(pageKey),
    queryFn: () => seoService.getByKey(pageKey).then((r) => r.data).catch(() => null),
    staleTime: 60_000,
  });

  const [form, setForm] = useState<Partial<SEOPage>>({});
  const [ogFile, setOgFile] = useState<File | null>(null);
  const ogRef = useRef<HTMLInputElement>(null);
  const dirty = Object.keys(form).length > 0 || !!ogFile;

  const set = (k: keyof SEOPage) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const val = (k: keyof SEOPage) => (form[k] ?? initial?.[k] ?? "") as string;

  const mut = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = { ...form, page_key: pageKey };
      if (ogFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v ?? "")));
        fd.append("og_image", ogFile);
        return initial ? seoService.upsert(pageKey, fd) : seoService.create(fd);
      }
      return initial ? seoService.upsert(pageKey, payload) : seoService.create({ ...payload });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: seoKeys.page(pageKey) }); setForm({}); setOgFile(null); },
  });

  if (isLoading) return <div className="h-32 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-brand-400" /></div>;

  return (
    <div className="space-y-4 pt-4">
      <Field label="Meta Title" hint="50–60 characters ideal">
        <div>
          <Input value={val("meta_title")} onChange={set("meta_title")} placeholder={`${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} — BlackMarlinBD`} maxLength={200} />
          <div className="flex justify-end mt-1">
            <span className={cn("text-[10px]", val("meta_title").length > 60 ? "text-red-400" : "text-muted-foreground")}>{val("meta_title").length}/60</span>
          </div>
        </div>
      </Field>
      <Field label="Meta Description" hint="120–160 characters ideal">
        <div>
          <Textarea value={val("meta_description")} onChange={set("meta_description")} rows={3} placeholder="Page description for search engines…" maxLength={500} />
          <div className="flex justify-end mt-1">
            <span className={cn("text-[10px]", val("meta_description").length > 160 ? "text-red-400" : "text-muted-foreground")}>{val("meta_description").length}/160</span>
          </div>
        </div>
      </Field>
      <Field label="Keywords" hint="Comma-separated">
        <Input value={val("keywords")} onChange={set("keywords")} placeholder="ai, cloud, fintech, bangladesh" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="OG Title"><Input value={val("og_title")} onChange={set("og_title")} placeholder="Defaults to meta title" /></Field>
        <Field label="Canonical URL"><Input value={val("canonical_url")} onChange={set("canonical_url")} placeholder="https://…" /></Field>
      </div>
      <Field label="OG Image (1200×630 px)">
        <div className="flex items-center gap-4">
          {(ogFile ? URL.createObjectURL(ogFile) : (initial as SEOPage & { og_image_url?: string })?.og_image_url) ? (
            <img src={ogFile ? URL.createObjectURL(ogFile) : (initial as SEOPage & { og_image_url?: string })?.og_image_url} alt="OG" className="h-12 w-auto rounded-lg border border-border object-cover" />
          ) : (
            <div className="h-12 w-24 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">None</div>
          )}
          <button type="button" onClick={() => ogRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors">
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
          <input ref={ogRef} type="file" accept="image/*" className="hidden" onChange={(e) => setOgFile(e.target.files?.[0] ?? null)} />
        </div>
      </Field>
      <Toggle checked={Boolean(form.no_index ?? initial?.no_index ?? false)}
        onChange={(v) => setForm((p) => ({ ...p, no_index: v }))}
        label="No Index" desc="Add noindex,nofollow to prevent search engine indexing" />
      <div className="flex justify-end pt-2 border-t border-border">
        <button onClick={() => mut.mutate()} disabled={!dirty || mut.isPending}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
          <Save className="h-4 w-4" />
          {mut.isPending ? "Saving…" : "Save SEO"}
        </button>
      </div>
    </div>
  );
}

function SEOSection() {
  const [activePage, setActivePage] = useState(SEO_PAGE_KEYS[0]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Manage meta titles, descriptions, and OG images for each public page.</p>
      <div className="flex gap-4">
        {/* Page list */}
        <div className="w-44 shrink-0 space-y-0.5">
          {SEO_PAGE_KEYS.map((key) => (
            <button key={key} onClick={() => setActivePage(key)}
              className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors capitalize",
                activePage === key ? "bg-brand-500/10 text-brand-400" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        {/* Editor */}
        <div className="flex-1 min-w-0 border border-border rounded-2xl p-5 bg-background">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-4 w-4 text-brand-400" />
            <h4 className="font-semibold text-sm capitalize">{activePage} Page SEO</h4>
          </div>
          <SEOPageEditor key={activePage} pageKey={activePage} />
        </div>
      </div>
    </div>
  );
}

// ─── Section: Advanced ────────────────────────────────────────────────────────

function AdvancedSection() {
  const qc = useQueryClient();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const clearCaches = async () => {
    setClearing(true);
    // Invalidate all TanStack Query caches
    await qc.invalidateQueries();
    await new Promise((r) => setTimeout(r, 600));
    setClearing(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* System info */}
      <div>
        <h3 className="text-sm font-semibold mb-3">System</h3>
        <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {[
            { label: "Platform",  value: "BlackMarlinBD CMS" },
            { label: "Frontend",  value: "React 18 · TanStack Query · Framer Motion" },
            { label: "Backend",   value: "Django REST Framework · PostgreSQL" },
            { label: "Storage",   value: "S3 Compatible (via Django media)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 bg-card">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className="text-xs text-foreground font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cache */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Cache</h3>
        <p className="text-xs text-muted-foreground mb-3">Clear the frontend query cache so all data is re-fetched fresh from the API.</p>
        <button onClick={clearCaches} disabled={clearing}
          className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
            cleared ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-accent hover:bg-accent/80 text-foreground border border-border")}>
          <RefreshCw className={cn("h-4 w-4", clearing && "animate-spin")} />
          {clearing ? "Clearing…" : cleared ? "Cache Cleared!" : "Clear Frontend Cache"}
        </button>
      </div>

      {/* Danger zone */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
        </div>
        <div className="rounded-2xl border border-red-500/20 overflow-hidden divide-y divide-red-500/10">
          <div className="flex items-center justify-between p-4 bg-red-500/5">
            <div>
              <p className="text-sm font-medium">Delete Your Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your admin account. This cannot be undone.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-500/5">
            <div>
              <p className="text-sm font-medium">Reset Site Settings</p>
              <p className="text-xs text-muted-foreground">Restore all site/footer/contact settings to their defaults.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

type Section = "overview" | "site" | "footer" | "contact" | "seo" | "advanced";

const SIDEBAR: { key: Section; label: string; icon: React.ElementType; badge?: string }[] = [
  { key: "overview", label: "Control Panel", icon: Settings       },
  { key: "site",     label: "Site",          icon: Globe          },
  { key: "footer",   label: "Footer",        icon: Layout         },
  { key: "contact",  label: "Contact",       icon: Phone          },
  { key: "seo",      label: "SEO",           icon: Search, badge: `${SEO_PAGE_KEYS.length} pages` },
  { key: "advanced", label: "Advanced",      icon: AlertTriangle  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("overview");

  const SECTION_LABELS: Record<Section, string> = {
    overview: "Control Panel",
    site:     "Site Settings",
    footer:   "Footer Settings",
    contact:  "Contact Settings",
    seo:      "SEO Manager",
    advanced: "Advanced",
  };

  return (
    <div className="flex gap-6 h-full">

      {/* Sidebar */}
      <aside className="w-52 shrink-0">
        <div className="sticky top-0 space-y-1">
          {SIDEBAR.map(({ key, label, icon: Icon, badge }) => (
            <button key={key} onClick={() => setSection(key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                section === key
                  ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
              )}>
              <Icon className={cn("h-4 w-4 shrink-0", section === key ? "text-brand-400" : "")} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{badge}</span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <div className="mb-6">
            <h2 className="text-xl font-bold">{SECTION_LABELS[section]}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {section === "overview"  && "Manage every part of your site from one place."}
              {section === "site"      && "Company identity, logo, contact info, and social links."}
              {section === "footer"    && "Copyright text, footer logo, and newsletter toggle."}
              {section === "contact"   && "Office hours and support email addresses."}
              {section === "seo"       && "Per-page meta tags, OG images, and indexing settings."}
              {section === "advanced"  && "Cache management and danger-zone actions."}
            </p>
          </div>

          <div className={cn("bg-card border border-border rounded-2xl p-6", section === "overview" && "bg-transparent border-none p-0")}>
            {section === "overview"  && <OverviewSection />}
            {section === "site"      && <SiteSection />}
            {section === "footer"    && <FooterSection />}
            {section === "contact"   && <ContactSection />}
            {section === "seo"       && <SEOSection />}
            {section === "advanced"  && <AdvancedSection />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
