import django_filters
from .models import Project


class ProjectFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    tag = django_filters.CharFilter(field_name="tags__slug")
    is_featured = django_filters.BooleanFilter()
    status = django_filters.ChoiceFilter(choices=Project.Status.choices)
    tech = django_filters.CharFilter(method="filter_tech")

    class Meta:
        model = Project
        fields = ["category", "tag", "is_featured", "status"]

    def filter_tech(self, queryset, name, value):
        return queryset.filter(tech_stack__icontains=value)
