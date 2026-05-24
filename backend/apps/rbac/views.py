from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Permission, Role, UserRole
from .permissions import IsSuperAdmin, user_is_superadmin
from .serializers import (
    PermissionSerializer,
    RoleSerializer,
    UserAdminSerializer,
    AssignRoleSerializer,
    MyPermissionsSerializer,
)

User = get_user_model()


# ─── Permissions catalogue ────────────────────────────────────────────────

class PermissionListView(generics.ListAPIView):
    queryset           = Permission.objects.all()
    serializer_class   = PermissionSerializer
    permission_classes = [IsSuperAdmin]


# ─── Roles ────────────────────────────────────────────────────────────────

class RoleListView(generics.ListCreateAPIView):
    serializer_class   = RoleSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        return Role.objects.prefetch_related("permissions").all()


class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = RoleSerializer
    permission_classes = [IsSuperAdmin]
    lookup_field       = "slug"

    def get_queryset(self):
        return Role.objects.prefetch_related("permissions").all()

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_system:
            return Response(
                {"detail": "System roles cannot be deleted."},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Users admin ──────────────────────────────────────────────────────────

class UserAdminListView(generics.ListAPIView):
    serializer_class   = UserAdminSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        return (
            User.objects
            .select_related("userrole__role")
            .prefetch_related("userrole__role__permissions")
            .order_by("-date_joined")
        )


class UserAdminDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserAdminSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        return User.objects.select_related("userrole__role").all()

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class AssignRoleView(APIView):
    """POST /admin/users/<pk>/assign-role/ — assign or change a user's RBAC role."""
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        ser = AssignRoleSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        role = ser.validated_data["role_id"]

        UserRole.objects.update_or_create(
            user=user,
            defaults={"role": role, "assigned_by": request.user},
        )

        out = UserAdminSerializer(user, context={"request": request})
        return Response(out.data)


class RemoveRoleView(APIView):
    """DELETE /admin/users/<pk>/assign-role/ — strip RBAC role from user."""
    permission_classes = [IsSuperAdmin]

    def delete(self, request, pk):
        UserRole.objects.filter(user_id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Current user's permissions ───────────────────────────────────────────

class MyPermissionsView(APIView):
    """GET /admin/me/ — calling user's effective RBAC permissions."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_sa = user_is_superadmin(user)

        try:
            ur = user.userrole
            perms = list(ur.role.permissions.values_list("codename", flat=True))
            data = {
                "role_slug":    ur.role.slug,
                "role_name":    ur.role.name,
                "permissions":  perms,
                "is_superadmin": is_sa,
            }
        except Exception:
            # User has no RBAC role yet
            from .models import MODULES, ACTIONS
            all_perms = [f"{m}.{a}" for m in MODULES for a in ACTIONS]
            data = {
                "role_slug":    "admin" if user.is_admin else "viewer",
                "role_name":    "Admin" if user.is_admin else "Viewer",
                "permissions":  all_perms if user.is_admin else [],
                "is_superadmin": user.is_superuser,
            }

        return Response(MyPermissionsSerializer(data).data)
