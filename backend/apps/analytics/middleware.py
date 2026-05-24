import hashlib

_BOT_TOKENS = frozenset(
    ["bot", "crawler", "spider", "headless", "phantom", "selenium", "scrapy", "wget", "curl"]
)
_IGNORE_PREFIXES = ("/admin", "/api", "/static", "/media", "/__")


def _is_bot(ua: str) -> bool:
    ua_lower = ua.lower()
    return any(token in ua_lower for token in _BOT_TOKENS)


def _detect_device(ua: str) -> str:
    ua_lower = ua.lower()
    if any(x in ua_lower for x in ("iphone", "android", "mobile", "blackberry", "windows phone")):
        return "mobile"
    if any(x in ua_lower for x in ("ipad", "tablet")):
        return "tablet"
    return "desktop"


def _get_ip(request) -> str:
    xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


class PageViewMiddleware:
    """Records a PageView row for every non-bot, non-API, 200-OK request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code != 200:
            return response

        path = request.path
        if any(path.startswith(p) for p in _IGNORE_PREFIXES):
            return response

        ua = request.META.get("HTTP_USER_AGENT", "")
        if _is_bot(ua):
            return response

        try:
            from .models import PageView

            ip      = _get_ip(request)
            ip_hash = hashlib.sha256(ip.encode()).hexdigest()[:32]

            if not request.session.session_key:
                request.session.create()
            session_key = request.session.session_key or ip_hash

            PageView.objects.create(
                path=path[:500],
                session_key=session_key,
                ip_hash=ip_hash,
                device_type=_detect_device(ua),
                referrer=request.META.get("HTTP_REFERER", "")[:500],
            )
        except Exception:
            pass  # Never block a request

        return response
