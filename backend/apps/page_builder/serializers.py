from rest_framework import serializers
from .models import Page, Section, Block


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Block
        fields = ["id", "block_type", "order", "content_json", "style_json", "is_published"]


class SectionSerializer(serializers.ModelSerializer):
    blocks = serializers.SerializerMethodField()

    class Meta:
        model  = Section
        fields = ["id", "label", "order", "style_json", "is_published", "blocks"]

    def _is_editor(self):
        request = self.context.get("request")
        return request and request.user.is_authenticated and request.user.is_editor

    def get_blocks(self, obj):
        qs = obj.blocks.all().order_by("order")
        if not self._is_editor():
            qs = qs.filter(is_published=True)
        return BlockSerializer(qs, many=True, context=self.context).data


class PageListSerializer(serializers.ModelSerializer):
    section_count = serializers.SerializerMethodField()

    class Meta:
        model  = Page
        fields = ["id", "title", "slug", "description", "is_published", "section_count", "created_at", "updated_at"]
        read_only_fields = ["section_count", "created_at", "updated_at"]

    def get_section_count(self, obj):
        return obj.sections.count()


class PageDetailSerializer(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()

    class Meta:
        model  = Page
        fields = ["id", "title", "slug", "description", "is_published", "meta", "sections", "created_at", "updated_at"]
        read_only_fields = ["slug", "created_at", "updated_at"]

    def _is_editor(self):
        request = self.context.get("request")
        return request and request.user.is_authenticated and request.user.is_editor

    def get_sections(self, obj):
        qs = obj.sections.prefetch_related("blocks").order_by("order")
        if not self._is_editor():
            qs = qs.filter(is_published=True)
        return SectionSerializer(qs, many=True, context=self.context).data


class ReorderItemSerializer(serializers.Serializer):
    id    = serializers.IntegerField()
    order = serializers.IntegerField(min_value=0)
