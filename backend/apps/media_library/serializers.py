from rest_framework import serializers
from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    url           = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    uploaded_by   = serializers.SerializerMethodField()

    class Meta:
        model  = MediaAsset
        fields = [
            "id", "title", "url", "thumbnail_url", "asset_type",
            "mime_type", "size", "alt_text", "folder",
            "original_filename", "uploaded_by", "created_at",
        ]
        read_only_fields = [
            "url", "thumbnail_url", "asset_type", "mime_type",
            "size", "original_filename", "uploaded_by", "created_at",
        ]

    def get_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.url

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return obj.thumbnail_url

    def get_uploaded_by(self, obj):
        if obj.uploaded_by_id:
            u = obj.uploaded_by
            return {"id": u.id, "username": u.username}
        return None


class MediaUploadSerializer(serializers.Serializer):
    files  = serializers.ListField(child=serializers.FileField(), min_length=1, max_length=20)
    folder = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
