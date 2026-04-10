from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from taggit.managers import TaggableManager
from apps.core.models import TimeStampedModel

User = get_user_model()


class BlogCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "blog_categories"
        verbose_name_plural = "blog categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        SCHEDULED = "scheduled", "Scheduled"

    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True, blank=True, max_length=350)
    excerpt = models.CharField(max_length=500)
    content = models.TextField(help_text="Markdown supported")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="blog_posts")
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, related_name="posts")
    tags = TaggableManager(blank=True)
    cover_image = models.ImageField(upload_to="blog/covers/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    read_time = models.PositiveIntegerField(default=0, help_text="Minutes")
    views_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)

    class Meta:
        db_table = "blog_posts"
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["author", "status"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:350]
        if not self.read_time and self.content:
            word_count = len(self.content.split())
            self.read_time = max(1, word_count // 200)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def increment_views(self):
        BlogPost.objects.filter(pk=self.pk).update(views_count=models.F("views_count") + 1)


class Comment(TimeStampedModel):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")

    class Meta:
        db_table = "blog_comments"
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author} on {self.post}"
