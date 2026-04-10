from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Category, Project, ProjectImage


class CategorySerializer(serializers.ModelSerializer):
    project_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "icon", "color", "project_count")


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ("id", "image", "alt_text", "order")


class ProjectListSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Project
        fields = (
            "id", "title", "slug", "short_description", "category",
            "tags", "tech_stack", "thumbnail", "demo_url", "github_url",
            "status", "is_featured", "order", "views_count", "completion_date",
            "created_at",
        )


class ProjectDetailSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False
    )
    images = ProjectImageSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = (
            "id", "title", "slug", "short_description", "description",
            "category", "category_id", "tags", "tech_stack", "thumbnail",
            "demo_url", "github_url", "case_study_url", "status", "is_featured",
            "order", "client_name", "completion_date", "views_count",
            "images", "created_at", "updated_at",
        )
        read_only_fields = ("slug", "views_count", "created_at", "updated_at")
