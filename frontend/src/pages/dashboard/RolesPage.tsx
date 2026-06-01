import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Users, Pencil, Trash2, Plus, X, Check, ChevronDown, ChevronUp,
} from "lucide-react";
import { rbacService, rbacKeys } from "@/services/rbacService";
import { useRBAC } from "@/hooks/useRBAC";
import type { RBACRole, RBACPermission } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MODULES = [
  "users", "jobs", "blog", "projects", "services",
  "homepage", "about", "seo", "media", "contacts", "site_settings",
] as const;

const ACTIONS = ["view", "create", "edit", "delete", "publish"] as const;

function moduleLabel(m: string) {
  return m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Permission matrix cell ──────────────────────────────────────────────────

function MatrixCell({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        checked
          ? "bg-brand-500 text-white"
          : "bg-accent text-muted-foreground hover:bg-accent/70"
      } ${disabled ? "opacity-40 cursor-default" : "cursor-pointer"}`}
    >
      {checked && <Check className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─── Role editor modal ───────────────────────────────────────────────────────

function RoleEditor({
  role,
  allPermissions,
  onClose,
}: {
  role: RBACRole | null;
  allPermissions: RBACPermission[];
  onClose: () => void;
}) {
  const isNew = !role;
  const qc    = useQueryClient();

  const [name,        setName]        = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected,    setSelected]    = useState<Set<number>>(
    () => new Set(role?.permissions.map((p) => p.id) ?? []),
  );

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        description,
        permission_ids: Array.from(selected),
      };
      return isNew
        ? rbacService.createRole(payload)
        : rbacService.updateRole(role!.slug, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rbacKeys.roles });
      onClose();
    },
  });

  const togglePerm = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleModule = (module: string, action: string) => {
    const perm = allPermissions.find((p) => p.module === module && p.action === action);
    if (perm) togglePerm(perm.id);
  };

  const isChecked = (module: string, action: string) => {
    const perm = allPermissions.find((p) => p.module === module && p.action === action);
    return perm ? selected.has(perm.id) : false;
  };

  const toggleRow = (module: string) => {
    const rowPerms = allPermissions.filter((p) => p.module === module);
    const allOn = rowPerms.every((p) => selected.has(p.id));
    setSelected((prev) => {
      const next = new Set(prev);
      rowPerms.forEach((p) => (allOn ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const toggleCol = (action: string) => {
    const colPerms = allPermissions.filter((p) => p.action === action);
    const allOn = colPerms.every((p) => selected.has(p.id));
    setSelected((prev) => {
      const next = new Set(prev);
      colPerms.forEach((p) => (allOn ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-background/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-lg">{isNew ? "New Role" : `Edit — ${role!.name}`}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name + Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                Role Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={role?.is_system}
                placeholder="e.g. Content Editor"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Permission matrix */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Permission Matrix — click column header to toggle all
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium w-40">Module</th>
                    {ACTIONS.map((action) => (
                      <th key={action} className="text-center py-2 px-2">
                        <button
                          onClick={() => toggleCol(action)}
                          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                        >
                          {action}
                        </button>
                      </th>
                    ))}
                    <th className="text-center py-2 px-2">
                      <span className="text-xs text-muted-foreground">All</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((module, i) => (
                    <tr key={module} className={i % 2 === 0 ? "bg-accent/20" : ""}>
                      <td className="py-2 pr-4 font-medium text-foreground">
                        {moduleLabel(module)}
                      </td>
                      {ACTIONS.map((action) => (
                        <td key={action} className="text-center py-2 px-2">
                          <MatrixCell
                            checked={isChecked(module, action)}
                            onChange={() => toggleModule(module, action)}
                          />
                        </td>
                      ))}
                      <td className="text-center py-2 px-2">
                        <button
                          onClick={() => toggleRow(module)}
                          className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                        >
                          all
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selected.size} permission{selected.size !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !name.trim()}
            className="px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {mutation.isPending ? "Saving…" : "Save Role"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Role card ───────────────────────────────────────────────────────────────

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: RBACRole;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const byModule = MODULES.reduce<Record<string, string[]>>((acc, m) => {
    const perms = role.permissions.filter((p) => p.module === m).map((p) => p.action);
    if (perms.length) acc[m] = perms;
    return acc;
  }, {});

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="flex items-start justify-between p-5 gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-brand-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{role.name}</h3>
              {role.is_system && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-muted-foreground">
                  System
                </span>
              )}
            </div>
            {role.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {role.user_count} user{role.user_count !== 1 ? "s" : ""}
              </span>
              <span>{role.permissions.length} permissions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {!role.is_system && (
            <button
              onClick={onDelete}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(byModule).map(([module, actions]) => (
                <div key={module} className="p-3 rounded-xl bg-accent/50">
                  <p className="text-xs font-semibold text-foreground mb-2">{moduleLabel(module)}</p>
                  <div className="flex flex-wrap gap-1">
                    {actions.map((a) => (
                      <span
                        key={a}
                        className="px-1.5 py-0.5 rounded-md text-xs bg-brand-500/10 text-brand-400 font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(byModule).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">No permissions assigned.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { isSuperAdmin } = useRBAC();
  const qc = useQueryClient();
  const [editTarget,    setEditTarget]    = useState<RBACRole | null | "new">(null);
  const [deleteConfirm, setDeleteConfirm] = useState<RBACRole | null>(null);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: rbacKeys.roles,
    queryFn:  () => rbacService.getRoles().then((r) => r.data.results),
    staleTime: 2 * 60 * 1000,
  });

  const { data: allPermissions = [] } = useQuery({
    queryKey: rbacKeys.permissions,
    queryFn:  () => rbacService.getPermissions().then((r) => r.data.results),
    staleTime: 10 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => rbacService.deleteRole(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rbacKeys.roles });
      setDeleteConfirm(null);
    },
  });

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldCheck className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
        <p className="text-lg font-medium">SuperAdmin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Roles & Permissions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {roles.length} role{roles.length !== 1 ? "s" : ""} · {allPermissions.length} permissions in catalogue
          </p>
        </div>
        <button
          onClick={() => setEditTarget("new")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Role
        </button>
      </div>

      {/* Role list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence mode="popLayout">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => setEditTarget(role)}
                onDelete={() => setDeleteConfirm(role)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Editor modal */}
      <AnimatePresence>
        {editTarget !== null && (
          <RoleEditor
            role={editTarget === "new" ? null : editTarget}
            allPermissions={allPermissions}
            onClose={() => setEditTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="font-bold text-lg mb-2">Delete "{deleteConfirm.name}"?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This will unassign all users attached to this role. System roles cannot be deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm.slug)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
