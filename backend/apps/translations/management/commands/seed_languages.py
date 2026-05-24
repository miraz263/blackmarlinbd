"""
Seed default languages and populate UITranslation table from JSON seed files.

Usage:
    python manage.py seed_languages
    python manage.py seed_languages --reset
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand

SEED_LANGUAGES = [
    {
        "code":        "en",
        "name":        "English",
        "native_name": "English",
        "direction":   "ltr",
        "is_active":   True,
        "is_default":  True,
        "order":       1,
    },
    {
        "code":        "bn",
        "name":        "Bangla",
        "native_name": "বাংলা",
        "direction":   "ltr",
        "is_active":   True,
        "is_default":  False,
        "order":       2,
    },
    {
        "code":        "ar",
        "name":        "Arabic",
        "native_name": "العربية",
        "direction":   "rtl",
        "is_active":   False,  # Prepared but inactive until content is ready
        "is_default":  False,
        "order":       3,
    },
]

# Path to the frontend i18n JSON files (relative to repo root)
FRONTEND_I18N_DIR = Path(__file__).resolve().parents[6] / "frontend" / "src" / "i18n"


class Command(BaseCommand):
    help = "Seed Language records and UITranslation table from frontend JSON files"

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete UI translations before seeding")

    def handle(self, *args, **options):
        from apps.translations.models import Language, UITranslation

        # Seed languages
        for data in SEED_LANGUAGES:
            lang, created = Language.objects.update_or_create(
                code=data["code"], defaults=data
            )
            self.stdout.write(
                f"{'Created' if created else 'Updated'} language: {lang.name} ({lang.code})"
            )

        # Seed UI translations from JSON files
        if options["reset"]:
            UITranslation.objects.all().delete()
            self.stdout.write("Cleared all UI translations.")

        total = 0
        for json_file in FRONTEND_I18N_DIR.glob("*.json"):
            lang_code = json_file.stem  # filename without extension
            try:
                strings = json.loads(json_file.read_text(encoding="utf-8"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Could not read {json_file}: {e}"))
                continue

            count = 0
            for key, value in strings.items():
                UITranslation.objects.update_or_create(
                    language=lang_code,
                    key=key,
                    defaults={"value": value},
                )
                count += 1
            total += count
            self.stdout.write(f"  Loaded {count} strings for [{lang_code}] from {json_file.name}")

        self.stdout.write(self.style.SUCCESS(f"Done. {total} UI strings seeded."))
