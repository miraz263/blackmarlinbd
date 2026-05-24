from django.db import models


class DeviceType(models.TextChoices):
    DESKTOP = "desktop", "Desktop"
    MOBILE  = "mobile",  "Mobile"
    TABLET  = "tablet",  "Tablet"


class PageView(models.Model):
    path        = models.CharField(max_length=500, db_index=True)
    session_key = models.CharField(max_length=64, db_index=True)
    ip_hash     = models.CharField(max_length=64, blank=True)
    device_type = models.CharField(
        max_length=10, choices=DeviceType.choices, default=DeviceType.DESKTOP
    )
    referrer   = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "analytics_page_views"
        indexes = [
            models.Index(fields=["created_at", "path"],        name="analytics_pv_date_path_idx"),
            models.Index(fields=["session_key", "created_at"], name="analytics_pv_sess_date_idx"),
            models.Index(fields=["device_type", "created_at"], name="analytics_pv_dev_date_idx"),
        ]

    def __str__(self):
        return f"{self.path} @ {self.created_at:%Y-%m-%d %H:%M}"


class DailySummary(models.Model):
    """Pre-aggregated daily stats — populated by aggregate_analytics command."""
    date            = models.DateField(unique=True, db_index=True)
    page_views      = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)
    new_contacts    = models.PositiveIntegerField(default=0)
    job_applications = models.PositiveIntegerField(default=0)
    blog_views      = models.PositiveIntegerField(default=0)
    desktop_views   = models.PositiveIntegerField(default=0)
    mobile_views    = models.PositiveIntegerField(default=0)
    tablet_views    = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "analytics_daily_summaries"
        ordering = ["-date"]

    def __str__(self):
        return f"Summary {self.date}: {self.page_views} views"
