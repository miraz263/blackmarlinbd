"""
LanguageMiddleware — sets request.LANGUAGE from:
  1. ?lang= query param  (highest priority)
  2. X-Language header
  3. Accept-Language header (first tag)
  4. Default: "en"

Only accepts codes registered in the Language table (or FALLBACK_CODES).
"""

FALLBACK_CODES = {"en", "bn", "ar"}
DEFAULT_LANG = "en"


def _resolve_lang(request) -> str:
    # 1. Explicit query param
    param = request.GET.get("lang", "").strip()[:10]
    if param:
        return param

    # 2. Custom header
    header = request.META.get("HTTP_X_LANGUAGE", "").strip()[:10]
    if header:
        return header

    # 3. Accept-Language (take first tag, strip region e.g. "en-US" → "en")
    accept = request.META.get("HTTP_ACCEPT_LANGUAGE", "")
    if accept:
        first = accept.split(",")[0].strip().split(";")[0].strip()
        code = first.split("-")[0].lower()
        if code:
            return code

    return DEFAULT_LANG


class LanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self._active_codes: set[str] | None = None

    def _get_active_codes(self) -> set[str]:
        if self._active_codes is None:
            try:
                from .models import Language
                codes = set(Language.objects.filter(is_active=True).values_list("code", flat=True))
                self._active_codes = codes or FALLBACK_CODES
            except Exception:
                self._active_codes = FALLBACK_CODES
        return self._active_codes

    def __call__(self, request):
        code = _resolve_lang(request)
        active = self._get_active_codes()
        request.LANGUAGE = code if code in active else DEFAULT_LANG
        response = self.get_response(request)
        response["X-Language"] = request.LANGUAGE
        return response
