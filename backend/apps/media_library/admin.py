from django.contrib import admin
from django.utils.html import format_html
from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display  = ["title", "asset_type", "folder", "size_display", "preview", "uploaded_by", "created_at"]
    list_filter   = ["asset_type", "folder"]
    search_fields = ["title", "original_filename", "alt_text"]
    readonly_fields = ["asset_type", "mime_type", "size", "original_filename", "uploaded_by", "preview", "created_at"]
    ordering      = ["-created_at"]

    def size_display(self, obj):
        if obj.size < 1024:
            return f"{obj.size} B"
        if obj.size < 1024 ** 2:
            return f"{obj.size / 1024:.1f} KB"
        return f"{obj.size / 1024 ** 2:.1f} MB"
    size_display.short_description = "Size"

    def preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height:48px;border-radius:4px">', obj.thumbnail.url)
        if obj.asset_type == MediaAsset.AssetType.IMAGE and obj.file:
            return format_html('<img src="{}" style="height:48px;border-radius:4px">', obj.file.url)
        return obj.get_asset_type_display()
    preview.short_description = "Preview"
