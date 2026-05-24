from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class AIGeneratedContent(TimeStampedModel):
    class ContentType(models.TextChoices):
        BLOG = "blog", "Blog Post"
        SEO  = "seo",  "SEO Analysis"
        FAQ  = "faq",  "FAQ"
        CHAT = "chat", "Chat Response"
        LEAD = "lead", "Lead Analysis"

    content_type  = models.CharField(max_length=20, choices=ContentType.choices, db_index=True)
    prompt        = models.TextField()
    result        = models.JSONField()
    provider      = models.CharField(max_length=50)
    model         = models.CharField(max_length=100, blank=True)
    tokens_input  = models.PositiveIntegerField(default=0)
    tokens_output = models.PositiveIntegerField(default=0)
    created_by    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="ai_generations",
    )

    class Meta:
        db_table = "ai_generated_content"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["content_type", "created_at"]),
            models.Index(fields=["created_by",   "created_at"]),
        ]

    def __str__(self):
        return f"{self.content_type} by {self.created_by_id} @ {self.created_at:%Y-%m-%d %H:%M}"


class AISession(TimeStampedModel):
    class Context(models.TextChoices):
        GENERAL   = "general",   "General"
        SALES     = "sales",     "Sales"
        SUPPORT   = "support",   "Support"
        TECHNICAL = "technical", "Technical"

    user    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_sessions",
    )
    context = models.CharField(max_length=20, choices=Context.choices, default=Context.GENERAL)
    title   = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = "ai_sessions"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Session {self.pk} ({self.context}) — {self.user_id}"


class AIChatMessage(models.Model):
    class Role(models.TextChoices):
        USER      = "user",      "User"
        ASSISTANT = "assistant", "Assistant"
        SYSTEM    = "system",    "System"

    session    = models.ForeignKey(AISession, on_delete=models.CASCADE, related_name="messages")
    role       = models.CharField(max_length=20, choices=Role.choices)
    content    = models.TextField()
    tokens     = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_chat_messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"


class AIUsageLog(models.Model):
    feature       = models.CharField(max_length=50, db_index=True)
    provider      = models.CharField(max_length=50)
    model         = models.CharField(max_length=100, blank=True)
    tokens_input  = models.PositiveIntegerField(default=0)
    tokens_output = models.PositiveIntegerField(default=0)
    created_by    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_usage_logs"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["feature", "created_at"])]

    def __str__(self):
        total = self.tokens_input + self.tokens_output
        return f"{self.feature} | {self.provider} | {total} tokens"
