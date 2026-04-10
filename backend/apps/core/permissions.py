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
