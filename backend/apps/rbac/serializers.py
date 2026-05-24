from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Permission, Role, UserRole

User = get_user_model()


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Permission
        fields = ["id", "module", "action", "codename", "name"]
        read_only_fields = fields


class RoleSerializer(serializers.ModelSerializer):
    permissions     = PermissionSerializer(many=True, read_only=True)
    permission_ids  = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True, write_only=True, source="permissions", required=False,
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model  = Role
        fields = [
            "id", "name", "slug", "description",
            "permissions", "permission_ids",
            "is_system", "user_count",
        ]
        read_only_fields = ["slug", "is_system"]

    def get_user_count(self, obj):
        return obj.user_roles.count()

    def create(self, validated_data):
        perms = validated_data.pop("permissions", [])
        role = super().create(validated_data)
        if perms:
            role.permissions.set(perms)
        return role

    def update(self, instance, validated_data):
        perms = validated_data.pop("permissions", None)
        instance = super().update(instance, validated_data)
        if perms is not None:
            instance.permissions.set(perms)
        return instance


class UserRoleSerializer(serializers.ModelSerializer):
    role_id   = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source="role", write_only=True,
    )
    role      = RoleSerializer(read_only=True)
    user_id   = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model  = UserRole
        fields = ["id", "user_id", "role", "role_id", "assigned_at"]
        read_only_fields = ["assigned_at"]


class UserAdminSerializer(serializers.ModelSerializer):
    """User list/detail for admin panel — includes RBAC role."""
    userrole = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "is_active", "date_joined", "last_login",
            "avatar_url", "userrole",
        ]
        read_only_fields = ["email", "username", "date_joined", "last_login"]

    def get_userrole(self, obj):
        try:
            ur = obj.userrole
            return {
                "role_id":   ur.role_id,
                "role_slug": ur.role.slug,
                "role_name": ur.role.name,
                "permissions": list(
                    ur.role.permissions.values_list("codename", flat=True)
                ),
            }
        except Exception:
            return None

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class AssignRoleSerializer(serializers.Serializer):
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())


class MyPermissionsSerializer(serializers.Serializer):
    """Returned by /admin/me/ — the calling user's effective permission set."""
    role_slug    = serializers.CharField()
    role_name    = serializers.CharField()
    permissions  = serializers.ListField(child=serializers.CharField())
    is_superadmin = serializers.BooleanField()
