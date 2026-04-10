from django.contrib import admin
from .models import Job, JobApplication


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "department", "type", "status", "is_featured", "application_count", "deadline")
    list_filter = ("status", "type", "experience", "is_featured")
    search_fields = ("title", "department")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "job", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("full_name", "email")
    raw_id_fields = ("job", "applicant")
