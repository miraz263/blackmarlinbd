from django.contrib import admin

from .models import AIChatMessage, AIGeneratedContent, AISession, AIUsageLog


@admin.register(AIGeneratedContent)
class AIGeneratedContentAdmin(admin.ModelAdmin):
    list_display   = ["content_type", "prompt_preview", "provider", "model", "tokens_total", "created_by", "created_at"]
    list_filter    = ["content_type", "provider", "created_at"]
    search_fields  = ["prompt", "created_by__email"]
    readonly_fields = ["result", "provider", "model", "tokens_input", "tokens_output", "created_by", "created_at", "updated_at"]
    date_hierarchy = "created_at"

    @admin.display(description="Prompt")
    def prompt_preview(self, obj):
        return obj.prompt[:80]

    @admin.display(description="Tokens")
    def tokens_total(self, obj):
        return obj.tokens_input + obj.tokens_output


class AIChatMessageInline(admin.TabularInline):
    model       = AIChatMessage
    extra       = 0
    readonly_fields = ["role", "content", "tokens", "created_at"]
    can_delete  = False


@admin.register(AISession)
class AISessionAdmin(admin.ModelAdmin):
    list_display  = ["id", "user", "context", "title", "message_count", "updated_at"]
    list_filter   = ["context", "updated_at"]
    search_fields = ["user__email", "title"]
    readonly_fields = ["created_at", "updated_at"]
    inlines       = [AIChatMessageInline]

    @admin.display(description="Messages")
    def message_count(self, obj):
        return obj.messages.count()


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    list_display   = ["feature", "provider", "model", "tokens_input", "tokens_output", "created_by", "created_at"]
    list_filter    = ["feature", "provider", "created_at"]
    search_fields  = ["created_by__email"]
    date_hierarchy = "created_at"
