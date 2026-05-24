from django.contrib import admin
from .models import ServiceCategory, Technology, Service, CaseStudy


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display  = ("name", "slug", "icon_name", "order", "is_published")
    list_editable = ("order", "is_published")
    list_filter   = ("is_published",)
    ordering      = ("order", "name")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display  = ("name", "logo", "order")
    list_editable = ("order",)
    ordering      = ("order", "name")
    search_fields = ("name",)


class CaseStudyInline(admin.StackedInline):
    model  = CaseStudy
    extra  = 0
    fields = ("title", "client_name", "challenge", "solution", "results", "cover_image", "order", "is_published")
    ordering = ("order",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display  = ("title", "slug", "category", "gradient", "featured", "order", "status", "views_count")
    list_editable = ("featured", "order", "status")
    list_filter   = ("status", "featured", "category", "gradient")
    search_fields = ("title", "tagline", "short_description")
    ordering      = ("order", "-created_at")
    filter_horizontal = ("technologies",)
    prepopulated_fields = {"slug": ("title",)}
    inlines       = [CaseStudyInline]
    readonly_fields = ("views_count", "created_at", "updated_at")
    fieldsets = (
        (
            "Identity",
            {
                "fields": (
                    "title", "slug", "tagline", "short_description",
                    "icon_name", "gradient", "cover_image",
                    "category", "featured", "order", "status",
                )
            },
        ),
        (
            "Content",
            {"fields": ("description", "capabilities", "body")},
        ),
        (
            "Technologies",
            {"fields": ("technologies",)},
        ),
        (
            "Meta",
            {
                "fields": ("views_count", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display  = ("title", "service", "client_name", "order", "is_published")
    list_editable = ("order", "is_published")
    list_filter   = ("is_published", "service")
    ordering      = ("service", "order")
    search_fields = ("title", "client_name")
