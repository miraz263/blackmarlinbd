import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="Language",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",  models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",  models.DateTimeField(auto_now=True)),
                ("code",        models.CharField(max_length=10, unique=True, db_index=True)),
                ("name",        models.CharField(max_length=100)),
                ("native_name", models.CharField(max_length=100)),
                ("direction",   models.CharField(max_length=3, choices=[("ltr", "Left-to-Right"), ("rtl", "Right-to-Left")], default="ltr")),
                ("is_active",   models.BooleanField(default=True)),
                ("is_default",  models.BooleanField(default=False)),
                ("order",       models.PositiveIntegerField(default=0)),
            ],
            options={"db_table": "i18n_languages", "ordering": ["order", "code"]},
        ),
        migrations.CreateModel(
            name="UITranslation",
            fields=[
                ("id",       models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("language", models.CharField(max_length=10, db_index=True)),
                ("key",      models.CharField(max_length=255, db_index=True)),
                ("value",    models.TextField()),
            ],
            options={"db_table": "i18n_ui_translations"},
        ),
        migrations.CreateModel(
            name="ContentTranslation",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",  models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",  models.DateTimeField(auto_now=True)),
                ("object_id",   models.PositiveIntegerField()),
                ("field",       models.CharField(max_length=100)),
                ("language",    models.CharField(max_length=10, db_index=True)),
                ("value",       models.TextField(blank=True)),
                ("content_type", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="contenttypes.contenttype")),
            ],
            options={"db_table": "i18n_content_translations"},
        ),
        migrations.AlterUniqueTogether(
            name="uitranslation",
            unique_together={("language", "key")},
        ),
        migrations.AlterUniqueTogether(
            name="contenttranslation",
            unique_together={("content_type", "object_id", "field", "language")},
        ),
        migrations.AddIndex(
            model_name="uitranslation",
            index=models.Index(fields=["language", "key"], name="i18n_ui_lang_key_idx"),
        ),
        migrations.AddIndex(
            model_name="contenttranslation",
            index=models.Index(fields=["content_type", "object_id", "language"], name="i18n_ct_obj_lang_idx"),
        ),
    ]
