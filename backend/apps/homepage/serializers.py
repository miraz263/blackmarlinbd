from rest_framework import serializers
from apps.translations.mixins import TranslatableSerializerMixin
from .models import (
    HeroSection,
    HeroButton,
    StatisticCard,
    PartnerLogo,
    TechItem,
    ServiceItem,
    HomepageSection,
)


class HeroButtonSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroButton
        fields = ["id", "label", "url", "variant", "order", "is_published"]


class HeroSectionSerializer(TranslatableSerializerMixin, serializers.ModelSerializer):
    translatable_fields = ["title", "subtitle", "description", "badge_text"]
    buttons = HeroButtonSerializer(many=True, read_only=True)
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = HeroSection
        fields = [
            "id",
            "title",
            "subtitle",
            "description",
            "badge_text",
            "background_image",
            "background_image_url",
            "video_url",
            "is_published",
            "buttons",
        ]
        extra_kwargs = {
            "background_image": {"write_only": True, "required": False},
        }

    def get_background_image_url(self, obj):
        if not obj.background_image:
            return None
        request = self.context.get("request")
        return (
            request.build_absolute_uri(obj.background_image.url)
            if request
            else obj.background_image.url
        )


class StatisticCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatisticCard
        fields = ["id", "label", "value", "icon_name", "order", "is_published"]


class PartnerLogoSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = PartnerLogo
        fields = ["id", "name", "logo", "logo_url", "url", "order", "is_published"]
        extra_kwargs = {
            "logo": {"write_only": True, "required": False},
        }

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        return (
            request.build_absolute_uri(obj.logo.url) if request else obj.logo.url
        )


class TechItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechItem
        fields = ["id", "name", "logo", "order", "is_published"]


class ServiceItemSerializer(TranslatableSerializerMixin, serializers.ModelSerializer):
    translatable_fields = ["title", "description"]

    class Meta:
        model = ServiceItem
        fields = [
            "id",
            "title",
            "description",
            "icon_name",
            "gradient",
            "href",
            "tags",
            "order",
            "is_published",
        ]


class HomepageSectionSerializer(TranslatableSerializerMixin, serializers.ModelSerializer):
    translatable_fields = ["title", "subtitle", "description", "badge_text", "cta_text"]

    class Meta:
        model = HomepageSection
        fields = [
            "id",
            "section_key",
            "title",
            "subtitle",
            "description",
            "badge_text",
            "cta_text",
            "cta_link",
            "is_visible",
            "order",
        ]
