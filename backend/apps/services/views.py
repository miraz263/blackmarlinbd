from django.db.models import Count
from rest_framework import generics, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.permissions import IsEditorOrReadOnly
from .models import ServiceCategory, Technology, Service, CaseStudy
from .serializers import (
    ServiceCategorySerializer,
    TechnologySerializer,
    ServiceListSerializer,
    ServiceDetailSerializer,
    ServiceWriteSerializer,
    CaseStudySerializer,
)
from .filters import ServiceFilter


# ─── Categories ────────────────────────────────────────────────────────────

class CategoryListView(generics.ListCreateAPIView):
    serializer_class   = ServiceCategorySerializer
    permission_classes = [IsEditorOrReadOnly]

    def get_queryset(self):
        return (
            ServiceCategory.objects
            .filter(is_published=True)
            .annotate(service_count=Count("services"))
            .order_by("order", "name")
        )


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ServiceCategorySerializer
    permission_classes = [IsEditorOrReadOnly]
    lookup_field       = "slug"

    def get_queryset(self):
        return ServiceCategory.objects.annotate(service_count=Count("services"))


# ─── Technologies ──────────────────────────────────────────────────────────

class TechnologyListView(generics.ListCreateAPIView):
    serializer_class   = TechnologySerializer
    permission_classes = [IsEditorOrReadOnly]
    queryset           = Technology.objects.all().order_by("order", "name")


class TechnologyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = TechnologySerializer
    permission_classes = [IsEditorOrReadOnly]
    queryset           = Technology.objects.all()


# ─── Services ──────────────────────────────────────────────────────────────

class ServiceListView(generics.ListCreateAPIView):
    permission_classes = [IsEditorOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = ServiceFilter
    search_fields      = ["title", "tagline", "short_description", "category__name"]
    ordering_fields    = ["order", "created_at", "views_count", "title"]
    ordering           = ["order"]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = (
            Service.objects
            .select_related("category")
            .prefetch_related("technologies")
            .filter(status=Service.Status.PUBLISHED)
        )
        # Staff can see drafts too
        if self.request.user.is_authenticated and (
            self.request.user.is_staff or getattr(self.request.user, "is_editor", False)
        ):
            qs = Service.objects.select_related("category").prefetch_related("technologies")
        return qs

    def get_serializer_class(self):
        if self.request.method in ("POST",):
            return ServiceWriteSerializer
        return ServiceListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsEditorOrReadOnly]
    lookup_field       = "slug"
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return (
            Service.objects
            .select_related("category")
            .prefetch_related("technologies", "case_studies")
        )

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return ServiceWriteSerializer
        return ServiceDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ─── Case Studies ──────────────────────────────────────────────────────────

class CaseStudyListView(generics.ListCreateAPIView):
    serializer_class   = CaseStudySerializer
    permission_classes = [IsEditorOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return (
            CaseStudy.objects
            .filter(service__slug=self.kwargs["service_slug"], is_published=True)
            .order_by("order")
        )

    def perform_create(self, serializer):
        service = generics.get_object_or_404(Service, slug=self.kwargs["service_slug"])
        serializer.save(service=service)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class CaseStudyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CaseStudySerializer
    permission_classes = [IsEditorOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return CaseStudy.objects.filter(service__slug=self.kwargs["service_slug"])

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
