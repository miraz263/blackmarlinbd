from rest_framework import serializers

from .models import ContentTranslation, Language, UITranslation


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Language
        fields = ["code", "name", "native_name", "direction", "is_active", "is_default", "order"]


class LanguageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Language
        fields = ["code", "name", "native_name", "direction", "is_active", "is_default", "order"]


class UITranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UITranslation
        fields = ["language", "key", "value"]


class ContentTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContentTranslation
        fields = ["id", "field", "language", "value", "updated_at"]
