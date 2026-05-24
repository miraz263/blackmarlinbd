from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from .models import SiteSettings, FooterSettings, ContactSettings


class SingletonModelAdmin(admin.ModelAdmin):
    """
    Admin that prevents creating a second row and redirects the
    changelist straight to the single edit form.
    """

    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def get_urls(self):
        urls = super().get_urls()
        model_meta = self.model._meta
        custom = [
            path(
                "",
                self.admin_site.admin_view(self._redirect_to_singleton),
                name=f"{model_meta.app_label}_{model_meta.model_name}_changelist",
            ),
        ]
        # custom URLs go first so they override the default changelist URL
        return custom + urls

    def _redirect_to_singleton(self, request):
        obj = self.model.load()
        model_meta = self.model._meta
        change_url = reverse(
            f"admin:{model_meta.app_label}_{model_meta.model_name}_change",
            args=[obj.pk],
        )
        return HttpResponseRedirect(change_url)


@admin.register(SiteSettings)
class SiteSettingsAdmin(SingletonModelAdmin):
    fieldsets = (
        (
            "Company Identity",
            {
                "fields": (
                    "company_name",
                    "company_short_name",
                    "logo",
                    "favicon",
                )
            },
        ),
        (
            "Contact Details",
            {
                "fields": (
                    "email",
                    "phone",
                    "whatsapp",
                    "address",
                    "google_map_embed",
                )
            },
        ),
        (
            "Social Media",
            {
                "fields": (
                    "facebook",
                    "linkedin",
                    "twitter",
                    "instagram",
                    "youtube",
                )
            },
        ),
    )


@admin.register(FooterSettings)
class FooterSettingsAdmin(SingletonModelAdmin):
    fieldsets = (
        (
            "Footer Content",
            {
                "fields": (
                    "footer_logo",
                    "footer_about",
                    "copyright_text",
                    "newsletter_enabled",
                )
            },
        ),
    )


@admin.register(ContactSettings)
class ContactSettingsAdmin(SingletonModelAdmin):
    fieldsets = (
        (
            "Contact Page",
            {
                "fields": (
                    "office_hours",
                    "support_email",
                    "sales_email",
                )
            },
        ),
    )
