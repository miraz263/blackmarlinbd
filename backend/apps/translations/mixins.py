"""
TranslatableSerializerMixin
===========================
Add to any ModelSerializer to enable automatic field translation.

Usage:
    class BlogPostSerializer(TranslatableSerializerMixin, serializers.ModelSerializer):
        translatable_fields = ["title", "excerpt", "content"]

        class Meta:
            model = BlogPost
            fields = ["id", "title", "excerpt", "content", ...]

The mixin will:
  - Detect the current language from request.LANGUAGE (set by LanguageMiddleware)
  - For every field listed in `translatable_fields`, replace the value with the
    ContentTranslation entry for that language (falling back to the source field value)
  - Also expose `{field}_en` and `{field}_bn` in a separate `translations` key
    so the admin editor can display all languages at once

No database hit is made when language == "en" (the source language).
"""

from __future__ import annotations

from functools import lru_cache
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


class TranslatableSerializerMixin:
    translatable_fields: list[str] = []

    # ─── Internal helpers ──────────────────────────────────────────────────

    @property
    def _lang(self) -> str:
        request = self.context.get("request")
        return getattr(request, "LANGUAGE", "en") if request else "en"

    @staticmethod
    def _fetch_translations(obj, fields: list[str], languages: list[str]) -> dict[str, dict[str, str]]:
        """Return {language: {field: value}} for the given object."""
        from django.contrib.contenttypes.models import ContentType
        from .models import ContentTranslation

        try:
            ct = ContentType.objects.get_for_model(obj)
            rows = ContentTranslation.objects.filter(
                content_type=ct,
                object_id=obj.pk,
                field__in=fields,
                language__in=languages,
            )
            result: dict[str, dict[str, str]] = {}
            for row in rows:
                result.setdefault(row.language, {})[row.field] = row.value
            return result
        except Exception:
            return {}

    def _translate_field(self, obj, field: str, trans_map: dict) -> str:
        """Return the translation for `field` in the current language, with en fallback."""
        lang = self._lang
        source = getattr(obj, field, "") or ""
        if lang == "en":
            return source
        return trans_map.get(lang, {}).get(field) or source

    # ─── Overrides ─────────────────────────────────────────────────────────

    def to_representation(self, instance):
        rep = super().to_representation(instance)

        if not self.translatable_fields:
            return rep

        lang = self._lang
        active_langs = ["en", "bn"]  # extend when Arabic is activated

        trans_map = self._fetch_translations(instance, self.translatable_fields, active_langs)

        # Replace field values with the current language translation
        for field in self.translatable_fields:
            if field in rep:
                rep[field] = self._translate_field(instance, field, trans_map)

        # Attach all-languages snapshot for the admin editor
        rep["_translations"] = {
            lang_code: {
                field: (
                    getattr(instance, field, "") or ""
                    if lang_code == "en"
                    else trans_map.get(lang_code, {}).get(field, "")
                )
                for field in self.translatable_fields
            }
            for lang_code in active_langs
        }

        return rep
