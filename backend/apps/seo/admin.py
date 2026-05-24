from django.contrib import admin
from django.utils.html import format_html
from .models import SEOPage


@admin.register(SEOPage)
class SEOPageAdmin(admin.ModelAdmin):
    list_display  = ["page_key", "meta_title", "og_type", "twitter_card", "no_index", "og_preview"]
    list_filter   = ["og_type", "twitter_card", "no_index"]
    search_fields = ["page_key", "meta_title", "meta_description", "keywords"]
    readonly_fields = ["og_preview", "created_at", "updated_at"]
    fieldsets = (
        ("Page", {
            "fields": ("page_key", "no_index"),
        }),
        ("Meta", {
            "fields": ("meta_title", "meta_description", "keywords", "canonical_url"),
        }),
        ("Open Graph", {
            "fields": ("og_title", "og_description", "og_image", "og_preview", "og_type"),
            "description": "og_title and og_description fall back to the Meta fields when left blank.",
        }),
        ("Twitter", {
            "fields": ("twitter_card",),
        }),
        ("Structured Data (JSON-LD)", {
            "fields": ("schema_json",),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def og_preview(self, obj):
        if obj.og_image:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:6px;object-fit:cover">',
                obj.og_image.url,
            )
        return "—"
    og_preview.short_description = "OG Image"
