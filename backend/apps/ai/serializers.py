from rest_framework import serializers

from .models import AIChatMessage, AIGeneratedContent, AISession

_PROVIDERS = ["openai", "gemini"]


class BlogRequestSerializer(serializers.Serializer):
    topic    = serializers.CharField(max_length=500)
    keywords = serializers.ListField(child=serializers.CharField(max_length=100), required=False, default=list)
    tone     = serializers.ChoiceField(
        choices=["professional", "conversational", "technical", "enthusiastic"],
        default="professional",
    )
    length   = serializers.ChoiceField(choices=["short", "medium", "long"], default="medium")
    provider = serializers.ChoiceField(choices=_PROVIDERS, required=False, allow_null=True, default=None)


class SEORequestSerializer(serializers.Serializer):
    content          = serializers.CharField()
    target_keywords  = serializers.ListField(child=serializers.CharField(max_length=100), required=False, default=list)
    page_url         = serializers.URLField(required=False, allow_blank=True, default="")
    provider         = serializers.ChoiceField(choices=_PROVIDERS, required=False, allow_null=True, default=None)


class FAQRequestSerializer(serializers.Serializer):
    topic    = serializers.CharField(max_length=500)
    count    = serializers.IntegerField(min_value=3, max_value=20, default=5)
    audience = serializers.CharField(max_length=200, default="general audience")
    provider = serializers.ChoiceField(choices=_PROVIDERS, required=False, allow_null=True, default=None)


class LeadRequestSerializer(serializers.Serializer):
    contact_id   = serializers.IntegerField(required=False, allow_null=True)
    contact_data = serializers.DictField(required=False, allow_null=True)
    provider     = serializers.ChoiceField(choices=_PROVIDERS, required=False, allow_null=True, default=None)

    def validate(self, data):
        if not data.get("contact_id") and not data.get("contact_data"):
            raise serializers.ValidationError(
                "Provide either contact_id (int) or contact_data (dict)."
            )
        return data


class ChatRequestSerializer(serializers.Serializer):
    message    = serializers.CharField(max_length=4000)
    session_id = serializers.IntegerField(required=False, allow_null=True)
    context    = serializers.ChoiceField(
        choices=["general", "sales", "support", "technical"],
        default="general",
    )
    provider = serializers.ChoiceField(choices=_PROVIDERS, required=False, allow_null=True, default=None)


class AIChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AIChatMessage
        fields = ["id", "role", "content", "tokens", "created_at"]


class AISessionSerializer(serializers.ModelSerializer):
    messages = AIChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model  = AISession
        fields = ["id", "context", "title", "messages", "created_at", "updated_at"]


class AIGeneratedContentSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model  = AIGeneratedContent
        fields = [
            "id", "content_type", "prompt", "result", "provider", "model",
            "tokens_input", "tokens_output", "created_by_email", "created_at",
        ]
