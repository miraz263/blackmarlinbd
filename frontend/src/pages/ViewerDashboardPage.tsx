import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LogOut, Home, FileText, FolderKanban, Briefcase,
  Mail, Sun, Moon, Save, Loader2, User, Camera, Lock,
  Calendar, Clock, Bell, BellOff, ShieldCheck, ChevronRight,
  Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { apiClient } from "@/services/api/client";
import { workflowService } from "@/services/workflowService";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import type { WorkflowStatus } from "@/types";

// ─── Quick links shown to the viewer ─────────────────────────────────────────

const QUICK_LINKS = [
  { icon: Home,         label: "Homepage",    href: "/",         color: "from-brand-500 to-cyan-500"   },
  { icon: FileText,     label: "Blog",        href: "/blog",     color: "from-purple-500 to-brand-500"  },
  { icon: FolderKanban, label: "Our Work",    href: "/projects", color: "from-cyan-500 to-blue-500"     },
  { icon: Briefcase,    label: "Careers",     href: "/careers",  color: "from-green-500 to-emerald-500" },
  { icon: Mail,         label: "Contact Us",  href: "/contact",  color: "from-orange-500 to-red-500"    },
];

const ROLE_STYLES: Record<string, string> = {
  admin:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  editor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  viewer: "bg-brand-500/10 text-brand-400 border-brand-500/20",
};

const REVIEW_STATUS_STYLES: Record<WorkflowStatus, { bg: string; text: string; label: string }> = {
  draft:     { bg: "bg-gray-500/10",   text: "text-gray-400",   label: "Draft"     },
  review:    { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "In Review" },
  approved:  { bg: "bg-blue-500/10",   text: "text-blue-500",   label: "Approved"  },
  published: { bg: "bg-green-500/10",  text: "text-green-500",  label: "Published" },
  archived:  { bg: "bg-red-500/10",    text: "text-red-400",    label: "Archived"  },
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all";
const cardCls = "bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300";
const sectionTitleCls = "font-semibold flex items-center gap-2.5 mb-5";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4, ease: "easeOut" as const },
  };
}

function iconBadge(gradient: string) {
  return cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", gradient);
}

