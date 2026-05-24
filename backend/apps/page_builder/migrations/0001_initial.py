from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Page",
            fields=[
                ("id",           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",   models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",   models.DateTimeField(auto_now=True)),
                ("title",        models.CharField(max_length=200)),
                ("slug",         models.SlugField(blank=True, max_length=220, unique=True)),
                ("description",  models.TextField(blank=True)),
                ("is_published", models.BooleanField(db_index=True, default=False)),
                ("meta",         models.JSONField(blank=True, default=dict, help_text="Extra page-level metadata (og image, etc.)")),
            ],
            options={"verbose_name": "Page", "verbose_name_plural": "Pages", "db_table": "pb_pages", "ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Section",
            fields=[
                ("id",           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",   models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",   models.DateTimeField(auto_now=True)),
                ("label",        models.CharField(blank=True, help_text="Internal label, e.g. 'Hero area'", max_length=100)),
                ("order",        models.PositiveIntegerField(db_index=True, default=0)),
                ("style_json",   models.JSONField(blank=True, default=dict)),
                ("is_published", models.BooleanField(default=True)),
                ("page",         models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sections", to="page_builder.page")),
            ],
            options={"verbose_name": "Section", "verbose_name_plural": "Sections", "db_table": "pb_sections", "ordering": ["order"]},
        ),
        migrations.CreateModel(
            name="Block",
            fields=[
                ("id",           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",   models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",   models.DateTimeField(auto_now=True)),
                ("block_type",   models.CharField(choices=[("hero", "Hero"), ("text", "Text & Heading"), ("image", "Image"), ("video", "Video"), ("faq", "FAQ"), ("gallery", "Gallery"), ("stats", "Stats"), ("team", "Team"), ("services", "Services")], db_index=True, max_length=20)),
                ("order",        models.PositiveIntegerField(db_index=True, default=0)),
                ("content_json", models.JSONField(default=dict)),
                ("style_json",   models.JSONField(blank=True, default=dict)),
                ("is_published", models.BooleanField(default=True)),
                ("section",      models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="blocks", to="page_builder.section")),
            ],
            options={"verbose_name": "Block", "verbose_name_plural": "Blocks", "db_table": "pb_blocks", "ordering": ["order"]},
        ),
    ]
