from django.contrib import admin
from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "service", "status", "created_at")
    list_filter = ("status", "service")
    search_fields = ("name", "email", "subject")
    readonly_fields = ("ip_address", "created_at")
    ordering = ["-created_at"]
