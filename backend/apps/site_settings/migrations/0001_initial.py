import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SiteSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "company_name",
                    models.CharField(default="BlackMarlinBD", max_length=200),
                ),
                (
                    "company_short_name",
                    models.CharField(default="BlackMarlin", max_length=50),
                ),
                (
                    "logo",
                    models.ImageField(blank=True, null=True, upload_to="site/"),
                ),
                (
                    "favicon",
                    models.ImageField(blank=True, null=True, upload_to="site/"),
                ),
                (
                    "email",
                    models.EmailField(default="hello@blackmarlinbd.com", max_length=254),
                ),
                (
                    "phone",
                    models.CharField(blank=True, default="+1 (555) 000-0000", max_length=30),
                ),
                (
                    "whatsapp",
                    models.CharField(blank=True, max_length=30),
                ),
                (
                    "address",
                    models.TextField(blank=True, default="Dhaka, Bangladesh · New York, USA"),
                ),
                (
                    "google_map_embed",
                    models.TextField(
                        blank=True,
                        help_text="Paste the full Google Maps <iframe> embed code.",
                    ),
                ),
                ("facebook", models.URLField(blank=True)),
                (
                    "linkedin",
                    models.URLField(
                        blank=True,
                        default="https://linkedin.com/company/blackmarlinbd",
                    ),
                ),
                ("youtube", models.URLField(blank=True)),
                (
                    "twitter",
                    models.URLField(
                        blank=True,
                        default="https://twitter.com/blackmarlinbd",
                    ),
                ),
                ("instagram", models.URLField(blank=True)),
            ],
            options={
                "verbose_name": "Site Settings",
                "verbose_name_plural": "Site Settings",
                "db_table": "site_settings",
            },
        ),
        migrations.CreateModel(
            name="FooterSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "copyright_text",
                    models.CharField(
                        default="BlackMarlinBD. All rights reserved.",
                        max_length=300,
                    ),
                ),
                (
                    "footer_about",
                    models.TextField(
                        blank=True,
                        default=(
                            "Building the digital future through cutting-edge AI, cloud, and enterprise systems. "
                            "Trusted by global leaders across finance, tech, and beyond."
                        ),
                    ),
                ),
                (
                    "footer_logo",
                    models.ImageField(blank=True, null=True, upload_to="site/"),
                ),
                (
                    "newsletter_enabled",
                    models.BooleanField(default=True),
                ),
            ],
            options={
                "verbose_name": "Footer Settings",
                "verbose_name_plural": "Footer Settings",
                "db_table": "footer_settings",
            },
        ),
        migrations.CreateModel(
            name="ContactSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "office_hours",
                    models.CharField(
                        blank=True,
                        default="Mon – Fri · 9 AM – 6 PM (UTC+6)",
                        max_length=200,
                    ),
                ),
                (
                    "support_email",
                    models.EmailField(
                        blank=True,
                        default="support@blackmarlinbd.com",
                        max_length=254,
                    ),
                ),
                (
                    "sales_email",
                    models.EmailField(
                        blank=True,
                        default="sales@blackmarlinbd.com",
                        max_length=254,
                    ),
                ),
            ],
            options={
                "verbose_name": "Contact Settings",
                "verbose_name_plural": "Contact Settings",
                "db_table": "contact_settings",
            },
        ),
    ]
