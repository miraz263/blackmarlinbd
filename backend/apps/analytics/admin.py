from django.contrib import admin

from .models import DailySummary, PageView


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display  = ["path", "device_type", "session_key", "referrer", "created_at"]
    list_filter   = ["device_type", "created_at"]
    search_fields = ["path", "session_key", "referrer"]
    readonly_fields = [f.name for f in PageView._meta.fields]
    ordering      = ["-created_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(DailySummary)
class DailySummaryAdmin(admin.ModelAdmin):
    list_display = [
        "date", "page_views", "unique_visitors",
        "new_contacts", "job_applications", "blog_views",
    ]
    ordering     = ["-date"]
    readonly_fields = [f.name for f in DailySummary._meta.fields]
