from django.db import models
from apps.core.models import TimeStampedModel


class SingletonModel(models.Model):
    """Enforces a single database row. Use cls.load() to get-or-create it."""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # Singleton rows must not be deleted via the ORM.

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


# ─── Hero ──────────────────────────────────────────────────────────────────

class HeroSection(SingletonModel):
    title = models.CharField(
        max_length=300, default="We Build Intelligent Systems That Scale"
    )
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(
        default=(
            "BlackMarlinBD is a global IT firm specializing in AI, financial technology, "
            "cloud infrastructure, and enterprise software — engineering tomorrow's solutions today."
        )
    )
    badge_text = models.CharField(
        max_length=200, default="Trusted by Fortune 500 Companies"
    )
    background_image = models.ImageField(
        upload_to="homepage/hero/", null=True, blank=True
    )
    video_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "homepage_hero"
        verbose_name = "Hero Section"
        verbose_name_plural = "Hero Section"

    def __str__(self):
        return "Hero Section"


class HeroButton(TimeStampedModel):
    class Variant(models.TextChoices):
        PRIMARY = "primary", "Primary (gradient)"
        OUTLINE = "outline", "Outline"

    hero = models.ForeignKey(
        HeroSection, on_delete=models.CASCADE, related_name="buttons"
    )
    label = models.CharField(max_length=100)
    url = models.CharField(
        max_length=500, help_text="Relative (/contact) or absolute URL"
    )
    variant = models.CharField(
        max_length=20, choices=Variant.choices, default=Variant.PRIMARY
    )
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "homepage_hero_buttons"
        ordering = ["order"]
        verbose_name = "Hero Button"

    def __str__(self):
        return self.label


# ─── Statistics ────────────────────────────────────────────────────────────

class StatisticCard(TimeStampedModel):
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=50, help_text='e.g. "99.9%", "50+", "10M+"')
    icon_name = models.CharField(
        max_length=50,
        default="Zap",
        help_text="Lucide icon name (PascalCase), e.g. Zap, Star, Users, TrendingUp",
    )
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "homepage_statistics"
        ordering = ["order"]
        verbose_name = "Statistic Card"
        verbose_name_plural = "Statistic Cards"

    def __str__(self):
        return f"{self.value} — {self.label}"


# ─── Partners ──────────────────────────────────────────────────────────────

class PartnerLogo(TimeStampedModel):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="homepage/partners/")
    url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "homepage_partners"
        ordering = ["order", "name"]
        verbose_name = "Partner Logo"
        verbose_name_plural = "Partner Logos"

    def __str__(self):
        return self.name


# ─── Tech Stack ────────────────────────────────────────────────────────────

class TechItem(TimeStampedModel):
    name = models.CharField(max_length=100)
    logo = models.CharField(
        max_length=20,
        blank=True,
        help_text="Emoji or short text abbreviation, e.g. 🐍",
    )
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "homepage_tech_items"
        ordering = ["order", "name"]
        verbose_name = "Tech Stack Item"
        verbose_name_plural = "Tech Stack Items"

    def __str__(self):
        return self.name


# ─── Services ──────────────────────────────────────────────────────────────

class ServiceItem(TimeStampedModel):
    class Gradient(models.TextChoices):
        PURPLE_BRAND = "purple-brand", "Purple → Brand"
        GREEN_EMERALD = "green-emerald", "Green → Emerald"
        CYAN_BLUE = "cyan-blue", "Cyan → Blue"
        ORANGE_PINK = "orange-pink", "Orange → Pink"
        RED_ROSE = "red-rose", "Red → Rose"
        BRAND_CYAN = "brand-cyan", "Brand → Cyan"
        YELLOW_ORANGE = "yellow-orange", "Yellow → Orange"

    title = models.CharField(max_length=200)
    description = models.TextField()
    icon_name = models.CharField(
        max_length=50,
        default="Zap",
        help_text="Lucide icon name (PascalCase), e.g. Brain, Cloud, ShieldCheck",
    )
    gradient = models.CharField(
        max_length=20,
        choices=Gradient.choices,
        default=Gradient.PURPLE_BRAND,
    )
    href = models.CharField(max_length=500, default="/services")
    tags = models.JSONField(default=list, help_text='["Tag1", "Tag2", ...]')
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "homepage_services"
        ordering = ["order"]
        verbose_name = "Service Item"
        verbose_name_plural = "Service Items"

    def __str__(self):
        return self.title


# ─── Homepage Sections ─────────────────────────────────────────────────────

class HomepageSection(TimeStampedModel):
    """Controls the heading, visibility and order of each homepage section."""

    class SectionKey(models.TextChoices):
        HERO = "hero", "Hero"
        TECH_STACK = "tech_stack", "Tech Stack"
        SERVICES = "services", "Services"
        PROJECTS = "projects", "Featured Projects"
        CTA = "cta", "Call to Action"
        PARTNERS = "partners", "Partner Logos"
        STATISTICS = "statistics", "Statistics"

    section_key = models.CharField(
        max_length=20, choices=SectionKey.choices, unique=True
    )
    title = models.CharField(max_length=300, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    badge_text = models.CharField(max_length=100, blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.CharField(max_length=500, blank=True)
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "homepage_sections"
        ordering = ["order"]
        verbose_name = "Homepage Section"
        verbose_name_plural = "Homepage Sections"

    def __str__(self):
        return f"{self.get_section_key_display()} Section"
