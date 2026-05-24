from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import SiteSettings, FooterSettings, ContactSettings
from .serializers import (
    SiteSettingsSerializer,
    FooterSettingsSerializer,
    ContactSettingsSerializer,
)


class _SingletonRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """
    Base view for singleton resources.
    GET  — public (AllowAny)
    PATCH — admin only (IsAdminUser)
    PUT is intentionally excluded.
    """

    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_object(self):
        # Always operates on the single row (pk=1).
        return self.model.load()


class SiteSettingsView(_SingletonRetrieveUpdateView):
    model = SiteSettings
    serializer_class = SiteSettingsSerializer
    # Accept both JSON (field edits) and multipart (logo / favicon upload)
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class FooterSettingsView(_SingletonRetrieveUpdateView):
    model = FooterSettings
    serializer_class = FooterSettingsSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class ContactSettingsView(_SingletonRetrieveUpdateView):
    model = ContactSettings
    serializer_class = ContactSettingsSerializer
    parser_classes = [JSONParser]
