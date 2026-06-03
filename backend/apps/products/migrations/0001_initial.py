from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ProductCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(blank=True, unique=True)),
                ("icon_name", models.CharField(blank=True, help_text="Lucide icon name e.g. Building2", max_length=50)),
                ("order", models.PositiveIntegerField(default=0)),
            ],
            options={
                "verbose_name_plural": "categories",
                "db_table": "product_categories",
                "ordering": ["order", "name"],
            },
        ),
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=200)),
                ("slug", models.SlugField(blank=True, unique=True)),
                ("tagline", models.CharField(max_length=300)),
                ("description", models.TextField(blank=True)),
                ("icon_name", models.CharField(blank=True, help_text="Lucide icon name e.g. Users", max_length=50)),
                ("icon_color", models.CharField(default="#6366f1", help_text="Hex colour for icon background", max_length=7)),
                ("badge", models.CharField(blank=True, help_text="Short label e.g. AI, HFT, Enterprise", max_length=50)),
                ("is_new", models.BooleanField(default=False)),
                ("is_featured", models.BooleanField(db_index=True, default=False)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("demo_url", models.URLField(blank=True)),
                ("order", models.PositiveIntegerField(default=0)),
                (
                    "category",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="products",
                        to="products.productcategory",
                    ),
                ),
            ],
            options={
                "db_table": "products",
                "ordering": ["order", "name"],
            },
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["category", "is_active"], name="products_categor_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["is_featured", "is_active"], name="products_feature_idx"),
        ),
    ]
