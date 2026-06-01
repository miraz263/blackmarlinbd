import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, Upload, Globe, Layout, Phone } from "lucide-react";
import { siteSettingsService, siteSettingsKeys } from "@/services/siteSettingsService";
import type { SiteSettings, FooterSettings, ContactSettings } from "@/types";

// ─── Shared primitives ───────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={3} className={`${inputCls} resize-none`} />;
}

function SaveBar({
  dirty,
  saving,
  onSave,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-end pt-4 border-t border-border">
      <button
        onClick={onSave}
        disabled={!dirty || saving}
        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function ImageUploadField({
  label,
  currentUrl,
  onFile,
}: {
  label: string;
  currentUrl: string | null | undefined;
  onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label={label}>
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="h-12 w-auto max-w-[120px] rounded-lg object-contain border border-border bg-background p-1"
          />
        ) : (
          <div className="h-12 w-24 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
            None
          </div>
        )}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>
    </Field>
  );
}

// ─── Site Settings tab ───────────────────────────────────────────────────────

function SiteTab() {
  const qc = useQueryClient();
  const { data: initial } = useQuery({
    queryKey: siteSettingsKeys.site,
    queryFn: () => siteSettingsService.getSiteSettings().then((r) => r.data),
  });

  const [form, setForm]   = useState<Partial<SiteSettings>>({});
  const [logo, setLogo]   = useState<File | null>(null);
  const [fav, setFav]     = useState<File | null>(null);
  const dirty = Object.keys(form).length > 0 || !!logo || !!fav;

  const set = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: siteSettingsKeys.site });
      setForm({});
      setLogo(null);
      setFav(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Company Name">
          <Input value={val("company_name")} onChange={set("company_name")} placeholder="BlackMarlinBD" />
        </Field>
        <Field label="Short Name">
          <Input value={val("company_short_name")} onChange={set("company_short_name")} placeholder="BMB" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField label="Logo" currentUrl={initial?.logo_url} onFile={setLogo} />
        <ImageUploadField label="Favicon" currentUrl={initial?.favicon_url} onFile={setFav} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Email">
          <Input type="email" value={val("email")} onChange={set("email")} placeholder="info@company.com" />
        </Field>
        <Field label="Phone">
          <Input value={val("phone")} onChange={set("phone")} placeholder="+880…" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="WhatsApp">
          <Input value={val("whatsapp")} onChange={set("whatsapp")} placeholder="+880…" />
        </Field>
      </div>

      <Field label="Address">
        <Textarea value={val("address")} onChange={set("address")} placeholder="123 Main St…" />
      </Field>

      <Field label="Google Maps Embed URL">
        <Input value={val("google_map_embed")} onChange={set("google_map_embed")} placeholder="https://maps.google.com/…" />
      </Field>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Social Links</p>
      <div className="grid grid-cols-2 gap-4">
        {(["facebook", "linkedin", "youtube", "twitter", "instagram"] as const).map((s) => (
          <Field key={s} label={s.charAt(0).toUpperCase() + s.slice(1)}>
            <Input value={val(s)} onChange={set(s)} placeholder={`https://${s}.com/…`} />
          </Field>
        ))}
      </div>

      <SaveBar dirty={dirty} saving={mut.isPending} onSave={() => mut.mutate()} />
    </div>
  );
}

// ─── Footer Settings tab ─────────────────────────────────────────────────────

function FooterTab() {
  const qc = useQueryClient();
  const { data: initial } = useQuery({
    queryKey: siteSettingsKeys.footer,
    queryFn: () => siteSettingsService.getFooterSettings().then((r) => r.data),
  });

  const [form, setForm] = useState<Partial<FooterSettings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const dirty = Object.keys(form).length > 0 || !!logoFile;

  const set = (k: keyof FooterSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: siteSettingsKeys.footer });
      setForm({});
      setLogoFile(null);
    },
  });

  return (
    <div className="space-y-6">
      <Field label="Copyright Text">
        <Input value={val("copyright_text")} onChange={set("copyright_text")} placeholder="© 2025 BlackMarlinBD" />
      </Field>

      <Field label="Footer About">
        <Textarea value={val("footer_about")} onChange={set("footer_about")} placeholder="Brief company description for the footer…" />
      </Field>

      <ImageUploadField label="Footer Logo" currentUrl={initial?.footer_logo_url} onFile={setLogoFile} />

      <Field label="Newsletter">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(form.newsletter_enabled ?? initial?.newsletter_enabled)}
            onChange={(e) => setForm((p) => ({ ...p, newsletter_enabled: e.target.checked }))}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm">Enable newsletter signup in footer</span>
        </label>
      </Field>

      <SaveBar dirty={dirty} saving={mut.isPending} onSave={() => mut.mutate()} />
    </div>
  );
}

// ─── Contact Settings tab ────────────────────────────────────────────────────

function ContactTab() {
  const qc = useQueryClient();
  const { data: initial } = useQuery({
    queryKey: siteSettingsKeys.contact,
    queryFn: () => siteSettingsService.getContactSettings().then((r) => r.data),
  });

  const [form, setForm] = useState<Partial<ContactSettings>>({});
  const dirty = Object.keys(form).length > 0;

  const set = (k: keyof ContactSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const val = (k: keyof ContactSettings) => (form[k] ?? initial?.[k] ?? "") as string;

  const mut = useMutation({
    mutationFn: () => siteSettingsService.updateContactSettings(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: siteSettingsKeys.contact });
      setForm({});
    },
  });

  return (
    <div className="space-y-6">
      <Field label="Office Hours">
        <Input value={val("office_hours")} onChange={set("office_hours")} placeholder="Mon–Fri, 9 AM – 6 PM" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Support Email">
          <Input type="email" value={val("support_email")} onChange={set("support_email")} placeholder="support@company.com" />
        </Field>
        <Field label="Sales Email">
          <Input type="email" value={val("sales_email")} onChange={set("sales_email")} placeholder="sales@company.com" />
        </Field>
      </div>

      <SaveBar dirty={dirty} saving={mut.isPending} onSave={() => mut.mutate()} />
    </div>
  );
}

// ─── Page shell ──────────────────────────────────────────────────────────────

type Tab = "site" | "footer" | "contact";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "site",    label: "Site",    icon: Globe   },
  { key: "footer",  label: "Footer",  icon: Layout  },
  { key: "contact", label: "Contact", icon: Phone   },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("site");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage site-wide configuration
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-accent rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        {tab === "site"    && <SiteTab />}
        {tab === "footer"  && <FooterTab />}
        {tab === "contact" && <ContactTab />}
      </motion.div>
    </div>
  );
}
