from django.db.models import Count
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Project
from .serializers import CategorySerializer, ProjectListSerializer, ProjectDetailSerializer
from .filters import ProjectFilter
from apps.core.permissions import IsEditorOrReadOnly


class CategoryListView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsEditorOrReadOnly]

    def get_queryset(self):
        return Category.objects.annotate(project_count=Count("projects")).order_by("name")

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsEditorOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Category.objects.annotate(project_count=Count("projects"))


class ProjectListView(generics.ListCreateAPIView):
    permission_classes = [IsEditorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjectFilter
    search_fields = ["title", "short_description", "tech_stack"]
    ordering_fields = ["created_at", "order", "views_count"]
    ordering = ["order", "-created_at"]

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return ProjectListSerializer
        return ProjectDetailSerializer

    def get_queryset(self):
        qs = Project.objects.select_related("category").prefetch_related("tags")
        if not (self.request.user.is_authenticated and self.request.user.is_editor):
            qs = qs.filter(status=Project.Status.PUBLISHED)
        return qs


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsEditorOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Project.objects.select_related("category").prefetch_related("tags", "images")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FeaturedProjectsView(generics.ListAPIView):
    serializer_class = ProjectListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Project.objects.filter(
            status=Project.Status.PUBLISHED, is_featured=True
        ).select_related("category").prefetch_related("tags").order_by("order")[:6]

    @method_decorator(cache_page(60 * 10))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
