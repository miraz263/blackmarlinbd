import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LogOut, Home, FileText, FolderKanban, Briefcase,
  Mail, Sun, Moon, Save, Loader2, User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { apiClient } from "@/services/api/client";
import { cn } from "@/lib/utils";

// ─── Quick links shown to the viewer ─────────────────────────────────────────

const QUICK_LINKS = [
  { icon: Home,         label: "Homepage",    href: "/"         },
  { icon: FileText,     label: "Blog",        href: "/blog"     },
  { icon: FolderKanban, label: "Our Work",    href: "/projects" },
  { icon: Briefcase,    label: "Careers",     href: "/careers"  },
  { icon: Mail,         label: "Contact Us",  href: "/contact"  },
];

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewerDashboardPage() {
  const { user, logout, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName,  setLastName]  = useState(user?.last_name  ?? "");
  const [bio,       setBio]       = useState(user?.bio        ?? "");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const saveProfile = useMutation({
    mutationFn: () => apiClient.patch(`/auth/profile/`, { first_name: firstName, last_name: lastName, bio }),
    onSuccess: (res) => {
      updateUser(res.data as object);
      showToast("Profile updated!");
    },
  });

  const initials = (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase() +
    (user?.last_name?.[0] ?? "").toUpperCase();

  const dirty = firstName !== (user?.first_name ?? "") || lastName !== (user?.last_name ?? "") || bio !== (user?.bio ?? "");

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-10">
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

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back{user?.first_name ? `, ${user.first_name}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
              <Link key={href} to={href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                  <Icon className="h-5 w-5 text-brand-400" />
                </div>
                <span className="text-xs font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Profile editor */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-brand-400" /> My Profile
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Bio</label>
            <textarea rows={3} className={cn(inputCls, "resize-none")} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio about yourself…" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Email</label>
            <input className={cn(inputCls, "opacity-50 cursor-not-allowed")} value={user?.email ?? ""} disabled />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Role: <span className="capitalize font-medium text-foreground">{user?.role}</span></p>
            <button onClick={() => saveProfile.mutate()} disabled={!dirty || saveProfile.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors">
              {saveProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </motion.div>

      </main>

      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium shadow-lg">
          {toast}
        </motion.div>
      )}
    </div>
  );
}
