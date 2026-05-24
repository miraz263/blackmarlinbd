"""
RBAC permission utilities and DRF permission classes.

Hierarchy (first match wins):
  1. Django is_superuser          → always allowed
  2. RBAC UserRole with superadmin slug → always allowed
  3. RBAC UserRole with matching codename → allowed / denied
  4. No UserRole → fall back to user.is_admin (backward compat)
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


# ─── Core check ────────────────────────────────────────────────────────────

def user_has_permission(user, module: str, action: str) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    try:
        userrole = user.userrole
        if userrole.role.slug == "superadmin":
            return True
        codename = f"{module}.{action}"
        return userrole.role.permissions.filter(codename=codename).exists()
    except Exception:
        return user.is_admin  # backward compat — no RBAC entry yet


def user_is_superadmin(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    try:
        return user.userrole.role.slug == "superadmin"
    except Exception:
        return user.is_admin


# ─── Reusable DRF classes ──────────────────────────────────────────────────

class IsSuperAdmin(BasePermission):
    message = "SuperAdmin role required."

    def has_permission(self, request, view):
        return user_is_superadmin(request.user)


class IsEditorOrReadOnly(BasePermission):
    """Backward-compat: kept identical to apps.core.permissions.IsEditorOrReadOnly."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_editor


# ─── Factory ───────────────────────────────────────────────────────────────

def rbac_permission(module: str, action: str = "view", allow_safe_without_auth: bool = False):
    """
    Return a DRF BasePermission class that checks `module.action`.

    Usage in a view:
        permission_classes = [rbac_permission("blog", "create")]
    """
    class _Permission(BasePermission):
        _module = module
        _action = action
        message = f"Permission '{module}.{action}' required."

        def has_permission(self, request, view):
            if allow_safe_without_auth and request.method in SAFE_METHODS:
                return True
            return user_has_permission(request.user, self._module, self._action)

    _Permission.__name__ = f"RBAC_{module}_{action}"
    return _Permission
