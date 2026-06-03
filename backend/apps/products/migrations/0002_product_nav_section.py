from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="nav_section",
            field=models.CharField(
                choices=[
                    ("products", "Products Menu"),
                    ("services", "Services Menu"),
                    ("featured", "Homepage Featured"),
                    ("hidden",   "Hidden (no menu)"),
                ],
                db_index=True,
                default="products",
                help_text="Which navigation menu this product appears under",
                max_length=20,
            ),
        ),
    ]
