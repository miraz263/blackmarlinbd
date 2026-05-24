from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SEOPage",
            fields=[
                ("id",               models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",       models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",       models.DateTimeField(auto_now=True)),
                ("page_key",         models.CharField(db_index=True, help_text="Unique page identifier, e.g. 'home', 'about', 'service-ai-ml'", max_length=200, unique=True)),
                ("meta_title",       models.CharField(blank=True, max_length=200)),
                ("meta_description", models.TextField(blank=True, max_length=500)),
                ("keywords",         models.CharField(blank=True, help_text="Comma-separated keywords", max_length=500)),
                ("canonical_url",    models.URLField(blank=True)),
                ("og_title",         models.CharField(blank=True, help_text="Defaults to meta_title when blank", max_length=200)),
                ("og_description",   models.TextField(blank=True, help_text="Defaults to meta_description when blank", max_length=500)),
                ("og_image",         models.ImageField(blank=True, help_text="Recommended: 1200×630 px", null=True, upload_to="seo/og/")),
                ("og_type",          models.CharField(default="website", max_length=50)),
                ("twitter_card",     models.CharField(choices=[("summary", "Summary"), ("summary_large_image", "Summary Large Image")], default="summary_large_image", max_length=30)),
                ("schema_json",      models.JSONField(blank=True, help_text="JSON-LD structured data object (without the <script> wrapper)", null=True)),
                ("no_index",         models.BooleanField(default=False, help_text="Add noindex,nofollow robots meta when True")),
            ],
            options={
                "verbose_name": "SEO Page",
                "verbose_name_plural": "SEO Pages",
                "db_table": "seo_pages",
                "ordering": ["page_key"],
            },
        ),
    ]
