"""
Download the free DB-IP Lite country database used for first-visit language
suggestion (see apps.translations.geo). Safe to run repeatedly; skipped
gracefully (non-fatal) if there's no network access, e.g. fully offline dev.

Usage:
    python manage.py download_geoip
"""
import gzip
import shutil
import urllib.error
import urllib.request
from datetime import date, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand

URL_TEMPLATE = "https://download.db-ip.com/free/dbip-country-lite-{yyyy_mm}.mmdb.gz"


class Command(BaseCommand):
    help = "Download the DB-IP Lite country GeoIP database for language auto-detection"

    def handle(self, *args, **options):
        dest = settings.GEOIP_COUNTRY_DB_PATH
        dest.parent.mkdir(parents=True, exist_ok=True)

        today = date.today()
        # DB-IP publishes on the 1st of each month; the current month's file
        # may not be up yet in the first few days, so fall back to last month.
        candidates = [today, (today.replace(day=1) - timedelta(days=1))]

        for month in candidates:
            url = URL_TEMPLATE.format(yyyy_mm=month.strftime("%Y-%m"))
            request = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
            try:
                with urllib.request.urlopen(request, timeout=15) as resp:
                    with gzip.GzipFile(fileobj=resp) as gz, open(dest, "wb") as out:
                        shutil.copyfileobj(gz, out)
                self.stdout.write(self.style.SUCCESS(f"GeoIP database saved to {dest} (from {url})"))
                return
            except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
                self.stdout.write(self.style.WARNING(f"Could not fetch {url}: {e}"))

        self.stdout.write(self.style.WARNING(
            "GeoIP database download failed for all candidate months. "
            "Geo-based language suggestion will be disabled until this succeeds."
        ))
