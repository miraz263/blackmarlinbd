"""
Downloads high-quality themed thumbnails from Unsplash and attaches them
to the product showcase projects.
"""
import urllib.request
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from apps.projects.models import Project

# Specific Unsplash photo IDs chosen to match each product domain.
# Format: https://images.unsplash.com/photo-{ID}?w=1280&h=720&fit=crop&q=80
BASE = "https://images.unsplash.com/photo-"
PARAMS = "?w=1280&h=720&fit=crop&q=80"

THUMBNAILS = {
    # HR Manager — office professionals, HR management context
    "hr-manager-apex-textile": {
        "url": f"{BASE}1521791136064-7986c2920216{PARAMS}",
        "filename": "hr-manager-thumb.jpg",
    },
    # ERP — financial analytics, laptop with charts
    "erp-rahman-brothers": {
        "url": f"{BASE}1460925895917-afdab827c52f{PARAMS}",
        "filename": "erp-thumb.jpg",
    },
    # SchoolOS — classroom, students learning
    "schoolos-sunshine": {
        "url": f"{BASE}1580582932707-520aed937b7b{PARAMS}",
        "filename": "schoolos-thumb.jpg",
    },
    # RestoPOS — restaurant interior, service
    "restopos-urban-bites": {
        "url": f"{BASE}1414235077428-338989a2e8c0{PARAMS}",
        "filename": "restopos-thumb.jpg",
    },
    # Hospital ERP — doctor with patient, clinical setting
    "hospital-erp-comfort-care": {
        "url": f"{BASE}1576091160399-112ba8d25d1d{PARAMS}",
        "filename": "hospital-erp-thumb.jpg",
    },
    # MarketX — ecommerce, shopping online
    "marketx-shopbazaar": {
        "url": f"{BASE}1556742049-0cfed4f6a45d{PARAMS}",
        "filename": "marketx-thumb.jpg",
    },
    # LearnIQ LMS — online learning, laptop education
    "learniq-brightminds": {
        "url": f"{BASE}1522202176988-66273c2fd55f{PARAMS}",
        "filename": "learniq-thumb.jpg",
    },
    # TradeDesk OMS — trading screens, financial markets
    "tradedesk-pinnacle": {
        "url": f"{BASE}1611974789855-9c2a0a7236a3{PARAMS}",
        "filename": "tradedesk-thumb.jpg",
    },
    # Legacy demo projects
    "order-management-system": {
        "url": f"{BASE}1553413077-190dd305871c{PARAMS}",
        "filename": "oms-thumbnail.jpg",
    },
    "ai-fraud-detection-engine": {
        "url": f"{BASE}1504868584819-f8e8b4b6d7e3{PARAMS}",
        "filename": "fraud-thumbnail.jpg",
    },
    "multi-tenant-saas-dashboard": {
        "url": f"{BASE}1551288049-bebda4e38f71{PARAMS}",
        "filename": "saas-thumbnail.jpg",
    },
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


class Command(BaseCommand):
    help = "Download Unsplash thumbnails for all showcase projects (overwrites existing)"

    def add_arguments(self, parser):
        parser.add_argument("--overwrite", action="store_true", help="Overwrite existing thumbnails")

    def handle(self, *args, **options):
        overwrite = options["overwrite"]
        ok = 0
        skip = 0
        fail = 0

        for slug, cfg in THUMBNAILS.items():
            try:
                project = Project.objects.get(slug=slug)
            except Project.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"  Not found: {slug}"))
                skip += 1
                continue

            if project.thumbnail and not overwrite:
                self.stdout.write(self.style.WARNING(f"  Skip (has thumb): {slug} — use --overwrite to replace"))
                skip += 1
                continue

            self.stdout.write(f"  Downloading {slug} …")
            try:
                req = urllib.request.Request(cfg["url"], headers=HEADERS)
                with urllib.request.urlopen(req, timeout=30) as resp:
                    image_data = resp.read()

                if project.thumbnail:
                    project.thumbnail.delete(save=False)

                project.thumbnail.save(cfg["filename"], ContentFile(image_data), save=True)
                size_kb = len(image_data) // 1024
                self.stdout.write(self.style.SUCCESS(f"    ✓ {project.thumbnail.name} ({size_kb} KB)"))
                ok += 1
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"    ✗ {exc}"))
                fail += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone — {ok} downloaded, {skip} skipped, {fail} failed."
        ))
