from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel

User = get_user_model()


class Job(TimeStampedModel):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"
        DRAFT = "draft", "Draft"

    class Type(models.TextChoices):
        FULL_TIME = "full_time", "Full Time"
        PART_TIME = "part_time", "Part Time"
        CONTRACT = "contract", "Contract"
        INTERNSHIP = "internship", "Internship"
        REMOTE = "remote", "Remote"

    class Experience(models.TextChoices):
        JUNIOR = "junior", "Junior (0–2 yrs)"
        MID = "mid", "Mid (3–5 yrs)"
        SENIOR = "senior", "Senior (5+ yrs)"
        LEAD = "lead", "Lead / Principal"

    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.FULL_TIME)
    experience = models.CharField(max_length=20, choices=Experience.choices, default=Experience.MID)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default="USD")
    description = models.TextField(help_text="Markdown supported")
    requirements = models.TextField(help_text="Markdown supported")
    benefits = models.TextField(blank=True)
    skills = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    deadline = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    application_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "jobs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "deadline"]),
            models.Index(fields=["type", "status"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.department})"


class JobApplication(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Review"
        REVIEWING = "reviewing", "Under Review"
        SHORTLISTED = "shortlisted", "Shortlisted"
        REJECTED = "rejected", "Rejected"
        HIRED = "hired", "Hired"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="applications")
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    resume = models.FileField(upload_to="resumes/")
    cover_letter = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "job_applications"
        ordering = ["-created_at"]
        unique_together = [["job", "email"]]

    def __str__(self):
        return f"{self.full_name} → {self.job.title}"
