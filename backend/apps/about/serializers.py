from rest_framework import serializers
from .models import AboutPage, Mission, Vision, CoreValue, TeamMember


class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = [
            "id",
            "badge_text",
            "hero_title",
            "hero_subtitle",
            "hero_description",
            "founded_year",
            "tagline",
        ]


class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = ["id", "title", "description"]


class VisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vision
        fields = ["id", "title", "description"]


class CoreValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreValue
        fields = ["id", "title", "description", "icon_name", "order", "is_published"]


class TeamMemberSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "name",
            "designation",
            "photo",
            "photo_url",
            "bio",
            "linkedin",
            "github",
            "email",
            "display_order",
            "is_published",
        ]
        extra_kwargs = {
            "photo": {"write_only": True, "required": False},
        }

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get("request")
        return (
            request.build_absolute_uri(obj.photo.url) if request else obj.photo.url
        )


class ReorderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order = serializers.IntegerField(min_value=0)
