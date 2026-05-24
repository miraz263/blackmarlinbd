from django.db import models
from apps.core.models import TimeStampedModel


class SEOPage(TimeStampedModel):
    """
    CMS-editable SEO settings keyed by page identifier.

    Standard keys: home, about, services, blog, projects, careers, contact
    Per-service:   service-<slug>   e.g. service-ai-ml
    Per-post:      post-<slug>
    Per-project:   project-<slug>
    """

    class TwitterCard(models.TextChoices):
        SUMMARY             = "summary",             "Summary"
        SUMMARY_LARGE_IMAGE = "summary_large_image", "Summary Large Image"

    page_key         = models.CharField(
        max_length=200, unique=True, db_index=True,
        help_text="Unique page identifier, e.g. 'home', 'about', 'service-ai-ml'",
    )
    meta_title       = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(max_length=500, blank=True)
    keywords         = models.CharField(
        max_length=500, blank=True,
        help_text="Comma-separated keywords",
    )
    canonical_url    = models.URLField(blank=True)
    og_title         = models.CharField(
        max_length=200, blank=True,
        help_text="Defaults to meta_title when blank",
    )
    og_description   = models.TextField(
        max_length=500, blank=True,
        help_text="Defaults to meta_description when blank",
    )
    og_image         = models.ImageField(
        upload_to="seo/og/", null=True, blank=True,
        help_text="Recommended: 1200×630 px",
    )
    og_type          = models.CharField(max_length=50, default="website")
    twitter_card     = models.CharField(
        max_length=30, choices=TwitterCard.choices,
        default=TwitterCard.SUMMARY_LARGE_IMAGE,
    )
    schema_json      = models.JSONField(
        null=True, blank=True,
        help_text="JSON-LD structured data object (without the <script> wrapper)",
    )
    no_index         = models.BooleanField(
        default=False,
        help_text="Add noindex,nofollow robots meta when True",
    )

    class Meta:
        db_table = "seo_pages"
        ordering = ["page_key"]
        verbose_name = "SEO Page"
        verbose_name_plural = "SEO Pages"

    def __str__(self):
        return self.page_key

    @property
    def resolved_og_title(self):
        return self.og_title or self.meta_title

    @property
    def resolved_og_description(self):
        return self.og_description or self.meta_description
