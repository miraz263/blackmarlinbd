import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, FileText, Briefcase,
  Users, Settings, LogOut, ChevronRight, Bell
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Blog", href: "/dashboard/blog", icon: FileText },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.is_admin && !user.is_editor) return <Navigate to="/" replace />;

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
            const isActive = location.pathname === href;
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
            {navItems.find((n) => n.href === location.pathname)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
            </button>
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
