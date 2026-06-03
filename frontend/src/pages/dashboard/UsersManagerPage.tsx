import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Trash2, Loader2, ChevronLeft, ChevronRight,
  Users, ShieldCheck, Pencil, UserCheck, UserX,
  Crown, Eye, AlertTriangle,
} from "lucide-react";
import { usersApi } from "@/services/api/users";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLES: { value: User["role"]; label: string; color: string; bg: string; icon: React.ElementType }[] = [
  { value: "admin",  label: "Admin",  color: "text-red-400",         bg: "bg-red-500/10 border-red-500/30",     icon: Crown  },
  { value: "editor", label: "Editor", color: "text-brand-400",       bg: "bg-brand-500/10 border-brand-500/30", icon: Pencil },
  { value: "viewer", label: "Viewer", color: "text-muted-foreground",bg: "bg-muted/40 border-border",           icon: Eye    },
];

function RoleBadge({ role }: { role: User["role"] }) {
  const cfg = ROLES.find((r) => r.value === role)!;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </span>
  );
}

function Avatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  const initials = user.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : user.email[0].toUpperCase();
  const sz = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }[size];
  return user.avatar ? (
    <img src={user.avatar} alt={user.username} className={`${sz} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${sz} rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function useDebounce<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

// ─── Edit role modal ──────────────────────────────────────────────────────────

function EditRoleModal({ user, currentUserId, onClose }: {
  user: User; currentUserId: number | undefined; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [role, setRole] = useState<User["role"]>(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  const [error, setError] = useState("");
  const isSelf = user.id === currentUserId;

  const mut = useMutation({
    mutationFn: () => usersApi.update(user.id, { role, is_active: isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-users"] }); onClose(); },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { detail?: string } } })?.response?.data;
      setError(data?.detail ?? "Failed to update user.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">

        <div className="flex items-start gap-4 mb-6">
          <Avatar user={user} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">
              {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSelf && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            You are editing your own account. Changes take effect on next login.
          </div>
        )}

        {/* Role selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Role</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ value, label, icon: Icon, color, bg }) => (
              <button key={value} onClick={() => setRole(value)}
                className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                  role === value ? `${bg} ${color}` : "border-border text-muted-foreground hover:border-brand-500/30 hover:bg-accent")}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {role === "admin"  && "Full access — can manage all content, users, and settings."}
            {role === "editor" && "Can create and edit content, cannot manage users or settings."}
            {role === "viewer" && "Read-only access to dashboard analytics and content."}
          </p>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background mb-5">
          <div>
            <p className="text-sm font-medium">Account Active</p>
            <p className="text-xs text-muted-foreground">Inactive users cannot log in</p>
          </div>
          <button onClick={() => !isSelf && setIsActive((v) => !v)}
            className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0",
              isActive ? "bg-green-500" : "bg-muted", isSelf && "opacity-40 cursor-not-allowed")}>
            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", isActive ? "left-5" : "left-0.5")} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-4">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
          <button onClick={() => mut.mutate()} disabled={mut.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors">
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mut.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: () => usersApi.delete(user.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-users"] }); onClose(); },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="text-lg font-bold mb-1">Delete User</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Permanently delete <span className="font-semibold text-foreground">{user.email}</span>?
          Their content will be disassociated. This cannot be undone.
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

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({ user, currentUserId, onEdit, onDelete }: {
  user: User; currentUserId: number | undefined; onEdit: () => void; onDelete: () => void;
}) {
  const isSelf = user.id === currentUserId;
  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="border-b border-border hover:bg-accent/30 transition-colors group">

      <td className="py-3 pl-4 pr-4 min-w-[220px]">
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate">
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
              </span>
              {isSelf && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-500/15 text-brand-400 shrink-0">YOU</span>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="py-3 pr-4 hidden md:table-cell">
        <span className="text-xs font-mono text-muted-foreground">@{user.username}</span>
      </td>

      <td className="py-3 pr-4"><RoleBadge role={user.role} /></td>

      <td className="py-3 pr-4">
        {user.is_active ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-green-500/10 text-green-500 border-green-500/20">
            <UserCheck className="h-2.5 w-2.5" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-muted/40 text-muted-foreground border-border">
            <UserX className="h-2.5 w-2.5" /> Inactive
          </span>
        )}
      </td>

      <td className="py-3 pr-4 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {new Date(user.date_joined).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </td>

      <td className="py-3 pr-4 hidden xl:table-cell">
        <span className="text-xs text-muted-foreground">{timeAgo(user.last_login)}</span>
      </td>

      <td className="py-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-500/10 text-muted-foreground hover:text-brand-400 transition-colors"
            title="Edit role & status">
            <ShieldCheck className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} disabled={isSelf}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={isSelf ? "Cannot delete yourself" : "Delete user"}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsersManagerPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<User["role"] | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const { user: currentUser } = useAuthStore();
  const debouncedSearch = useDebounce(search, 350);
  useEffect(() => setPage(1), [debouncedSearch, roleFilter, activeFilter]);

  const params: Record<string, string | number | boolean> = { page, page_size: 15 };
  if (debouncedSearch)     params.search = debouncedSearch;
  if (roleFilter)          params.role = roleFilter;
  if (activeFilter !== "") params.is_active = activeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-users", params],
    queryFn: () => usersApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: allData } = useQuery({
    queryKey: ["dashboard-users-stats"],
    queryFn: () => usersApi.list({ page_size: 1000 }).then((r) => r.data),
    staleTime: 60_000,
  });

  const users = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 15);
  const allUsers = allData?.results ?? [];

  const stats = {
    total:    allUsers.length,
    admins:   allUsers.filter((u) => u.role === "admin").length,
    editors:  allUsers.filter((u) => u.role === "editor").length,
    viewers:  allUsers.filter((u) => u.role === "viewer").length,
    inactive: allUsers.filter((u) => !u.is_active).length,
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-400" /> Users
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage accounts, roles, and access — admin only</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",    value: stats.total,    icon: Users,  color: "text-brand-400",        bg: "bg-brand-500/10" },
          { label: "Admins",   value: stats.admins,   icon: Crown,  color: "text-red-400",          bg: "bg-red-500/10"   },
          { label: "Editors",  value: stats.editors,  icon: Pencil, color: "text-brand-400",        bg: "bg-brand-500/10" },
          { label: "Viewers",  value: stats.viewers,  icon: Eye,    color: "text-muted-foreground", bg: "bg-muted/40"     },
          { label: "Inactive", value: stats.inactive, icon: UserX,  color: "text-amber-400",        bg: "bg-amber-500/10" },
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
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="flex-1 bg-transparent text-sm outline-none" />
          {search && <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
        </div>

        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
          {([["", "All"], ["admin", "Admin"], ["editor", "Editor"], ["viewer", "Viewer"]] as [User["role"] | "", string][]).map(([val, lbl]) => (
            <button key={String(val)} onClick={() => setRoleFilter(val)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                roleFilter === val ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {lbl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
          {([["", "All"], ["true", "Active"], ["false", "Inactive"]] as [string, string][]).map(([val, lbl]) => (
            <button key={val} onClick={() => setActiveFilter(val as "" | "true" | "false")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeFilter === val ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="pl-4 pr-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">User</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Username</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Role</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Joined</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden xl:table-cell">Last Login</th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 pl-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                        <div>
                          <div className="h-4 w-36 bg-muted animate-pulse rounded mb-1" />
                          <div className="h-3 w-44 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td colSpan={6} />
                  </tr>
                ))
                : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">No users found</p>
                        {(search || roleFilter || activeFilter) && (
                          <button onClick={() => { setSearch(""); setRoleFilter(""); setActiveFilter(""); }}
                            className="mt-3 text-xs text-brand-400 hover:text-brand-300">Clear filters</button>
                        )}
                      </td>
                    </tr>
                  )
                  : users.map((u) => (
                    <UserRow key={u.id} user={u} currentUserId={currentUser?.id}
                      onEdit={() => setEditUser(u)} onDelete={() => setDeleteUser(u)} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, totalCount)} of {totalCount} users
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

      <AnimatePresence>
        {editUser && <EditRoleModal user={editUser} currentUserId={currentUser?.id} onClose={() => setEditUser(null)} />}
        {deleteUser && <DeleteDialog user={deleteUser} onClose={() => setDeleteUser(null)} />}
      </AnimatePresence>
    </div>
  );
}
