from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.core.permissions import IsEditorOrReadOnly
from .models import SEOPage
from .serializers import SEOPageSerializer, SEOPageWriteSerializer


class SEOPageListView(generics.ListCreateAPIView):
    queryset           = SEOPage.objects.all()
    permission_classes = [IsEditorOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ("POST",):
            return SEOPageWriteSerializer
        return SEOPageSerializer


class SEOPageDetailView(generics.RetrieveUpdateAPIView):
    queryset           = SEOPage.objects.all()
    permission_classes = [IsEditorOrReadOnly]
    lookup_field       = "page_key"
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return get_object_or_404(SEOPage, page_key=self.kwargs["page_key"])

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return SEOPageWriteSerializer
        return SEOPageSerializer

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)
