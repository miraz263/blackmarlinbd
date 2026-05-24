import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { rbacService, rbacKeys } from "@/services/rbacService";
import type { RBACModule, RBACAction } from "@/types";

/**
 * Returns helpers to check the current user's RBAC permissions.
 *
 * - `canDo(module, action)` — returns true if the user has `module.action`
 * - `canView(module)`       — shorthand for canDo(module, "view")
 * - `isRole(slug)`          — true if user's RBAC role slug matches
 * - `isSuperAdmin`          — true for superadmin role or Django superuser
 * - `isLoading`             — true while permissions are being fetched
 */
export function useRBAC() {
  const { isAuthenticated } = useAuthStore();

  const { data: myPerms, isLoading } = useQuery({
    queryKey: rbacKeys.me,
    queryFn:  () => rbacService.getMyPermissions().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
    retry: false,
  });

  const permSet = new Set(myPerms?.permissions ?? []);

  const canDo = (module: RBACModule, action: RBACAction): boolean => {
    if (!isAuthenticated) return false;
    if (myPerms?.is_superadmin) return true;
    return permSet.has(`${module}.${action}`);
  };

  const canView  = (module: RBACModule) => canDo(module, "view");
  const isRole   = (slug: string) => myPerms?.role_slug === slug;
  const isSuperAdmin = myPerms?.is_superadmin ?? false;

  return { canDo, canView, isRole, isSuperAdmin, isLoading, myPerms };
}
