"""
Downloads placeholder thumbnails from picsum.photos and attaches them
to the seeded demo projects.
"""
import os
import urllib.request
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from apps.projects.models import Project

# picsum IDs chosen to match the project themes
THUMBNAILS = {
    "order-management-system": {
        "url": "https://picsum.photos/seed/oms-dashboard/1280/720",
        "filename": "oms-thumbnail.jpg",
    },
    "ai-fraud-detection-engine": {
        "url": "https://picsum.photos/seed/ai-fraud/1280/720",
        "filename": "fraud-thumbnail.jpg",
    },
    "multi-tenant-saas-dashboard": {
        "url": "https://picsum.photos/seed/saas-dash/1280/720",
        "filename": "saas-thumbnail.jpg",
    },
}


class Command(BaseCommand):
    help = "Download and attach demo thumbnails to seeded projects"

    def handle(self, *args, **options):
        for slug, cfg in THUMBNAILS.items():
            try:
                project = Project.objects.get(slug=slug)
            except Project.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Project not found: {slug}"))
                continue

            if project.thumbnail:
                self.stdout.write(self.style.WARNING(f"Already has thumbnail: {slug}"))
                continue

            self.stdout.write(f"Downloading thumbnail for {slug}...")
            try:
                req = urllib.request.Request(
                    cfg["url"],
                    headers={"User-Agent": "BlackMarlinBD/1.0"},
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    image_data = resp.read()

                project.thumbnail.save(
                    cfg["filename"],
                    ContentFile(image_data),
                    save=True,
                )
                self.stdout.write(self.style.SUCCESS(f"  Saved: {project.thumbnail.name}"))
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"  Failed: {exc}"))

        self.stdout.write(self.style.SUCCESS("\nDone."))
