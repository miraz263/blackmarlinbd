from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import apps.media_library.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="MediaAsset",
            fields=[
                ("id",                models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",        models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",        models.DateTimeField(auto_now=True)),
                ("title",             models.CharField(max_length=300)),
                ("file",              models.FileField(upload_to=apps.media_library.models.media_upload_path)),
                ("thumbnail",         models.ImageField(blank=True, null=True, upload_to=apps.media_library.models.thumbnail_upload_path)),
                ("asset_type",        models.CharField(choices=[("image", "Image"), ("video", "Video"), ("pdf", "PDF"), ("doc", "Document"), ("other", "Other")], db_index=True, max_length=10)),
                ("mime_type",         models.CharField(blank=True, max_length=100)),
                ("size",              models.PositiveBigIntegerField(default=0)),
                ("alt_text",          models.CharField(blank=True, max_length=300)),
                ("folder",            models.CharField(blank=True, db_index=True, max_length=200)),
                ("original_filename", models.CharField(blank=True, max_length=300)),
                ("uploaded_by",       models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="media_assets", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "Media Asset",
                "verbose_name_plural": "Media Assets",
                "db_table": "media_assets",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="mediaasset",
            index=models.Index(fields=["asset_type", "-created_at"], name="media_type_date_idx"),
        ),
        migrations.AddIndex(
            model_name="mediaasset",
            index=models.Index(fields=["folder", "-created_at"], name="media_folder_date_idx"),
        ),
    ]
