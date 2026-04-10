from django.contrib import admin
from .models import Category, Project, ProjectImage


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "color")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "is_featured", "views_count", "created_at")
    list_filter = ("status", "is_featured", "category")
    search_fields = ("title", "short_description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProjectImageInline]
    ordering = ["order", "-created_at"]
