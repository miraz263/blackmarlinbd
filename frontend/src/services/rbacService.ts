import { apiClient } from "./api/client";
import type { RBACRole, RBACPermission, UserAdmin, MyPermissions, PaginatedResponse } from "@/types";

export const rbacKeys = {
  all:         ["rbac"]                                  as const,
  me:          ["rbac", "me"]                            as const,
  roles:       ["rbac", "roles"]                         as const,
  role:        (slug: string) => ["rbac", "roles", slug] as const,
  users:       ["rbac", "users"]                         as const,
  user:        (id: number)   => ["rbac", "users", id]   as const,
  permissions: ["rbac", "permissions"]                   as const,
};

export const rbacService = {
  // ── My permissions ──────────────────────────────────────────────────────
  getMyPermissions: () =>
    apiClient.get<MyPermissions>("/admin/me/"),

  // ── Permissions catalogue ───────────────────────────────────────────────
  getPermissions: () =>
    apiClient.get<PaginatedResponse<RBACPermission>>("/admin/permissions/"),

  // ── Roles ────────────────────────────────────────────────────────────────
  getRoles: () =>
    apiClient.get<PaginatedResponse<RBACRole>>("/admin/roles/"),

  getRole: (slug: string) =>
    apiClient.get<RBACRole>(`/admin/roles/${slug}/`),

  createRole: (data: Partial<RBACRole> & { permission_ids?: number[] }) =>
    apiClient.post<RBACRole>("/admin/roles/", data),

  updateRole: (slug: string, data: Partial<RBACRole> & { permission_ids?: number[] }) =>
    apiClient.patch<RBACRole>(`/admin/roles/${slug}/`, data),

  deleteRole: (slug: string) =>
    apiClient.delete(`/admin/roles/${slug}/`),

  // ── Users ────────────────────────────────────────────────────────────────
  getUsers: () =>
    apiClient.get<PaginatedResponse<UserAdmin>>("/admin/users/"),

  getUser: (id: number) =>
    apiClient.get<UserAdmin>(`/admin/users/${id}/`),

  assignRole: (userId: number, roleId: number) =>
    apiClient.post<UserAdmin>(`/admin/users/${userId}/assign-role/`, { role_id: roleId }),

  removeRole: (userId: number) =>
    apiClient.delete(`/admin/users/${userId}/assign-role/`),
};
