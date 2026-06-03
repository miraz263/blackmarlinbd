from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path, reverse

from .models import AboutPage, Mission, Vision, CoreValue, TeamMember, AboutStatistic


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


@admin.register(AboutPage)
class AboutPageAdmin(SingletonModelAdmin):
    fieldsets = (
        (
            "Hero Block",
            {
                "fields": (
                    "badge_text",
                    "hero_title",
                    "hero_subtitle",
                    "hero_description",
                )
            },
        ),
        (
            "Company Details",
            {"fields": ("founded_year", "tagline"), "classes": ("collapse",)},
        ),
    )


@admin.register(Mission)
class MissionAdmin(SingletonModelAdmin):
    fields = ("title", "description")


@admin.register(Vision)
class VisionAdmin(SingletonModelAdmin):
    fields = ("title", "description")


@admin.register(CoreValue)
class CoreValueAdmin(admin.ModelAdmin):
    list_display = ("title", "icon_name", "order", "is_published")
    list_editable = ("order", "is_published")
    list_filter = ("is_published",)
    ordering = ("order",)
    fieldsets = (
        (None, {"fields": ("title", "description", "icon_name", "order", "is_published")}),
    )


@admin.register(AboutStatistic)
class AboutStatisticAdmin(admin.ModelAdmin):
    list_display = ("value", "label", "icon_name", "order", "is_published")
    list_editable = ("order", "is_published")
    ordering = ("order",)


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "designation", "display_order", "is_published")
    list_editable = ("display_order", "is_published")
    list_filter = ("is_published",)
    ordering = ("display_order", "name")
    search_fields = ("name", "designation", "email")
    fieldsets = (
        (
            "Identity",
            {"fields": ("name", "designation", "photo", "display_order", "is_published")},
        ),
        (
            "Bio",
            {"fields": ("bio",)},
        ),
        (
            "Contact & Social",
            {
                "fields": ("email", "linkedin", "github"),
                "classes": ("collapse",),
            },
        ),
    )
