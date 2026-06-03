from django.db.models import Count, Q
from rest_framework import generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend

from .models import ProductCategory, Product
from .serializers import ProductCategorySerializer, ProductSerializer
from apps.core.permissions import IsEditorOrReadOnly


class ProductCategoryListView(generics.ListCreateAPIView):
    serializer_class = ProductCategorySerializer
    permission_classes = [IsEditorOrReadOnly]

    def get_queryset(self):
        return ProductCategory.objects.annotate(
            product_count=Count("products", filter=Q(products__is_active=True))
        ).order_by("order", "name")


class ProductCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductCategorySerializer
    permission_classes = [IsEditorOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return ProductCategory.objects.annotate(
            product_count=Count("products", filter=Q(products__is_active=True))
        )


class ProductListView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsEditorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category__slug", "is_featured", "is_active", "is_new", "nav_section"]
    search_fields = ["name", "tagline", "description", "badge"]
    ordering_fields = ["order", "name", "created_at"]
    ordering = ["order", "name"]

    def get_queryset(self):
        qs = Product.objects.select_related("category")
        if not (self.request.user.is_authenticated and self.request.user.is_editor):
            qs = qs.filter(is_active=True)
        return qs


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsEditorOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Product.objects.select_related("category")
