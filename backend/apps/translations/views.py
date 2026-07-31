from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rbac.permissions import rbac_permission

from .geo import get_client_ip, resolve_language_from_ip
from .middleware import FALLBACK_CODES
from .models import ContentTranslation, Language, UITranslation
from .registry import TRANSLATABLE_MODELS, get_translatable_field_names, is_long_field
from .serializers import (
    ContentTranslationSerializer,
    LanguageSerializer,
    LanguageWriteSerializer,
    UITranslationSerializer,
)


# ─── Languages ───────────────────────────────────────────────────────────────


class GeoLanguageView(APIView):
    """Public — best-effort language suggestion based on visitor IP.

    Intended for a one-time check on first visit only: the frontend must
    never let this override an explicit user choice, only seed the initial
    default for a brand-new visitor.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        active = set(Language.objects.filter(is_active=True).values_list("code", flat=True)) or FALLBACK_CODES
        ip = get_client_ip(request)
        language, country = resolve_language_from_ip(ip, active)
        return Response({"language": language, "country": country})


class LanguageListView(APIView):
    """Public — list active languages."""
    permission_classes = [AllowAny]

    def get(self, request):
        langs = Language.objects.filter(is_active=True).order_by("order")
        return Response(LanguageSerializer(langs, many=True).data)

    def post(self, request):
        if not (request.user.is_authenticated and (request.user.is_superuser or getattr(request.user, "is_admin", False))):
            return Response(status=403)
        ser = LanguageWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        lang = ser.save()
        return Response(LanguageSerializer(lang).data, status=201)


class LanguageDetailView(APIView):
    permission_classes = [rbac_permission("site_settings", "edit")]

    def _get(self, code):
        try:
            return Language.objects.get(code=code)
        except Language.DoesNotExist:
            return None

    def put(self, request, code):
        lang = self._get(code)
        if not lang:
            return Response(status=404)
        ser = LanguageWriteSerializer(lang, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(LanguageSerializer(lang).data)

    def delete(self, request, code):
        lang = self._get(code)
        if not lang:
            return Response(status=404)
        if lang.is_default:
            return Response({"error": "Cannot delete the default language"}, status=400)
        lang.delete()
        return Response(status=204)


# ─── UI Translations ─────────────────────────────────────────────────────────


class UITranslationPublicView(APIView):
    """Public — returns all UI strings for a language as a flat key→value dict."""
    permission_classes = [AllowAny]

    def get(self, request, lang):
        strings = UITranslation.objects.filter(language=lang)
        return Response({s.key: s.value for s in strings})


class UITranslationAdminView(APIView):
    """Admin — CRUD for UI strings. Returns paginated list per language."""
    permission_classes = [rbac_permission("site_settings", "edit")]

    def get(self, request):
        lang = request.query_params.get("lang", "en")
        strings = UITranslation.objects.filter(language=lang).order_by("key")
        return Response(UITranslationSerializer(strings, many=True).data)

    def post(self, request):
        """Upsert a single key."""
        ser = UITranslationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj, _ = UITranslation.objects.update_or_create(
            language=ser.validated_data["language"],
            key=ser.validated_data["key"],
            defaults={"value": ser.validated_data["value"]},
        )
        return Response(UITranslationSerializer(obj).data)

    def put(self, request):
        """Bulk upsert — accepts a list of {language, key, value} objects."""
        items = request.data if isinstance(request.data, list) else []
        saved = 0
        for item in items:
            if "language" in item and "key" in item and "value" in item:
                UITranslation.objects.update_or_create(
                    language=item["language"],
                    key=item["key"],
                    defaults={"value": item["value"]},
                )
                saved += 1
        return Response({"saved": saved})

    def delete(self, request):
        lang = request.data.get("language")
        key  = request.data.get("key")
        if not lang or not key:
            return Response({"error": "language and key required"}, status=400)
        UITranslation.objects.filter(language=lang, key=key).delete()
        return Response(status=204)


# ─── Content Translations ─────────────────────────────────────────────────────


class ContentTranslationView(APIView):
    """Get / save translations for a single content object."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        app_label  = request.query_params.get("app_label", "")
        model_name = request.query_params.get("model_name", "")
        object_id  = request.query_params.get("object_id")

        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name.lower())
        except ContentType.DoesNotExist:
            return Response({"error": "Unknown content type"}, status=400)

        rows = ContentTranslation.objects.filter(content_type=ct, object_id=object_id)

        # {language: {field: value}}
        result: dict[str, dict[str, str]] = {}
        for row in rows:
            result.setdefault(row.language, {})[row.field] = row.value

        # Also include English source values
        fields = get_translatable_field_names(app_label, model_name)
        try:
            obj = ct.get_object_for_this_type(pk=object_id)
            result["en"] = {f: getattr(obj, f, "") or "" for f in fields}
        except Exception:
            pass

        return Response(result)

    def post(self, request):
        """Save translations for one language at a time.
        Body: { app_label, model_name, object_id, language, fields: {field: value} }
        """
        app_label  = request.data.get("app_label", "")
        model_name = request.data.get("model_name", "")
        object_id  = request.data.get("object_id")
        language   = request.data.get("language", "")
        fields     = request.data.get("fields", {})

        if not all([app_label, model_name, object_id, language, fields]):
            return Response({"error": "app_label, model_name, object_id, language, fields required"}, status=400)

        if language == "en":
            return Response({"error": "Edit English directly in the content editor"}, status=400)

        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name.lower())
        except ContentType.DoesNotExist:
            return Response({"error": "Unknown content type"}, status=400)

        allowed_fields = set(get_translatable_field_names(app_label, model_name))
        saved = []
        for field, value in fields.items():
            if field not in allowed_fields:
                continue
            ContentTranslation.objects.update_or_create(
                content_type=ct,
                object_id=object_id,
                field=field,
                language=language,
                defaults={"value": value or ""},
            )
            saved.append(field)

        return Response({"saved": saved})


