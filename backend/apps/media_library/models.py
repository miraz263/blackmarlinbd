import mimetypes
import os
from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from apps.core.models import TimeStampedModel


def media_upload_path(instance, filename):
    folder = (instance.folder or "uploads").strip("/")
    # Prevent path traversal
    safe_name = os.path.basename(filename).replace("..", "")
    return f"media_library/{folder}/{safe_name}"


def thumbnail_upload_path(instance, filename):
    return f"media_library/thumbnails/{os.path.basename(filename)}"


def _detect_type(mime: str) -> str:
    if mime.startswith("image/"):
        return MediaAsset.AssetType.IMAGE
    if mime.startswith("video/"):
        return MediaAsset.AssetType.VIDEO
    if mime == "application/pdf":
        return MediaAsset.AssetType.PDF
    if "word" in mime or "document" in mime or "msword" in mime:
        return MediaAsset.AssetType.DOC
    return MediaAsset.AssetType.OTHER


class MediaAsset(TimeStampedModel):
    class AssetType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        PDF   = "pdf",   "PDF"
        DOC   = "doc",   "Document"
        OTHER = "other", "Other"

    title             = models.CharField(max_length=300)
    file              = models.FileField(upload_to=media_upload_path)
    thumbnail         = models.ImageField(
        upload_to=thumbnail_upload_path, null=True, blank=True
    )
    asset_type        = models.CharField(
        max_length=10, choices=AssetType.choices, db_index=True
    )
    mime_type         = models.CharField(max_length=100, blank=True)
    size              = models.PositiveBigIntegerField(default=0)
    alt_text          = models.CharField(max_length=300, blank=True)
    folder            = models.CharField(max_length=200, blank=True, db_index=True)
    original_filename = models.CharField(max_length=300, blank=True)
    uploaded_by       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="media_assets",
    )

    class Meta:
        db_table = "media_assets"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["asset_type", "-created_at"], name="media_type_date_idx"),
            models.Index(fields=["folder", "-created_at"],     name="media_folder_date_idx"),
        ]
        verbose_name = "Media Asset"
        verbose_name_plural = "Media Assets"

    def __str__(self):
        return self.title

    @property
    def url(self):
        return self.file.url if self.file else None

    @property
    def thumbnail_url(self):
        return self.thumbnail.url if self.thumbnail else None

    @classmethod
    def from_file(cls, uploaded_file, folder="", uploaded_by=None):
        mime = (
            uploaded_file.content_type
            or mimetypes.guess_type(uploaded_file.name)[0]
            or "application/octet-stream"
        )
        instance = cls(
            title=os.path.splitext(uploaded_file.name)[0].replace("-", " ").replace("_", " ").title(),
            original_filename=uploaded_file.name,
            folder=folder,
            asset_type=_detect_type(mime),
            mime_type=mime,
            size=uploaded_file.size,
            uploaded_by=uploaded_by,
        )
        instance.file = uploaded_file
        return instance


@receiver(post_delete, sender=MediaAsset)
def delete_media_files(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)
    if instance.thumbnail:
        instance.thumbnail.delete(save=False)
