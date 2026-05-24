from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path, reverse

from .models import (
    HeroSection,
    HeroButton,
    StatisticCard,
    PartnerLogo,
    TechItem,
    ServiceItem,
    HomepageSection,
)


class SingletonModelAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        meta = self.model._meta
        custom = [
            path(
                "",
                self.admin_site.admin_view(self._redirect_to_singleton),
                name=f"{meta.app_label}_{meta.model_name}_changelist",
            ),
        ]
        return custom + urls

    def _redirect_to_singleton(self, request):
        obj = self.model.load()
        meta = self.model._meta
        return HttpResponseRedirect(
            reverse(
                f"admin:{meta.app_label}_{meta.model_name}_change",
                args=[obj.pk],
            )
        )


class HeroButtonInline(admin.TabularInline):
    model = HeroButton
    extra = 1
    fields = ("label", "url", "variant", "order", "is_published")
    ordering = ("order",)


@admin.register(HeroSection)
class HeroSectionAdmin(SingletonModelAdmin):
    inlines = [HeroButtonInline]
    fieldsets = (
        (
            "Content",
            {
                "fields": (
                    "title",
                    "subtitle",
                    "description",
                    "badge_text",
                    "is_published",
                )
            },
        ),
        (
            "Media",
            {
                "fields": ("background_image", "video_url"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(StatisticCard)
class StatisticCardAdmin(admin.ModelAdmin):
    list_display = ("value", "label", "icon_name", "order", "is_published")
    list_editable = ("order", "is_published")
    list_filter = ("is_published",)
    ordering = ("order",)


@admin.register(PartnerLogo)
class PartnerLogoAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "order", "is_published")
    list_editable = ("order", "is_published")
    list_filter = ("is_published",)
    ordering = ("order",)


@admin.register(TechItem)
class TechItemAdmin(admin.ModelAdmin):
    list_display = ("name", "logo", "order", "is_published")
    list_editable = ("order", "is_published")
    list_filter = ("is_published",)
    ordering = ("order",)


@admin.register(ServiceItem)
class ServiceItemAdmin(admin.ModelAdmin):
    list_display = ("title", "icon_name", "gradient", "order", "is_published")
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "gradient")
    ordering = ("order",)
    fieldsets = (
        (
            "Content",
            {
                "fields": (
                    "title",
                    "description",
                    "icon_name",
                    "tags",
                    "href",
                    "is_published",
                )
            },
        ),
        (
            "Appearance",
            {"fields": ("gradient", "order")},
        ),
    )


@admin.register(HomepageSection)
class HomepageSectionAdmin(admin.ModelAdmin):
    list_display = ("get_section_key_display", "title", "badge_text", "is_visible", "order")
    list_editable = ("is_visible", "order")
    list_filter = ("is_visible",)
    ordering = ("order",)
    readonly_fields = ("section_key",)
    fieldsets = (
        (
            "Identity",
            {"fields": ("section_key", "is_visible", "order")},
        ),
        (
            "Copy",
            {
                "fields": (
                    "badge_text",
                    "title",
                    "subtitle",
                    "description",
                    "cta_text",
                    "cta_link",
                )
            },
        ),
    )
