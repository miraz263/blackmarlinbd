from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        # ── AboutPage ─────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="AboutPage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("badge_text", models.CharField(default="Our Story", max_length=100)),
                ("hero_title", models.CharField(default="Engineering the Digital Future", max_length=300)),
                ("hero_subtitle", models.CharField(blank=True, max_length=300)),
                ("hero_description", models.TextField(
                    default=(
                        "Founded in 2018, BlackMarlinBD started as a three-person team in Dhaka with a "
                        "single mission: build world-class technology for global enterprises. Today, we're "
                        "a 120+ engineer firm trusted by Fortune 500 companies across five continents."
                    )
                )),
                ("founded_year", models.PositiveSmallIntegerField(default=2018)),
                ("tagline", models.CharField(blank=True, max_length=200)),
            ],
            options={"db_table": "about_page", "verbose_name": "About Page", "verbose_name_plural": "About Page"},
        ),

        # ── Mission ───────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Mission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(default="Our Mission", max_length=200)),
                ("description", models.TextField(
                    default=(
                        "To build world-class technology that empowers global enterprises to innovate "
                        "faster, operate smarter, and compete on the world stage."
                    )
                )),
            ],
            options={"db_table": "about_mission", "verbose_name": "Mission", "verbose_name_plural": "Mission"},
        ),

        # ── Vision ────────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Vision",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(default="Our Vision", max_length=200)),
                ("description", models.TextField(
                    default=(
                        "To become the most trusted engineering partner for the world's most ambitious "
                        "organisations — from startups to Fortune 500 leaders."
                    )
                )),
            ],
            options={"db_table": "about_vision", "verbose_name": "Vision", "verbose_name_plural": "Vision"},
        ),

        # ── CoreValue ─────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="CoreValue",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("icon_name", models.CharField(
                    default="Zap",
                    help_text="Lucide icon name (PascalCase), e.g. Code2, Heart, Shield, Lightbulb",
                    max_length=50,
                )),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "about_core_values", "ordering": ["order"], "verbose_name": "Core Value", "verbose_name_plural": "Core Values"},
        ),

        # ── TeamMember ────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="TeamMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=200)),
                ("designation", models.CharField(max_length=200)),
                ("photo", models.ImageField(blank=True, null=True, upload_to="about/team/")),
                ("bio", models.TextField(blank=True)),
                ("linkedin", models.URLField(blank=True)),
                ("github", models.URLField(blank=True)),
                ("email", models.EmailField(blank=True)),
                ("display_order", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "about_team", "ordering": ["display_order", "name"], "verbose_name": "Team Member", "verbose_name_plural": "Team Members"},
        ),
    ]
