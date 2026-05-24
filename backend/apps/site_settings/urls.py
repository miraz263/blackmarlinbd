from django.urls import path
from . import views

urlpatterns = [
    path("settings/", views.SiteSettingsView.as_view(), name="site-settings"),
    path("footer/", views.FooterSettingsView.as_view(), name="site-footer"),
    path("contact/", views.ContactSettingsView.as_view(), name="site-contact"),
]
