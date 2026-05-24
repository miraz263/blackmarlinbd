from django.db import models
from django.utils.text import slugify
from apps.core.models import TimeStampedModel


class ServiceCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    icon_name = models.CharField(
        max_length=50,
        blank=True,
        help_text="Lucide icon name (PascalCase), e.g. Brain, Cloud, ShieldCheck",
    )
    color = models.CharField(
        max_length=7,
        default="#6366f1",
        help_text="Hex colour used for accents, e.g. #6366f1",
    )
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "service_categories"
        ordering = ["order", "name"]
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Technology(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    logo = models.CharField(
        max_length=20,
        blank=True,
        help_text="Emoji or short text abbreviation, e.g. 🐍",
    )
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        db_table = "service_technologies"
        ordering = ["order", "name"]
        verbose_name = "Technology"
        verbose_name_plural = "Technologies"

    def __str__(self):
        return self.name


class Service(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    class Gradient(models.TextChoices):
        PURPLE_BRAND  = "purple-brand",  "Purple → Brand"
        GREEN_EMERALD = "green-emerald", "Green → Emerald"
        CYAN_BLUE     = "cyan-blue",     "Cyan → Blue"
        ORANGE_PINK   = "orange-pink",   "Orange → Pink"
        RED_ROSE      = "red-rose",      "Red → Rose"
        BRAND_CYAN    = "brand-cyan",    "Brand → Cyan"
        YELLOW_ORANGE = "yellow-orange", "Yellow → Orange"

    title             = models.CharField(max_length=200)
    slug              = models.SlugField(unique=True, blank=True)
    tagline           = models.CharField(max_length=200, blank=True)
    short_description = models.CharField(max_length=400, blank=True)
    description       = models.TextField(blank=True, help_text="Lead paragraph shown on the detail page")
    icon_name         = models.CharField(
        max_length=50,
        default="Zap",
        help_text="Lucide icon name (PascalCase), e.g. Brain, Cloud, ShieldCheck",
    )
    cover_image       = models.ImageField(upload_to="services/covers/", null=True, blank=True)
    body              = models.TextField(
        blank=True,
        help_text="Long-form Markdown content rendered on the detail page",
    )
    category          = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="services",
    )
    technologies      = models.ManyToManyField(
        Technology,
        blank=True,
        related_name="services",
    )
    capabilities      = models.JSONField(
        default=list,
        help_text='["Capability 1", "Capability 2", ...]',
    )
    gradient          = models.CharField(
        max_length=20,
        choices=Gradient.choices,
        default=Gradient.PURPLE_BRAND,
    )
    featured          = models.BooleanField(default=False, db_index=True)
    order             = models.PositiveIntegerField(default=0, db_index=True)
    status            = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    views_count       = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "services"
        ordering = ["order", "-created_at"]
        indexes = [
            models.Index(fields=["status", "featured"]),
            models.Index(fields=["category", "status"]),
        ]
        verbose_name = "Service"
        verbose_name_plural = "Services"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def increment_views(self):
        Service.objects.filter(pk=self.pk).update(views_count=models.F("views_count") + 1)

    def __str__(self):
        return self.title


class CaseStudy(TimeStampedModel):
    service     = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="case_studies",
    )
    title       = models.CharField(max_length=200)
    client_name = models.CharField(max_length=200, blank=True)
    challenge   = models.TextField(blank=True)
    solution    = models.TextField(blank=True)
    results     = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="services/case_studies/", null=True, blank=True)
    is_published = models.BooleanField(default=True)
    order       = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "service_case_studies"
        ordering = ["order"]
        verbose_name = "Case Study"
        verbose_name_plural = "Case Studies"

    def __str__(self):
        return f"{self.service.title} — {self.title}"
