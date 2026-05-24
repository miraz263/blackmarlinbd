from django.urls import path
from . import views

urlpatterns = [
    # Service list + create
    path("", views.ServiceListView.as_view(), name="service-list"),

    # Categories
    path("categories/", views.CategoryListView.as_view(), name="service-category-list"),
    path("categories/<slug:slug>/", views.CategoryDetailView.as_view(), name="service-category-detail"),

    # Technologies
    path("technologies/", views.TechnologyListView.as_view(), name="service-technology-list"),
    path("technologies/<int:pk>/", views.TechnologyDetailView.as_view(), name="service-technology-detail"),

    # Service detail — MUST come after fixed paths to avoid slug collision
    path("<slug:slug>/", views.ServiceDetailView.as_view(), name="service-detail"),

    # Case studies nested under service slug
    path("<slug:service_slug>/case-studies/", views.CaseStudyListView.as_view(), name="service-case-study-list"),
    path("<slug:service_slug>/case-studies/<int:pk>/", views.CaseStudyDetailView.as_view(), name="service-case-study-detail"),
]