// ─── Small reusable toggle switch ────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-40",
        checked ? "bg-gradient-to-r from-brand-500 to-cyan-500" : "bg-border"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewerDashboardPage() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: submissions } = useQuery({
    queryKey: ["my-blog-submissions"],
    queryFn: () => workflowService.getSubmissions().then((r) => r.data.results),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  const blogSubmissions = (submissions ?? []).filter((s) => s.content_type_label === "blog.blogpost");

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName,  setLastName]  = useState(user?.last_name  ?? "");
  const [bio,       setBio]       = useState(user?.bio        ?? "");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [oldPassword,  setOldPassword]  = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [pwError, setPwError] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  };

  const saveProfile = useMutation({
    mutationFn: () => apiClient.patch(`/auth/me/`, { first_name: firstName, last_name: lastName, bio }),
    onSuccess: (res) => {
      updateUser(res.data as object);
      showToast("success", "Profile updated successfully.");
    },
    onError: () => showToast("error", "Couldn't save your profile. Try again."),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      return apiClient.patch(`/auth/me/`, form, { headers: { "Content-Type": undefined } });
    },
    onSuccess: (res) => {
      updateUser(res.data as object);
      showToast("success", "Profile photo updated.");
    },
    onError: () => showToast("error", "Couldn't upload photo. Try a smaller image."),
  });

  const toggleNewsletter = useMutation({
    mutationFn: (value: boolean) => apiClient.patch(`/auth/me/`, { is_newsletter_subscribed: value }),
    onSuccess: (res) => updateUser(res.data as object),
  });

  const changePassword = useMutation({
    mutationFn: () =>
      apiClient.post(`/auth/change-password/`, {
        old_password: oldPassword, new_password: newPassword, new_password2: newPassword2,
      }),
    onSuccess: () => {
      setOldPassword(""); setNewPassword(""); setNewPassword2("");
      setPwError("");
      showToast("success", "Password changed successfully.");
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: Record<string, string | string[]> } })?.response?.data;
      const msg = detail ? Object.values(detail).flat().join(" ") : "Couldn't change password.";
      setPwError(msg);
    },
  });

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
    e.target.value = "";
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (newPassword !== newPassword2) {
      setPwError("New passwords do not match.");
      return;
    }
    changePassword.mutate();
  };

  const initials = (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase() +
    (user?.last_name?.[0] ?? "").toUpperCase();

  const dirty = firstName !== (user?.first_name ?? "") || lastName !== (user?.last_name ?? "") || bio !== (user?.bio ?? "");
  const roleStyle = ROLE_STYLES[user?.role ?? "viewer"] ?? ROLE_STYLES.viewer;

  const completionChecks = [!!user?.avatar, !!user?.bio, !!user?.first_name, !!user?.last_name];
  const completion = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  const stats = [
    { icon: ShieldCheck, label: "Account Role", value: user?.role ?? "—", color: "from-amber-500 to-orange-500", capitalize: true },
    { icon: Calendar,    label: "Member Since", value: user?.date_joined ? formatDate(user.date_joined) : "—", color: "from-brand-500 to-cyan-500" },
    { icon: Clock,       label: "Last Active",  value: user?.last_login ? formatRelativeDate(user.last_login) : "First login", color: "from-purple-500 to-brand-500" },
    {
      icon: user?.is_newsletter_subscribed ? Bell : BellOff,
      label: "Newsletter",
      value: user?.is_newsletter_subscribed ? "Subscribed" : "Not subscribed",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">BM</span>
          </div>
          <span className="font-bold text-sm">BlackMarlinBD</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6 relative">

        {/* Profile hero */}
        <motion.div {...fadeUp()} className="rounded-2xl border border-border overflow-hidden bg-card shadow-lg shadow-black/5">
          <div className="relative h-28 bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 overflow-hidden">
            <motion.div
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-brand-600 via-cyan-400 to-brand-500 bg-[length:200%_100%] opacity-80"
            />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }} />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl ring-4 ring-card bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-xl">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.email} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarMutation.isPending}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 text-white flex items-center justify-center border-2 border-card hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 shadow-lg"
                  title="Change photo"
                >
                  {avatarMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
              </div>

              <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold gradient-text">
                    {user?.first_name || user?.last_name ? `${user?.first_name} ${user?.last_name}`.trim() : user?.username}
                  </h1>
                  <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize", roleStyle)}>
                    <ShieldCheck className="h-3 w-3" /> {user?.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              </div>

              {completion < 100 && (
                <div className="sm:text-right shrink-0 sm:w-44">
                  <div className="flex items-center gap-1.5 sm:justify-end text-xs font-medium text-muted-foreground mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                    Profile {completion}% complete
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ icon: Icon, label, value, color, capitalize }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className={cn(cardCls, "p-4 flex items-center gap-3 hover:-translate-y-0.5")}
            >
              <div className={iconBadge(color)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className={cn("text-sm font-semibold truncate", capitalize && "capitalize")}>{value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Write a blog post CTA */}
        <motion.div {...fadeUp(0.08)}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 p-6 shadow-lg">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                <PenLine className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Have something to share?</h3>
                <p className="text-sm text-white/80 mt-0.5">
                  Write a blog post — an admin will review and publish it once approved.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" className="shrink-0 bg-white text-brand-600 hover:bg-white/90">
              <Link to="/blog/write">
                <PenLine className="h-4 w-4 mr-2" /> Write a Post
              </Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile editor */}
            <motion.div {...fadeUp(0.1)} className={cardCls}>
              <h2 className={sectionTitleCls}>
                <div className={iconBadge("from-brand-500 to-cyan-500")}>
                  <User className="h-4 w-4 text-white" />
                </div>
                Profile Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">First Name</label>
                  <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Last Name</label>
                  <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Bio</label>
                <textarea rows={3} className={cn(inputCls, "resize-none")} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio about yourself…" />
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Email</label>
                <input className={cn(inputCls, "opacity-50 cursor-not-allowed")} value={user?.email ?? ""} disabled />
              </div>

              <div className="flex items-center justify-end pt-5 mt-5 border-t border-border">
                <Button variant="gradient" onClick={() => saveProfile.mutate()} disabled={!dirty} loading={saveProfile.isPending}>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div {...fadeUp(0.15)} className={cardCls}>
              <h2 className={sectionTitleCls}>
                <div className={iconBadge("from-purple-500 to-brand-500")}>
                  <Lock className="h-4 w-4 text-white" />
                </div>
                Password &amp; Security
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {(["old", "new", "confirm"] as const).map((field) => {
                  const map = {
                    old:     { label: "Current Password", value: oldPassword,  set: setOldPassword },
                    new:     { label: "New Password",      value: newPassword,  set: setNewPassword },
                    confirm: { label: "Confirm New Password", value: newPassword2, set: setNewPassword2 },
                  } as const;
                  const { label, value, set } = map[field];
                  return (
                    <div key={field} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">{label}</label>
                      <div className="relative">
                        <input
                          type={showPw[field] ? "text" : "password"}
                          className={cn(inputCls, "pr-10")}
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => ({ ...s, [field]: !s[field] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPw[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pwError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{pwError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end pt-1">
                  <Button
                    type="submit"
                    variant="default"
                    disabled={!oldPassword || !newPassword || !newPassword2}
                    loading={changePassword.isPending}
                  >
                    <Lock className="h-4 w-4 mr-2" /> Update Password
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick links */}
            <motion.div {...fadeUp(0.1)} className={cardCls}>
              <h2 className={sectionTitleCls}>
                <Sparkles className="h-4 w-4 text-brand-400" /> Quick Links
              </h2>
              <nav className="space-y-1.5">
                {QUICK_LINKS.map(({ icon: Icon, label, href, color }) => (
                  <Link key={href} to={href}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all group">
                    <div className={cn(iconBadge(color), "w-8 h-8 group-hover:scale-110 transition-transform")}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </nav>
            </motion.div>

            {/* My blog submissions */}
            <motion.div {...fadeUp(0.12)} className={cardCls}>
              <h2 className={sectionTitleCls}>
                <div className={iconBadge("from-purple-500 to-brand-500")}>
                  <PenLine className="h-4 w-4 text-white" />
                </div>
                My Blog Posts
              </h2>
              {blogSubmissions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">You haven't submitted any posts yet.</p>
                  <Link to="/blog/write" className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 font-medium mt-2">
                    <PenLine className="h-3.5 w-3.5" /> Write your first post
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {blogSubmissions.slice(0, 6).map((s) => {
                    const style = REVIEW_STATUS_STYLES[s.status];
                    return (
                      <div key={s.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.content_title}</p>
                          {s.current_step_name && s.status === "review" && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{s.current_step_name}</p>
                          )}
                        </div>
                        <span className={cn("shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full", style.bg, style.text)}>
                          {style.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Preferences */}
            <motion.div {...fadeUp(0.15)} className={cardCls}>
              <h2 className={sectionTitleCls}>
                <div className={iconBadge("from-green-500 to-emerald-500")}>
                  <Bell className="h-4 w-4 text-white" />
                </div>
                Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground shrink-0" /> : <Sun className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className="text-sm font-medium">Dark Mode</span>
                  </div>
                  <Toggle checked={theme === "dark"} onChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
                </div>
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">Newsletter</span>
                  </div>
                  <Toggle
                    checked={!!user?.is_newsletter_subscribed}
                    disabled={toggleNewsletter.isPending}
                    onChange={() => toggleNewsletter.mutate(!user?.is_newsletter_subscribed)}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg",
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          )}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}
    </div>
  );
}
