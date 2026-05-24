from django.contrib import admin

from .models import ContentTranslation, Language, UITranslation


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display  = ["code", "name", "native_name", "direction", "is_active", "is_default", "order"]
    list_editable = ["is_active", "is_default", "order"]
    ordering      = ["order", "code"]


class UITranslationInline(admin.TabularInline):
    model  = UITranslation
    extra  = 0
    fields = ["key", "value"]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        lang = request.GET.get("lang")
        return qs.filter(language=lang) if lang else qs


@admin.register(UITranslation)
class UITranslationAdmin(admin.ModelAdmin):
    list_display  = ["language", "key", "value"]
    list_filter   = ["language"]
    search_fields = ["key", "value"]
    list_editable = ["value"]
    ordering      = ["language", "key"]


@admin.register(ContentTranslation)
class ContentTranslationAdmin(admin.ModelAdmin):
    list_display  = ["content_type", "object_id", "field", "language", "value", "updated_at"]
    list_filter   = ["language", "content_type", "field"]
    search_fields = ["value"]
    readonly_fields = ["content_type", "object_id", "field", "language", "created_at", "updated_at"]
