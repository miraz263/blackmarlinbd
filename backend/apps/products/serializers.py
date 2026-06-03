from rest_framework import serializers
from .models import ProductCategory, Product


class ProductCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProductCategory
        fields = ("id", "name", "slug", "icon_name", "order", "product_count")


class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductCategory.objects.all(), source="category", write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "tagline", "description",
            "category", "category_id",
            "icon_name", "icon_color", "badge",
            "is_new", "is_featured", "is_active",
            "nav_section", "demo_url", "order",
            "created_at", "updated_at",
        )
        read_only_fields = ("slug", "created_at", "updated_at")
