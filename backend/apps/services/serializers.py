from rest_framework import serializers
from .models import ServiceCategory, Technology, Service, CaseStudy


class ServiceCategorySerializer(serializers.ModelSerializer):
    service_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ServiceCategory
        fields = [
            "id", "name", "slug", "description",
            "icon_name", "color", "order", "is_published",
            "service_count",
        ]
        read_only_fields = ["slug", "service_count"]


class TechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Technology
        fields = ["id", "name", "logo", "order"]


class CaseStudySerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudy
        fields = [
            "id", "title", "client_name",
            "challenge", "solution", "results",
            "cover_image", "cover_image_url",
            "is_published", "order",
        ]
        extra_kwargs = {"cover_image": {"write_only": True, "required": False}}

    def get_cover_image_url(self, obj):
        if not obj.cover_image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url


# ─── List serializer — lightweight, no body/case_studies ──────────────────

class ServiceListSerializer(serializers.ModelSerializer):
    category     = ServiceCategorySerializer(read_only=True)
    technologies = TechnologySerializer(many=True, read_only=True)
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id", "title", "slug", "tagline", "short_description",
            "icon_name", "gradient", "cover_image_url",
            "category", "technologies",
            "featured", "order", "status", "views_count",
        ]

    def get_cover_image_url(self, obj):
        if not obj.cover_image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url


# ─── Detail serializer — full payload ─────────────────────────────────────

class ServiceDetailSerializer(ServiceListSerializer):
    case_studies = CaseStudySerializer(
        many=True, read_only=True, source="case_studies_published"
    )

    class Meta(ServiceListSerializer.Meta):
        fields = ServiceListSerializer.Meta.fields + [
            "description", "body", "capabilities", "case_studies",
        ]

    # Only expose published case studies
    def to_representation(self, instance):
        # Inject filtered case studies as 'case_studies_published'
        instance.case_studies_published = instance.case_studies.filter(is_published=True).order_by("order")
        return super().to_representation(instance)


# ─── Write serializer — used for create / update (admin) ──────────────────

class ServiceWriteSerializer(serializers.ModelSerializer):
    technology_ids = serializers.PrimaryKeyRelatedField(
        queryset=Technology.objects.all(),
        many=True,
        source="technologies",
        required=False,
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.all(),
        source="category",
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Service
        fields = [
            "title", "tagline", "short_description", "description",
            "icon_name", "cover_image", "body", "capabilities",
            "gradient", "featured", "order", "status",
            "category_id", "technology_ids",
        ]
