from rest_framework import serializers
from .models import Contact


class ContactCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ("name", "email", "phone", "company", "service", "subject", "message", "budget")


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "ip_address")
