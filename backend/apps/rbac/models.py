from django.conf import settings
from django.db import models
from django.utils.text import slugify
from apps.core.models import TimeStampedModel

MODULES = [
    "users", "jobs", "blog", "projects", "services",
    "homepage", "about", "seo", "media", "contacts", "site_settings",
]

ACTIONS = ["view", "create", "edit", "delete", "publish"]


class Permission(models.Model):
    module   = models.CharField(max_length=50)
    action   = models.CharField(max_length=20)
    codename = models.CharField(max_length=100, unique=True, db_index=True)
    name     = models.CharField(max_length=200)

    class Meta:
        db_table       = "rbac_permissions"
        ordering       = ["module", "action"]
        unique_together = [["module", "action"]]
        verbose_name   = "Permission"
        verbose_name_plural = "Permissions"

    def __str__(self):
        return self.codename

    def save(self, *args, **kwargs):
        if not self.codename:
            self.codename = f"{self.module}.{self.action}"
        if not self.name:
            self.name = f"{self.module.replace('_', ' ').title()}: {self.action.title()}"
        super().save(*args, **kwargs)


class Role(TimeStampedModel):
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name="roles")
    is_system   = models.BooleanField(
        default=False,
        help_text="System roles cannot be deleted via the API",
    )

    class Meta:
        db_table = "rbac_roles"
        ordering = ["name"]
        verbose_name = "Role"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class UserRole(TimeStampedModel):
    user        = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="userrole",
    )
    role        = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="user_roles",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_roles",
    )

    class Meta:
        db_table = "rbac_user_roles"
        verbose_name = "User Role Assignment"
        verbose_name_plural = "User Role Assignments"

    def __str__(self):
        return f"{self.user} → {self.role}"
