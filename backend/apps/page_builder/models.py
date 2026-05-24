from django.db import models
from django.utils.text import slugify
from apps.core.models import TimeStampedModel

BLOCK_DEFAULTS = {
    "hero":     {"title": "New Hero Section", "subtitle": "", "description": "",
                 "cta_text": "Get Started", "cta_url": "/contact",
                 "cta_secondary_text": "", "cta_secondary_url": "", "background_image": None},
    "text":     {"heading": "", "body": "Enter your content here.", "alignment": "left"},
    "image":    {"src": "", "alt": "", "caption": "", "full_width": False},
    "video":    {"url": "", "thumbnail": "", "autoplay": False, "muted": True, "controls": True},
    "faq":      {"heading": "Frequently Asked Questions",
                 "items": [{"question": "What is your process?", "answer": "We start with a discovery phase."}]},
    "gallery":  {"heading": "", "images": [], "columns": 3},
    "stats":    {"heading": "",
                 "items": [{"label": "Projects", "value": "100+", "icon": "Zap"},
                           {"label": "Clients",  "value": "50+",  "icon": "Users"},
                           {"label": "Years",    "value": "10+",  "icon": "Award"}]},
    "team":     {"heading": "Our Team", "members": []},
    "services": {"heading": "Our Services", "description": "", "items": []},
}

SECTION_STYLE_DEFAULTS = {
    "background_color": "",
    "background_image": "",
    "padding": "md",
    "max_width": "xl",
    "text_color": "",
}


class Page(TimeStampedModel):
    title        = models.CharField(max_length=200)
    slug         = models.SlugField(unique=True, blank=True, max_length=220)
    description  = models.TextField(blank=True)
    is_published = models.BooleanField(default=False, db_index=True)
    meta         = models.JSONField(default=dict, blank=True,
                                    help_text="Extra page-level metadata (og image, etc.)")

    class Meta:
        db_table = "pb_pages"
        ordering = ["-created_at"]
        verbose_name = "Page"
        verbose_name_plural = "Pages"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title) or "untitled"
        super().save(*args, **kwargs)


class Section(TimeStampedModel):
    page         = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="sections")
    label        = models.CharField(max_length=100, blank=True,
                                    help_text="Internal label, e.g. 'Hero area'")
    order        = models.PositiveIntegerField(default=0, db_index=True)
    style_json   = models.JSONField(default=dict, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "pb_sections"
        ordering = ["order"]
        verbose_name = "Section"
        verbose_name_plural = "Sections"

    def __str__(self):
        return f"{self.page.title} / {self.label or f'Section {self.order + 1}'}"


class Block(TimeStampedModel):
    class BlockType(models.TextChoices):
        HERO     = "hero",     "Hero"
        TEXT     = "text",     "Text & Heading"
        IMAGE    = "image",    "Image"
        VIDEO    = "video",    "Video"
        FAQ      = "faq",      "FAQ"
        GALLERY  = "gallery",  "Gallery"
        STATS    = "stats",    "Stats"
        TEAM     = "team",     "Team"
        SERVICES = "services", "Services"

    section      = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="blocks")
    block_type   = models.CharField(max_length=20, choices=BlockType.choices, db_index=True)
    order        = models.PositiveIntegerField(default=0, db_index=True)
    content_json = models.JSONField(default=dict)
    style_json   = models.JSONField(default=dict, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "pb_blocks"
        ordering = ["order"]
        verbose_name = "Block"
        verbose_name_plural = "Blocks"

    def __str__(self):
        return f"{self.section} / {self.get_block_type_display()}"

    def save(self, *args, **kwargs):
        if not self.content_json:
            self.content_json = BLOCK_DEFAULTS.get(self.block_type, {})
        super().save(*args, **kwargs)
