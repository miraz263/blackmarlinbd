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


# ─── About Page (singleton) ────────────────────────────────────────────────

class AboutPage(SingletonModel):
    """Controls the About page hero block and company narrative."""

    badge_text = models.CharField(max_length=100, default="Our Story")
    hero_title = models.CharField(
        max_length=300, default="Engineering the Digital Future"
    )
    hero_subtitle = models.CharField(max_length=300, blank=True)
    hero_description = models.TextField(
        default=(
            "Founded in 2018, BlackMarlinBD started as a three-person team in Dhaka with a "
            "single mission: build world-class technology for global enterprises. Today, we're "
            "a 120+ engineer firm trusted by Fortune 500 companies across five continents."
        )
    )
    founded_year = models.PositiveSmallIntegerField(default=2018)
    tagline = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = "about_page"
        verbose_name = "About Page"
        verbose_name_plural = "About Page"

    def __str__(self):
        return "About Page"


# ─── Mission (singleton) ───────────────────────────────────────────────────

class Mission(SingletonModel):
    title = models.CharField(max_length=200, default="Our Mission")
    description = models.TextField(
        default=(
            "To build world-class technology that empowers global enterprises to innovate "
            "faster, operate smarter, and compete on the world stage."
        )
    )

    class Meta:
        db_table = "about_mission"
        verbose_name = "Mission"
        verbose_name_plural = "Mission"

    def __str__(self):
        return "Mission"


# ─── Vision (singleton) ────────────────────────────────────────────────────

class Vision(SingletonModel):
    title = models.CharField(max_length=200, default="Our Vision")
    description = models.TextField(
        default=(
            "To become the most trusted engineering partner for the world's most ambitious "
            "organisations — from startups to Fortune 500 leaders."
        )
    )

    class Meta:
        db_table = "about_vision"
        verbose_name = "Vision"
        verbose_name_plural = "Vision"

    def __str__(self):
        return "Vision"


# ─── Core Value ────────────────────────────────────────────────────────────

class CoreValue(TimeStampedModel):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon_name = models.CharField(
        max_length=50,
        default="Zap",
        help_text="Lucide icon name (PascalCase), e.g. Code2, Heart, Shield, Lightbulb",
    )
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "about_core_values"
        ordering = ["order"]
        verbose_name = "Core Value"
        verbose_name_plural = "Core Values"

    def __str__(self):
        return self.title


# ─── Team Member ───────────────────────────────────────────────────────────

class TeamMember(TimeStampedModel):
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200)
    photo = models.ImageField(upload_to="about/team/", null=True, blank=True)
    bio = models.TextField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "about_team"
        ordering = ["display_order", "name"]
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"

    def __str__(self):
        return f"{self.name} — {self.designation}"
