from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.core.models import TimeStampedModel


class TextDirection(models.TextChoices):
    LTR = "ltr", "Left-to-Right"
    RTL = "rtl", "Right-to-Left"


class Language(TimeStampedModel):
    code        = models.CharField(max_length=10, unique=True, db_index=True)
    name        = models.CharField(max_length=100)
    native_name = models.CharField(max_length=100)
    direction   = models.CharField(
        max_length=3, choices=TextDirection.choices, default=TextDirection.LTR
    )
    is_active   = models.BooleanField(default=True)
    is_default  = models.BooleanField(default=False)
    order       = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "i18n_languages"
        ordering = ["order", "code"]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        # Only one default language
        if self.is_default:
            Language.objects.exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class UITranslation(models.Model):
    """Key-value pairs for static UI strings per language."""
    language = models.CharField(max_length=10, db_index=True)
    key      = models.CharField(max_length=255, db_index=True)
    value    = models.TextField()

    class Meta:
        db_table = "i18n_ui_translations"
        unique_together = [["language", "key"]]
        indexes = [models.Index(fields=["language", "key"], name="i18n_ui_lang_key_idx")]

    def __str__(self):
        return f"[{self.language}] {self.key}"


class ContentTranslation(TimeStampedModel):
    """Per-field translations for any model instance."""
    content_type   = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id      = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    field    = models.CharField(max_length=100)
    language = models.CharField(max_length=10, db_index=True)
    value    = models.TextField(blank=True)

    class Meta:
        db_table = "i18n_content_translations"
        unique_together = [["content_type", "object_id", "field", "language"]]
        indexes = [
            models.Index(
                fields=["content_type", "object_id", "language"],
                name="i18n_ct_obj_lang_idx",
            )
        ]

    def __str__(self):
        return f"[{self.language}] {self.content_type}.{self.object_id}.{self.field}"
