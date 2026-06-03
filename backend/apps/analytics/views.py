import csv
import hashlib
from datetime import date, timedelta
from io import StringIO

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.rbac.permissions import rbac_permission

from .middleware import _detect_device, _get_ip, _is_bot
from .models import PageView


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _parse_range(request) -> tuple[int, date]:
    raw = request.query_params.get("range", "7d")
    try:
        days = int(raw.rstrip("d"))
    except ValueError:
        days = 7
    days = max(1, min(days, 365))
    return days, date.today()


def _pct_change(curr: int, prev: int) -> float:
    if prev == 0:
        return 100.0 if curr > 0 else 0.0
    return round((curr - prev) / prev * 100, 1)


def _contact_counts(start: date, end: date) -> int:
    try:
        from apps.contacts.models import Contact
        return Contact.objects.filter(created_at__date__gte=start, created_at__date__lte=end).count()
    except Exception:
        return 0


def _job_app_counts(start: date, end: date) -> int:
    try:
        from apps.jobs.models import JobApplication
        return JobApplication.objects.filter(created_at__date__gte=start, created_at__date__lte=end).count()
    except Exception:
        return 0


# ─── Views ────────────────────────────────────────────────────────────────────

class OverviewView(APIView):
    """Key metrics for the selected range vs. the same-length prior period."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        days, today = _parse_range(request)
        start      = today - timedelta(days=days - 1)
        prev_start = start - timedelta(days=days)
        prev_end   = start - timedelta(days=1)

        curr_qs = PageView.objects.filter(created_at__date__gte=start, created_at__date__lte=today)
        prev_qs = PageView.objects.filter(created_at__date__gte=prev_start, created_at__date__lte=prev_end)

        curr_pv = curr_qs.count()
        prev_pv = prev_qs.count()
        curr_uv = curr_qs.values("session_key").distinct().count()
        prev_uv = prev_qs.values("session_key").distinct().count()

        curr_blog = curr_qs.filter(path__startswith="/blog/").count()
        prev_blog = prev_qs.filter(path__startswith="/blog/").count()

        curr_contacts = _contact_counts(start, today)
        prev_contacts = _contact_counts(prev_start, prev_end)
        curr_jobs     = _job_app_counts(start, today)
        prev_jobs     = _job_app_counts(prev_start, prev_end)

        return Response({
            "page_views":              curr_pv,
            "page_views_change":       _pct_change(curr_pv, prev_pv),
            "unique_visitors":         curr_uv,
            "unique_visitors_change":  _pct_change(curr_uv, prev_uv),
            "blog_views":              curr_blog,
            "blog_views_change":       _pct_change(curr_blog, prev_blog),
            "new_contacts":            curr_contacts,
            "new_contacts_change":     _pct_change(curr_contacts, prev_contacts),
            "job_applications":        curr_jobs,
            "job_applications_change": _pct_change(curr_jobs, prev_jobs),
        })


class ChartView(APIView):
    """Time-series data: page views + unique visitors per day."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        days, today = _parse_range(request)
        start = today - timedelta(days=days - 1)
        date_list = [start + timedelta(days=i) for i in range(days)]

        rows = (
            PageView.objects
            .filter(created_at__date__gte=start)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(views=Count("id"), unique=Count("session_key", distinct=True))
        )
        by_day = {row["day"]: row for row in rows}

        def fmt_label(d: date) -> str:
            if days <= 14:
                return d.strftime("%b %d")
            if days <= 60:
                return d.strftime("%b %d")
            return d.strftime("%b %d")

        return Response({
            "labels":   [fmt_label(d) for d in date_list],
            "views":    [by_day.get(d, {}).get("views", 0)  for d in date_list],
            "visitors": [by_day.get(d, {}).get("unique", 0) for d in date_list],
        })


class TopPagesView(APIView):
    """Most-visited paths in the selected range."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        days, today = _parse_range(request)
        start = today - timedelta(days=days - 1)

        rows = (
            PageView.objects
            .filter(created_at__date__gte=start)
            .values("path")
            .annotate(views=Count("id"), unique=Count("session_key", distinct=True))
            .order_by("-views")[:20]
        )
        return Response(list(rows))


class DevicesView(APIView):
    """Device-type breakdown for the selected range."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        days, today = _parse_range(request)
        start = today - timedelta(days=days - 1)

        rows = (
            PageView.objects
            .filter(created_at__date__gte=start)
            .values("device_type")
            .annotate(count=Count("id"))
        )
        result = {"desktop": 0, "mobile": 0, "tablet": 0}
        for row in rows:
            result[row["device_type"]] = row["count"]
        return Response(result)


