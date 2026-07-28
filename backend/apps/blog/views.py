from django.db.models import Count
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics, permissions, filters, status
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import BlogCategory, BlogPost, Comment
from .serializers import (
    BlogCategorySerializer, BlogPostListSerializer,
    BlogPostDetailSerializer, CommentSerializer,
)
from apps.core.permissions import IsEditorOrReadOnly


class IsAuthorOrEditorOrReadOnly(BasePermission):
    """Read for everyone; write for editors/admins, or for the post's own author."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_editor or obj.author_id == request.user.id


class BlogCategoryListView(generics.ListCreateAPIView):
    serializer_class = BlogCategorySerializer
    permission_classes = [IsEditorOrReadOnly]

    def get_queryset(self):
        return BlogCategory.objects.annotate(post_count=Count("posts")).order_by("name")


class BlogPostListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthorOrEditorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category__slug", "is_featured", "status"]
    search_fields = ["title", "excerpt", "content"]
    ordering_fields = ["published_at", "views_count", "created_at"]
    ordering = ["-published_at"]

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return BlogPostListSerializer
        return BlogPostDetailSerializer

    def get_queryset(self):
        qs = BlogPost.objects.select_related("author", "category").prefetch_related("tags")
        if not (self.request.user.is_authenticated and self.request.user.is_editor):
            qs = qs.filter(status=BlogPost.Status.PUBLISHED, published_at__lte=timezone.now())
        return qs

    def perform_create(self, serializer):
        data = {}
        status_value = serializer.validated_data.get("status")
        # Non-editors can only ever create drafts — actual publishing happens
        # once an admin approves the post through the review workflow.
        if not self.request.user.is_editor:
            status_value = BlogPost.Status.DRAFT
            serializer.validated_data["is_featured"] = False
        if status_value == BlogPost.Status.PUBLISHED:
            data["published_at"] = timezone.now()
        serializer.save(author=self.request.user, status=status_value, **data)


class BlogPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BlogPostDetailSerializer
    permission_classes = [IsAuthorOrEditorOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return BlogPost.objects.select_related("author", "category").prefetch_related("tags", "comments__author")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_update(self, serializer):
        # Non-editors can edit their own post's content but can't self-publish
        # or feature it — that still requires admin approval via the workflow.
        if not self.request.user.is_editor:
            serializer.validated_data["is_featured"] = False
            if serializer.validated_data.get("status") == BlogPost.Status.PUBLISHED:
                serializer.validated_data["status"] = BlogPost.Status.DRAFT
        serializer.save()


class FeaturedPostsView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return BlogPost.objects.filter(
            status=BlogPost.Status.PUBLISHED,
            is_featured=True,
            published_at__lte=timezone.now(),
        ).select_related("author", "category").order_by("-published_at")[:3]

    @method_decorator(cache_page(60 * 5))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post_slug = self.kwargs.get("slug")
        post = BlogPost.objects.get(slug=post_slug)
        serializer.save(author=self.request.user, post=post)
