from django.contrib import admin
from .models import BlogCategory, BlogPost, Comment


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "status", "is_featured", "views_count", "published_at")
    list_filter = ("status", "is_featured", "category")
    search_fields = ("title", "excerpt")
    prepopulated_fields = {"slug": ("title",)}
    raw_id_fields = ("author",)
    date_hierarchy = "published_at"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("author", "post", "is_approved", "created_at")
    list_filter = ("is_approved",)
    actions = ["approve_comments"]

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)

    approve_comments.short_description = "Approve selected comments"