class ReferrersView(APIView):
    """Top referrer domains for the selected range."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        days, today = _parse_range(request)
        start = today - timedelta(days=days - 1)

        rows = (
            PageView.objects
            .filter(created_at__date__gte=start)
            .exclude(referrer="")
            .values("referrer")
            .annotate(count=Count("id"))
            .order_by("-count")[:15]
        )

        def domain(url: str) -> str:
            try:
                from urllib.parse import urlparse
                d = urlparse(url).netloc
                return d.replace("www.", "") or url[:50]
            except Exception:
                return url[:50]

        # Collapse by domain
        seen: dict[str, int] = {}
        for row in rows:
            d = domain(row["referrer"])
            seen[d] = seen.get(d, 0) + row["count"]

        sorted_refs = sorted(seen.items(), key=lambda x: -x[1])[:10]
        return Response([{"referrer": k, "count": v} for k, v in sorted_refs])


class CollectView(APIView):
    """SPA client-side tracking endpoint — unauthenticated, low-overhead."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "analytics_collect"

    def post(self, request):
        ua = request.META.get("HTTP_USER_AGENT", "")
        if _is_bot(ua):
            return Response({"ok": True})

        path     = (request.data.get("path") or "/")[:500]
        referrer = (request.data.get("referrer") or "")[:500]

        ip      = _get_ip(request)
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()[:32]

        if not request.session.session_key:
            request.session.create()
        session_key = request.session.session_key or ip_hash

        PageView.objects.create(
            path=path,
            session_key=session_key,
            ip_hash=ip_hash,
            device_type=_detect_device(ua),
            referrer=referrer,
        )
        return Response({"ok": True})


class ExportCSVView(APIView):
    """Download daily analytics data as CSV."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        days, today = _parse_range(request)
        start = today - timedelta(days=days - 1)
        date_list = [start + timedelta(days=i) for i in range(days)]

        pv_rows = (
            PageView.objects
            .filter(created_at__date__gte=start)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(views=Count("id"), unique=Count("session_key", distinct=True))
        )
        pv_map = {row["day"]: row for row in pv_rows}

        blog_rows = (
            PageView.objects
            .filter(created_at__date__gte=start, path__startswith="/blog/")
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
        )
        blog_map = {row["day"]: row["count"] for row in blog_rows}

        contact_rows = {}
        try:
            from apps.contacts.models import Contact
            for row in (
                Contact.objects
                .filter(created_at__date__gte=start)
                .annotate(day=TruncDate("created_at"))
                .values("day")
                .annotate(count=Count("id"))
            ):
                contact_rows[row["day"]] = row["count"]
        except Exception:
            pass

        job_rows = {}
        try:
            from apps.jobs.models import JobApplication
            for row in (
                JobApplication.objects
                .filter(created_at__date__gte=start)
                .annotate(day=TruncDate("created_at"))
                .values("day")
                .annotate(count=Count("id"))
            ):
                job_rows[row["day"]] = row["count"]
        except Exception:
            pass

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["Date", "Page Views", "Unique Visitors", "Blog Views", "New Contacts", "Job Applications"])

        for d in date_list:
            row = pv_map.get(d, {})
            writer.writerow([
                d.strftime("%Y-%m-%d"),
                row.get("views", 0),
                row.get("unique", 0),
                blog_map.get(d, 0),
                contact_rows.get(d, 0),
                job_rows.get(d, 0),
            ])

        response = HttpResponse(output.getvalue(), content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="analytics_{days}d.csv"'
        return response


class StatsLiveView(APIView):
    """Real-time counts for the last 24 h (for the overview cards auto-refresh)."""
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta as td
        cutoff = timezone.now() - td(hours=24)
        pv = PageView.objects.filter(created_at__gte=cutoff)
        return Response({
            "views_24h":    pv.count(),
            "visitors_24h": pv.values("session_key").distinct().count(),
        })
