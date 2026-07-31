"""
IP -> country -> language resolution for first-visit language suggestion.

Uses the free DB-IP Lite country database (see management command
`download_geoip`). Degrades to (None, None) whenever the database file is
missing or the IP can't be resolved — callers must treat that as "no
suggestion" rather than an error.
"""
from django.conf import settings

# Best-effort country -> language mapping. Only covers languages this project
# actually ships (see seed_languages.py); everything else falls back to the
# frontend's own default ("en").
COUNTRY_LANGUAGE_MAP = {
    # Arabic
    "AE": "ar", "SA": "ar", "EG": "ar", "QA": "ar", "KW": "ar", "BH": "ar",
    "OM": "ar", "JO": "ar", "IQ": "ar", "MA": "ar", "DZ": "ar", "TN": "ar",
    "LB": "ar", "LY": "ar", "YE": "ar", "SY": "ar",
    # Chinese
    "CN": "zh", "TW": "zh", "HK": "zh", "MO": "zh",
    # Bangla
    "BD": "bn",
    # French
    "FR": "fr", "BE": "fr", "CH": "fr", "CA": "fr", "SN": "fr", "CI": "fr",
    "ML": "fr", "MC": "fr", "LU": "fr", "TG": "fr", "BJ": "fr", "NE": "fr",
    # Spanish
    "ES": "es", "MX": "es", "AR": "es", "CO": "es", "CL": "es", "PE": "es",
    "VE": "es", "EC": "es", "GT": "es", "CU": "es", "DO": "es", "BO": "es",
    "UY": "es", "PY": "es", "CR": "es", "PA": "es", "SV": "es", "HN": "es",
    "NI": "es", "GQ": "es",
}


def get_client_ip(request) -> str:
    # X-Real-IP is set unconditionally by nginx to the actual TCP peer address
    # (proxy_set_header X-Real-IP $remote_addr) and can't be spoofed by the
    # client, unlike the first hop of X-Forwarded-For in a single-proxy setup
    # with no CDN in front. Prefer it; fall back to XFF/REMOTE_ADDR when nginx
    # isn't in the request path (e.g. local dev hitting Django directly).
    real_ip = request.META.get("HTTP_X_REAL_IP", "").strip()
    if real_ip:
        return real_ip
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def resolve_language_from_ip(ip: str, active_codes) -> tuple[str | None, str | None]:
    """Returns (language_code, country_code), either of which may be None."""
    if not ip:
        return None, None

    db_path = settings.GEOIP_COUNTRY_DB_PATH
    if not db_path.is_file():
        return None, None

    try:
        import geoip2.database
        import geoip2.errors

        with geoip2.database.Reader(str(db_path)) as reader:
            country = reader.country(ip).country.iso_code
    except Exception:
        return None, None

    if not country:
        return None, None

    lang = COUNTRY_LANGUAGE_MAP.get(country)
    if lang and lang in active_codes:
        return lang, country
    return None, country
