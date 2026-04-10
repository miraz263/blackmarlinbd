from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, NewsletterSubscriber


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "is_active", "is_staff", "date_joined")
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-date_joined",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Profile", {"fields": ("avatar", "bio", "role", "is_newsletter_subscribed")}),
    )


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "confirmed_at", "created_at")
    list_filter = ("is_active",)
    search_fields = ("email",)
