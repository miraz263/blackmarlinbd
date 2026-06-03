import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { siteSettingsService, siteSettingsKeys } from "@/services/siteSettingsService";
import type { SiteSettings, ContactSettings } from "@/types";
import { cn } from "@/lib/utils";

// ─── Primitives ───────────────────────────────────────────────────────────────

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

// ─── Tab: Page Content ────────────────────────────────────────────────────────

function PageContentTab() {
  const qc = useQueryClient();
  const [toast, setToast] = useState(false);

  const { data: raw, isLoading } = useQuery({
    queryKey: siteSettingsKeys.contact,
    queryFn: () => siteSettingsService.getContactSettings().then((r) => r.data),
    staleTime: 60_000,
  });

  const [form, setForm] = useState<Partial<ContactSettings>>({
    page_title: "", page_subtitle: "", response_time_text: "", response_time_desc: "",
    office_hours: "", support_email: "", sales_email: "",
  });
  const [saved, setSaved] = useState(form);

  useEffect(() => {
    if (!raw) return;
    const next: Partial<ContactSettings> = {
      page_title:         raw.page_title         ?? "",
      page_subtitle:      raw.page_subtitle       ?? "",
      response_time_text: raw.response_time_text  ?? "",
      response_time_desc: raw.response_time_desc  ?? "",
      office_hours:       raw.office_hours        ?? "",
      support_email:      raw.support_email       ?? "",
      sales_email:        raw.sales_email         ?? "",
    };
    setForm(next);
    setSaved(next);
  }, [raw]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => siteSettingsService.updateContactSettings(form),
    onSuccess: () => {
      setSaved(form);
      qc.invalidateQueries({ queryKey: siteSettingsKeys.contact });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5">
        <Field label="Page Title" hint="Main heading shown at the top of the contact page">
          <input className={inputCls} value={form.page_title ?? ""} onChange={(e) => set("page_title", e.target.value)} placeholder="Let's Build Together" />
        </Field>
        <Field label="Page Subtitle" hint="Subtext below the heading">
          <textarea className={textareaCls} rows={2} value={form.page_subtitle ?? ""} onChange={(e) => set("page_subtitle", e.target.value)} placeholder="Tell us about your project. We'll get back to you within 24 hours." />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Response Time Badge" hint='e.g. "⚡ We respond within 24 hours"'>
            <input className={inputCls} value={form.response_time_text ?? ""} onChange={(e) => set("response_time_text", e.target.value)} placeholder="⚡ We respond within 24 hours" />
          </Field>
          <Field label="Response Time Description">
            <input className={inputCls} value={form.response_time_desc ?? ""} onChange={(e) => set("response_time_desc", e.target.value)} placeholder="For urgent inquiries, call us directly." />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Support Email">
            <input type="email" className={inputCls} value={form.support_email ?? ""} onChange={(e) => set("support_email", e.target.value)} placeholder="support@company.com" />
          </Field>
          <Field label="Sales Email">
            <input type="email" className={inputCls} value={form.sales_email ?? ""} onChange={(e) => set("sales_email", e.target.value)} placeholder="sales@company.com" />
          </Field>
        </div>
        <Field label="Office Hours">
          <input className={inputCls} value={form.office_hours ?? ""} onChange={(e) => set("office_hours", e.target.value)} placeholder="Mon – Fri · 9 AM – 6 PM (UTC+6)" />
        </Field>
      </div>
      <SaveBar dirty={dirty} saving={save.isPending} onSave={() => save.mutate()} />
      <AnimatePresence>{toast && <Toast msg="Contact page settings saved!" />}</AnimatePresence>
    </div>
  );
}

// ─── Tab: Contact Info ────────────────────────────────────────────────────────

function ContactInfoTab() {
  const qc = useQueryClient();
  const [toast, setToast] = useState(false);

  const { data: raw, isLoading } = useQuery({
    queryKey: siteSettingsKeys.site,
    queryFn: () => siteSettingsService.getSiteSettings().then((r) => r.data),
    staleTime: 60_000,
  });

  const [form, setForm] = useState<Partial<SiteSettings>>({ email: "", phone: "", whatsapp: "", address: "" });
  const [saved, setSaved] = useState(form);

  useEffect(() => {
    if (!raw) return;
    const next = { email: raw.email ?? "", phone: raw.phone ?? "", whatsapp: raw.whatsapp ?? "", address: raw.address ?? "" };
    setForm(next);
    setSaved(next);
  }, [raw]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => siteSettingsService.updateSiteSettings(form),
    onSuccess: () => {
      setSaved(form);
      qc.invalidateQueries({ queryKey: siteSettingsKeys.site });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">These values appear in the Email, Phone and Offices panel on the contact page. They are also used site-wide (footer, navbar).</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" hint="Shown as the primary contact email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="email" className={cn(inputCls, "pl-9")} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="hello@company.com" />
          </div>
        </Field>
        <Field label="Phone">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className={cn(inputCls, "pl-9")} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
        </Field>
        <Field label="WhatsApp" hint="Optional — leave blank to hide">
          <input className={inputCls} value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+880 1234-567890" />
        </Field>
        <Field label="Office Locations" hint="Shown in the Offices row">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className={cn(inputCls, "pl-9")} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Dhaka · New York · London" />
          </div>
        </Field>
      </div>
      <SaveBar dirty={dirty} saving={save.isPending} onSave={() => save.mutate()} />
      <AnimatePresence>{toast && <Toast msg="Contact info saved!" />}</AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "page",    label: "Page Content", icon: MessageSquare },
  { key: "contact", label: "Contact Info", icon: Phone         },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function ContactManagerPage() {
  const [tab, setTab] = useState<Tab>("page");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-brand-400" /> Contact Page
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Edit the contact page title, info panel, and response messaging</p>
      </div>

      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              tab === key ? "bg-brand-500 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {tab === "page"    && <PageContentTab />}
        {tab === "contact" && <ContactInfoTab />}
      </div>
    </div>
  );
}
