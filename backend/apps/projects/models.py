from django.db import models
from django.utils.text import slugify
from taggit.managers import TaggableManager
from apps.core.models import TimeStampedModel


class Category(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # lucide icon name
    color = models.CharField(max_length=7, default="#6366f1")  # hex color

    class Meta:
        db_table = "project_categories"
        verbose_name_plural = "categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Project(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    short_description = models.CharField(max_length=300)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="projects")
    tags = TaggableManager(blank=True)
    tech_stack = models.JSONField(default=list, help_text='["React", "Django", ...]')
    thumbnail = models.ImageField(upload_to="projects/thumbnails/", null=True, blank=True)
    demo_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    case_study_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    order = models.PositiveIntegerField(default=0)
    client_name = models.CharField(max_length=200, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "projects"
        ordering = ["order", "-created_at"]
        indexes = [
            models.Index(fields=["status", "is_featured"]),
            models.Index(fields=["category", "status"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def increment_views(self):
        Project.objects.filter(pk=self.pk).update(views_count=models.F("views_count") + 1)


class ProjectImage(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="projects/gallery/")
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "project_images"
        ordering = ["order"]
