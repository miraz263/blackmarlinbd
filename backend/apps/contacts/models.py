from django.db import models
from apps.core.models import TimeStampedModel


class Contact(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        SPAM = "spam", "Spam"

    class ServiceType(models.TextChoices):
        AI_ML = "ai_ml", "AI & Machine Learning"
        FINANCIAL = "financial", "Financial Systems"
        CLOUD = "cloud", "Cloud & DevOps"
        WEB_MOBILE = "web_mobile", "Web & Mobile"
        CYBERSECURITY = "cybersecurity", "Cybersecurity"
        OTHER = "other", "Other"

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=200, blank=True)
    service = models.CharField(max_length=20, choices=ServiceType.choices, default=ServiceType.OTHER)
    subject = models.CharField(max_length=300)
    message = models.TextField()
    budget = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Internal notes")

    class Meta:
        db_table = "contacts"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self):
        return f"{self.name} <{self.email}> - {self.subject[:50]}"
