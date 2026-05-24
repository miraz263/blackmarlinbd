from rest_framework import serializers
from .models import SEOPage


class SEOPageSerializer(serializers.ModelSerializer):
    og_image_url        = serializers.SerializerMethodField()
    resolved_og_title   = serializers.ReadOnlyField()
    resolved_og_desc    = serializers.SerializerMethodField()

    class Meta:
        model  = SEOPage
        fields = [
            "id", "page_key",
            "meta_title", "meta_description", "keywords", "canonical_url",
            "og_title", "og_description", "og_image_url",
            "resolved_og_title", "resolved_og_desc",
            "og_type", "twitter_card",
            "schema_json", "no_index",
        ]

    def get_og_image_url(self, obj):
        if not obj.og_image:
            return None
        request = self.context.get("request")
        url = obj.og_image.url
        return request.build_absolute_uri(url) if request else url

    def get_resolved_og_desc(self, obj):
        return obj.resolved_og_description


class SEOPageWriteSerializer(SEOPageSerializer):
    og_image = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta(SEOPageSerializer.Meta):
        fields = SEOPageSerializer.Meta.fields + ["og_image"]
