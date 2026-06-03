from django.db import models
from django.utils.text import slugify
from apps.core.models import TimeStampedModel


class ProductCategory(TimeStampedModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name e.g. Building2")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "product_categories"
        ordering = ["order", "name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    tagline = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        ProductCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name e.g. Users")
    icon_color = models.CharField(max_length=7, default="#6366f1", help_text="Hex colour for icon background")
    badge = models.CharField(max_length=50, blank=True, help_text="Short label e.g. AI, HFT, Enterprise")
    class NavSection(models.TextChoices):
        PRODUCTS  = "products",  "Products Menu"
        SERVICES  = "services",  "Services Menu"
        FEATURED  = "featured",  "Homepage Featured"
        HIDDEN    = "hidden",    "Hidden (no menu)"

    is_new = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    nav_section = models.CharField(
        max_length=20, choices=NavSection.choices, default=NavSection.PRODUCTS,
        help_text="Which navigation menu this product appears under", db_index=True,
    )
    demo_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "products"
        ordering = ["order", "name"]
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["is_featured", "is_active"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
