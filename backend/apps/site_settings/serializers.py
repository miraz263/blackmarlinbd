from rest_framework import serializers
from .models import SiteSettings, FooterSettings, ContactSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "company_name",
            "company_short_name",
            "logo",
            "logo_url",
            "favicon",
            "favicon_url",
            "email",
            "phone",
            "whatsapp",
            "address",
            "google_map_embed",
            "facebook",
            "linkedin",
            "youtube",
            "twitter",
            "instagram",
        ]
        # logo / favicon accept uploads; *_url is read-only
        extra_kwargs = {
            "logo": {"write_only": True, "required": False},
            "favicon": {"write_only": True, "required": False},
        }

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url

    def get_favicon_url(self, obj):
        if not obj.favicon:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.favicon.url) if request else obj.favicon.url


class FooterSettingsSerializer(serializers.ModelSerializer):
    footer_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = FooterSettings
        fields = [
            "id",
            "copyright_text",
            "footer_about",
            "footer_logo",
            "footer_logo_url",
            "newsletter_enabled",
        ]
        extra_kwargs = {
            "footer_logo": {"write_only": True, "required": False},
        }

    def get_footer_logo_url(self, obj):
        if not obj.footer_logo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.footer_logo.url) if request else obj.footer_logo.url


class ContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSettings
        fields = [
            "id",
            "office_hours",
            "support_email",
            "sales_email",
        ]
