from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsEditorOrReadOnly(BasePermission):
    """Allow read to anyone; write only to editors and admins."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_editor


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


# Re-export RBAC utilities so existing `from apps.core.permissions import …` still works.
# Apps that want RBAC-aware checks import from here or from apps.rbac.permissions directly.
def _lazy_rbac():
    from apps.rbac.permissions import (  # noqa: F401
        IsSuperAdmin, rbac_permission, user_has_permission,
    )


try:
    from apps.rbac.permissions import IsSuperAdmin, rbac_permission, user_has_permission  # noqa: F401
except ImportError:
    pass  # rbac app not yet migrated / installed