class TranslatableModelListView(APIView):
    """List all registered translatable content types."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        result = []
        for key, fields in TRANSLATABLE_MODELS.items():
            app_label, model_name = key.split(".", 1)
            try:
                ct = ContentType.objects.get(app_label=app_label, model=model_name.lower())
                label = ct.name.replace("_", " ").title()
            except ContentType.DoesNotExist:
                label = model_name
            result.append({
                "key":        key,
                "app_label":  app_label,
                "model_name": model_name,
                "label":      label,
                "fields":     [{"name": f, "long": is_long_field(f)} for f in fields],
            })
        return Response(result)


class TranslatableObjectListView(APIView):
    """List objects of a translatable model with their translation completeness."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        app_label  = request.query_params.get("app_label", "")
        model_name = request.query_params.get("model_name", "")

        fields = get_translatable_field_names(app_label, model_name)
        if not fields:
            return Response({"error": "Not a registered translatable model"}, status=400)

        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name.lower())
        except ContentType.DoesNotExist:
            return Response({"error": "Content type not found"}, status=400)

        Model = ct.model_class()
        if Model is None:
            return Response({"error": "Model class not available"}, status=400)

        objects = Model.objects.order_by("-pk")[:100]

        trans_counts = {}
        for row in ContentTranslation.objects.filter(
            content_type=ct,
            object_id__in=[o.pk for o in objects],
        ).values("object_id", "language").distinct():
            trans_counts.setdefault(row["object_id"], set()).add(row["language"])

        result = []
        for obj in objects:
            langs_done = trans_counts.get(obj.pk, set())
            result.append({
                "id":     obj.pk,
                "title":  (
                    getattr(obj, "title", None)
                    or getattr(obj, "name", None)
                    or f"#{obj.pk}"
                ),
                "translated_languages": sorted(langs_done),
            })

        return Response({"fields": fields, "objects": result})
