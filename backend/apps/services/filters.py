import django_filters
from .models import Service


class ServiceFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="exact",
        label="Category slug",
    )
    featured = django_filters.BooleanFilter(field_name="featured")
    status   = django_filters.ChoiceFilter(choices=Service.Status.choices)
    gradient = django_filters.CharFilter(field_name="gradient", lookup_expr="exact")

    class Meta:
        model  = Service
        fields = ["category", "featured", "status", "gradient"]
