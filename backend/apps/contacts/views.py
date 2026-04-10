from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Contact
from .serializers import ContactCreateSerializer, ContactSerializer
from .tasks import send_contact_notification


class ContactThrottle(AnonRateThrottle):
    scope = "contact"


class ContactCreateView(generics.CreateAPIView):
    serializer_class = ContactCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ContactThrottle]

    def perform_create(self, serializer):
        ip = self.request.META.get("HTTP_X_FORWARDED_FOR")
        if ip:
            ip = ip.split(",")[0].strip()
        else:
            ip = self.request.META.get("REMOTE_ADDR")
        contact = serializer.save(ip_address=ip)
        send_contact_notification.delay(contact.pk)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"detail": "Your message has been sent. We'll respond within 24-48 hours."},
            status=status.HTTP_201_CREATED,
        )


class ContactListView(generics.ListAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Contact.objects.all()
    filterset_fields = ["status", "service"]
    search_fields = ["name", "email", "subject"]
    ordering = ["-created_at"]


class ContactDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Contact.objects.all()
