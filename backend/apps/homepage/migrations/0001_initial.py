from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        # ── HeroSection ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name="HeroSection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(default="We Build Intelligent Systems That Scale", max_length=300)),
                ("subtitle", models.CharField(blank=True, max_length=200)),
                ("description", models.TextField(
                    default=(
                        "BlackMarlinBD is a global IT firm specializing in AI, financial technology, "
                        "cloud infrastructure, and enterprise software — engineering tomorrow's solutions today."
                    )
                )),
                ("badge_text", models.CharField(default="Trusted by Fortune 500 Companies", max_length=200)),
                ("background_image", models.ImageField(blank=True, null=True, upload_to="homepage/hero/")),
                ("video_url", models.URLField(blank=True)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "homepage_hero", "verbose_name": "Hero Section", "verbose_name_plural": "Hero Section"},
        ),

        # ── HeroButton ───────────────────────────────────────────────────────
        migrations.CreateModel(
            name="HeroButton",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("hero", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="buttons", to="homepage.herosection")),
                ("label", models.CharField(max_length=100)),
                ("url", models.CharField(help_text="Relative (/contact) or absolute URL", max_length=500)),
                ("variant", models.CharField(
                    choices=[("primary", "Primary (gradient)"), ("outline", "Outline")],
                    default="primary",
                    max_length=20,
                )),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "homepage_hero_buttons", "ordering": ["order"], "verbose_name": "Hero Button"},
        ),

        # ── StatisticCard ────────────────────────────────────────────────────
        migrations.CreateModel(
            name="StatisticCard",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("label", models.CharField(max_length=100)),
                ("value", models.CharField(help_text='e.g. "99.9%", "50+", "10M+"', max_length=50)),
                ("icon_name", models.CharField(
                    default="Zap",
                    help_text="Lucide icon name (PascalCase), e.g. Zap, Star, Users, TrendingUp",
                    max_length=50,
                )),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "homepage_statistics", "ordering": ["order"], "verbose_name": "Statistic Card", "verbose_name_plural": "Statistic Cards"},
        ),

        # ── PartnerLogo ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name="PartnerLogo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100)),
                ("logo", models.ImageField(upload_to="homepage/partners/")),
                ("url", models.URLField(blank=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "homepage_partners", "ordering": ["order", "name"], "verbose_name": "Partner Logo", "verbose_name_plural": "Partner Logos"},
        ),

        # ── TechItem ─────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="TechItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100)),
                ("logo", models.CharField(
                    blank=True,
                    help_text="Emoji or short text abbreviation, e.g. 🐍",
                    max_length=20,
                )),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "homepage_tech_items", "ordering": ["order", "name"], "verbose_name": "Tech Stack Item", "verbose_name_plural": "Tech Stack Items"},
        ),

        # ── ServiceItem ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name="ServiceItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("icon_name", models.CharField(
                    default="Zap",
                    help_text="Lucide icon name (PascalCase), e.g. Brain, Cloud, ShieldCheck",
                    max_length=50,
                )),
                ("gradient", models.CharField(
                    choices=[
                        ("purple-brand", "Purple → Brand"),
                        ("green-emerald", "Green → Emerald"),
                        ("cyan-blue", "Cyan → Blue"),
                        ("orange-pink", "Orange → Pink"),
                        ("red-rose", "Red → Rose"),
                        ("brand-cyan", "Brand → Cyan"),
                        ("yellow-orange", "Yellow → Orange"),
                    ],
                    default="purple-brand",
                    max_length=20,
                )),
                ("href", models.CharField(default="/services", max_length=500)),
                ("tags", models.JSONField(default=list, help_text='["Tag1", "Tag2", ...]')),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "homepage_services", "ordering": ["order"], "verbose_name": "Service Item", "verbose_name_plural": "Service Items"},
        ),

        # ── HomepageSection ──────────────────────────────────────────────────
        migrations.CreateModel(
            name="HomepageSection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("section_key", models.CharField(
                    choices=[
                        ("hero", "Hero"),
                        ("tech_stack", "Tech Stack"),
                        ("services", "Services"),
                        ("projects", "Featured Projects"),
                        ("cta", "Call to Action"),
                        ("partners", "Partner Logos"),
                        ("statistics", "Statistics"),
                    ],
                    max_length=20,
                    unique=True,
                )),
                ("title", models.CharField(blank=True, max_length=300)),
                ("subtitle", models.CharField(blank=True, max_length=300)),
                ("description", models.TextField(blank=True)),
                ("badge_text", models.CharField(blank=True, max_length=100)),
                ("cta_text", models.CharField(blank=True, max_length=100)),
                ("cta_link", models.CharField(blank=True, max_length=500)),
                ("is_visible", models.BooleanField(default=True)),
                ("order", models.PositiveIntegerField(default=0)),
            ],
            options={"db_table": "homepage_sections", "ordering": ["order"], "verbose_name": "Homepage Section", "verbose_name_plural": "Homepage Sections"},
        ),
    ]
