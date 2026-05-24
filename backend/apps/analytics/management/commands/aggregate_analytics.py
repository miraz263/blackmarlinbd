"""
Aggregate yesterday's raw PageView rows into DailySummary.
Run daily via cron or Celery beat:
    python manage.py aggregate_analytics
    python manage.py aggregate_analytics --date 2025-01-15
"""
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db.models import Count


class Command(BaseCommand):
    help = "Aggregate raw page views into DailySummary for a given date"

    def add_arguments(self, parser):
        parser.add_argument(
            "--date",
            help="Date to aggregate (YYYY-MM-DD). Defaults to yesterday.",
        )

    def handle(self, *args, **options):
        from apps.analytics.models import DailySummary, PageView

        if options["date"]:
            target = date.fromisoformat(options["date"])
        else:
            target = date.today() - timedelta(days=1)

        self.stdout.write(f"Aggregating analytics for {target}…")

        qs = PageView.objects.filter(created_at__date=target)
        total_views   = qs.count()
        unique        = qs.values("session_key").distinct().count()
        blog_views    = qs.filter(path__startswith="/blog/").count()
        desktop       = qs.filter(device_type="desktop").count()
        mobile        = qs.filter(device_type="mobile").count()
        tablet        = qs.filter(device_type="tablet").count()

        new_contacts = 0
        try:
            from apps.contacts.models import Contact
            new_contacts = Contact.objects.filter(created_at__date=target).count()
        except Exception:
            pass

        job_apps = 0
        try:
            from apps.jobs.models import JobApplication
            job_apps = JobApplication.objects.filter(created_at__date=target).count()
        except Exception:
            pass

        summary, created = DailySummary.objects.update_or_create(
            date=target,
            defaults={
                "page_views":       total_views,
                "unique_visitors":  unique,
                "new_contacts":     new_contacts,
                "job_applications": job_apps,
                "blog_views":       blog_views,
                "desktop_views":    desktop,
                "mobile_views":     mobile,
                "tablet_views":     tablet,
            },
        )
        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} summary for {target}: {total_views} views, {unique} unique"
            )
        )
