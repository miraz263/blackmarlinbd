from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from apps.users.serializers import UserSerializer
from .models import BlogCategory, BlogPost, Comment


class BlogCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = BlogCategory
        fields = ("id", "name", "slug", "description", "post_count")


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ("id", "author", "content", "is_approved", "parent", "replies", "created_at")
        read_only_fields = ("is_approved",)

    def get_replies(self, obj):
        if obj.parent is None:
            approved_replies = obj.replies.filter(is_approved=True)
            return CommentSerializer(approved_replies, many=True).data
        return []


class BlogPostListSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField(read_only=True)
    category = BlogCategorySerializer(read_only=True)
    author = UserSerializer(read_only=True)

    class Meta:
        model = BlogPost
        fields = (
            "id", "title", "slug", "excerpt", "author", "category",
            "tags", "cover_image", "status", "is_featured", "read_time",
            "views_count", "published_at", "created_at",
        )


class BlogPostDetailSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField()
    category = BlogCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(), source="category", write_only=True, required=False
    )
    author = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    comment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = BlogPost
        fields = (
            "id", "title", "slug", "excerpt", "content", "author",
            "category", "category_id", "tags", "cover_image", "status",
            "is_featured", "read_time", "views_count", "published_at",
            "seo_title", "seo_description", "comments", "comment_count",
            "created_at", "updated_at",
        )
        read_only_fields = ("slug", "read_time", "views_count", "created_at", "updated_at")

    def get_comments(self, obj):
        top_level = obj.comments.filter(is_approved=True, parent=None)
        return CommentSerializer(top_level, many=True).data
