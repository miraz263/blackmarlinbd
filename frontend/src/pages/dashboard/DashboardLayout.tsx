import { useState } from "react";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, FileText, Briefcase,
  Users, Settings, LogOut, ChevronRight, Bell, Image,
  ShieldCheck, Layers, GitMerge, BarChart2, Languages, Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useRBAC } from "@/hooks/useRBAC";
import { workflowService, workflowKeys } from "@/services/workflowService";
import { cn } from "@/lib/utils";
import type { RBACModule, WorkflowNotification } from "@/types";

type NavItem = { label: string; href: string; icon: React.ElementType; module?: RBACModule };

const ALL_NAV: NavItem[] = [
  { label: "Overview",   href: "/dashboard",            icon: LayoutDashboard },
  { label: "Analytics",  href: "/dashboard/analytics",  icon: BarChart2,  module: "site_settings" },
  { label: "AI",         href: "/dashboard/ai",          icon: Sparkles,   module: "site_settings" },
  { label: "Projects",  href: "/dashboard/projects", icon: FolderKanban,  module: "projects"      },
  { label: "Blog",      href: "/dashboard/blog",     icon: FileText,       module: "blog"          },
  { label: "Jobs",      href: "/dashboard/jobs",     icon: Briefcase,      module: "jobs"          },
  { label: "Media",    href: "/dashboard/media",    icon: Image,     module: "media"         },
  { label: "Pages",    href: "/dashboard/pages",    icon: Layers,    module: "site_settings" },
  { label: "Workflow",     href: "/dashboard/workflow",     icon: GitMerge,   module: "site_settings" },
  { label: "Translations", href: "/dashboard/translations", icon: Languages,  module: "site_settings" },
  { label: "Users",        href: "/dashboard/users",        icon: Users,      module: "users"         },
  { label: "Settings", href: "/dashboard/settings", icon: Settings,  module: "site_settings" },
  { label: "Roles",    href: "/dashboard/roles",    icon: ShieldCheck },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: unread } = useQuery({
    queryKey: workflowKeys.unread,
    queryFn: () => workflowService.getUnreadCount().then((r) => r.data),
    refetchInterval: 30_000,
    enabled: isAuthenticated,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: workflowKeys.notifications,
    queryFn: () => workflowService.getNotifications().then((r) => r.data),
    enabled: open,
    staleTime: 15_000,
  });

  const markAll = useMutation({
    mutationFn: workflowService.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workflowKeys.unread });
      qc.invalidateQueries({ queryKey: workflowKeys.notifications });
    },
  });

  const count = unread?.count ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors relative"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm">Notifications</span>
                {count > 0 && (
                  <button
                    onClick={() => markAll.mutate()}
                    className="text-xs text-brand-500 hover:text-brand-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {(notifications as WorkflowNotification[]).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No notifications
                  </p>
                ) : (
                  (notifications as WorkflowNotification[]).map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 ${!n.is_read ? "bg-brand-500/5" : ""}`}
                    >
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const { canView, isSuperAdmin, isLoading: rbacLoading } = useRBAC();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && user.role === "viewer") return <Navigate to="/" replace />;

  const navItems = ALL_NAV.filter(({ module, label }) => {
    if (!module) return true;                  // Overview — always shown
    if (label === "Roles") return isSuperAdmin; // Roles — superadmin only
    return rbacLoading || canView(module);      // show while loading, hide if denied
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">BM</span>
            </div>
            <span className="font-bold text-sm">Dashboard</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? location.pathname === href
                : location.pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="font-semibold">
            {navItems.find((n) =>
              n.href === "/dashboard"
                ? location.pathname === n.href
                : location.pathname.startsWith(n.href)
            )?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Site →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
