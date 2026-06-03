from django.db import models


class SingletonModel(models.Model):
    """
    Abstract base that enforces a single database row.
    Use cls.load() to get the unique instance (creates it on first call).
    Deletion is a no-op so the row is never accidentally removed.
    """

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Singleton rows must never be deleted via the ORM.
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SiteSettings(SingletonModel):
    """Global company information used site-wide."""

    company_name = models.CharField(max_length=200, default="BlackMarlinBD")
    company_short_name = models.CharField(max_length=50, default="BlackMarlin")
    logo = models.ImageField(upload_to="site/", null=True, blank=True)
    favicon = models.ImageField(upload_to="site/", null=True, blank=True)
    email = models.EmailField(default="hello@blackmarlinbd.com")
    phone = models.CharField(max_length=30, blank=True, default="+1 (555) 000-0000")
    whatsapp = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True, default="Dhaka, Bangladesh · New York, USA")
    google_map_embed = models.TextField(
        blank=True,
        help_text="Paste the full Google Maps <iframe> embed code.",
    )
    facebook = models.URLField(blank=True)
    linkedin = models.URLField(
        blank=True, default="https://linkedin.com/company/blackmarlinbd"
    )
    youtube = models.URLField(blank=True)
    twitter = models.URLField(
        blank=True, default="https://twitter.com/blackmarlinbd"
    )
    instagram = models.URLField(blank=True)

    class Meta:
        db_table = "site_settings"
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return self.company_name


class FooterSettings(SingletonModel):
    """Controls what appears in the site footer."""

    copyright_text = models.CharField(
        max_length=300,
        default="BlackMarlinBD. All rights reserved.",
    )
    footer_about = models.TextField(
        blank=True,
        default=(
            "Building the digital future through cutting-edge AI, cloud, and enterprise systems. "
            "Trusted by global leaders across finance, tech, and beyond."
        ),
    )
    footer_logo = models.ImageField(upload_to="site/", null=True, blank=True)
    newsletter_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = "footer_settings"
        verbose_name = "Footer Settings"
        verbose_name_plural = "Footer Settings"

    def __str__(self):
        return "Footer Settings"


class ContactSettings(SingletonModel):
    """Contact-page specific configuration."""

    page_title = models.CharField(max_length=200, blank=True, default="Let's Build Together")
    page_subtitle = models.CharField(
        max_length=400, blank=True,
        default="Tell us about your project. We'll get back to you within 24 hours.",
    )
    response_time_text = models.CharField(
        max_length=200, blank=True, default="⚡ We respond within 24 hours"
    )
    response_time_desc = models.CharField(
        max_length=300, blank=True, default="For urgent inquiries, call us directly."
    )
    office_hours = models.CharField(
        max_length=200,
        blank=True,
        default="Mon – Fri · 9 AM – 6 PM (UTC+6)",
    )
    support_email = models.EmailField(blank=True, default="support@blackmarlinbd.com")
    sales_email = models.EmailField(blank=True, default="sales@blackmarlinbd.com")

    class Meta:
        db_table = "contact_settings"
        verbose_name = "Contact Settings"
        verbose_name_plural = "Contact Settings"

    def __str__(self):
        return "Contact Settings"
