from django.contrib import admin
from django.utils.html import format_html
from .models import Permission, Role, UserRole


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display  = ["codename", "module", "action", "name"]
    list_filter   = ["module", "action"]
    search_fields = ["codename", "name"]
    ordering      = ["module", "action"]
    readonly_fields = ["codename"]


class PermissionInline(admin.TabularInline):
    model   = Role.permissions.through
    verbose_name = "Permission"
    verbose_name_plural = "Permissions"
    extra   = 0
    autocomplete_fields = ["permission"]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display  = ["name", "slug", "is_system", "user_count", "permission_count"]
    list_filter   = ["is_system"]
    search_fields = ["name", "slug"]
    readonly_fields = ["slug", "created_at", "updated_at"]
    filter_horizontal = ["permissions"]
    fieldsets = (
        (None, {
            "fields": ("name", "slug", "description", "is_system"),
        }),
        ("Permissions", {
            "fields": ("permissions",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def user_count(self, obj):
        return obj.user_roles.count()
    user_count.short_description = "Users"

    def permission_count(self, obj):
        return obj.permissions.count()
    permission_count.short_description = "Permissions"


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display  = ["user", "role", "assigned_by", "created_at"]
    list_filter   = ["role"]
    search_fields = ["user__email", "user__username", "role__name"]
    raw_id_fields = ["user", "assigned_by"]
    readonly_fields = ["created_at", "updated_at"]
