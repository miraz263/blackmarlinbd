from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        # ── ServiceCategory ───────────────────────────────────────────────────
        migrations.CreateModel(
            name="ServiceCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100, unique=True)),
                ("slug", models.SlugField(blank=True, unique=True)),
                ("description", models.TextField(blank=True)),
                ("icon_name", models.CharField(
                    blank=True,
                    help_text="Lucide icon name (PascalCase), e.g. Brain, Cloud, ShieldCheck",
                    max_length=50,
                )),
                ("color", models.CharField(
                    default="#6366f1",
                    help_text="Hex colour used for accents, e.g. #6366f1",
                    max_length=7,
                )),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_published", models.BooleanField(default=True)),
            ],
            options={"db_table": "service_categories", "ordering": ["order", "name"], "verbose_name": "Service Category", "verbose_name_plural": "Service Categories"},
        ),

        # ── Technology ────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Technology",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100, unique=True)),
                ("logo", models.CharField(
                    blank=True,
                    help_text="Emoji or short text abbreviation, e.g. 🐍",
                    max_length=20,
                )),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
            ],
            options={"db_table": "service_technologies", "ordering": ["order", "name"], "verbose_name": "Technology", "verbose_name_plural": "Technologies"},
        ),

        # ── Service ───────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Service",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=200)),
                ("slug", models.SlugField(unique=True, blank=True)),
                ("tagline", models.CharField(blank=True, max_length=200)),
                ("short_description", models.CharField(blank=True, max_length=400)),
                ("description", models.TextField(blank=True, help_text="Lead paragraph shown on the detail page")),
                ("icon_name", models.CharField(
                    default="Zap",
                    help_text="Lucide icon name (PascalCase), e.g. Brain, Cloud, ShieldCheck",
                    max_length=50,
                )),
                ("cover_image", models.ImageField(blank=True, null=True, upload_to="services/covers/")),
                ("body", models.TextField(blank=True, help_text="Long-form Markdown content rendered on the detail page")),
                ("category", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="services",
                    to="services.servicecategory",
                )),
                ("technologies", models.ManyToManyField(
                    blank=True,
                    related_name="services",
                    to="services.technology",
                )),
                ("capabilities", models.JSONField(
                    default=list,
                    help_text='["Capability 1", "Capability 2", ...]',
                )),
                ("gradient", models.CharField(
                    choices=[
                        ("purple-brand",  "Purple → Brand"),
                        ("green-emerald", "Green → Emerald"),
                        ("cyan-blue",     "Cyan → Blue"),
                        ("orange-pink",   "Orange → Pink"),
                        ("red-rose",      "Red → Rose"),
                        ("brand-cyan",    "Brand → Cyan"),
                        ("yellow-orange", "Yellow → Orange"),
                    ],
                    default="purple-brand",
                    max_length=20,
                )),
                ("featured", models.BooleanField(db_index=True, default=False)),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                ("status", models.CharField(
                    choices=[("draft", "Draft"), ("published", "Published")],
                    db_index=True,
                    default="draft",
                    max_length=20,
                )),
                ("views_count", models.PositiveIntegerField(default=0)),
            ],
            options={"db_table": "services", "ordering": ["order", "-created_at"], "verbose_name": "Service", "verbose_name_plural": "Services"},
        ),

        # ── Service indexes ───────────────────────────────────────────────────
        migrations.AddIndex(
            model_name="service",
            index=models.Index(fields=["status", "featured"], name="services_status_featured_idx"),
        ),
        migrations.AddIndex(
            model_name="service",
            index=models.Index(fields=["category", "status"], name="services_category_status_idx"),
        ),

        # ── CaseStudy ─────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="CaseStudy",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("service", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="case_studies",
                    to="services.service",
                )),
                ("title", models.CharField(max_length=200)),
                ("client_name", models.CharField(blank=True, max_length=200)),
                ("challenge", models.TextField(blank=True)),
                ("solution", models.TextField(blank=True)),
                ("results", models.TextField(blank=True)),
                ("cover_image", models.ImageField(blank=True, null=True, upload_to="services/case_studies/")),
                ("is_published", models.BooleanField(default=True)),
                ("order", models.PositiveIntegerField(default=0)),
            ],
            options={"db_table": "service_case_studies", "ordering": ["order"], "verbose_name": "Case Study", "verbose_name_plural": "Case Studies"},
        ),
    ]
