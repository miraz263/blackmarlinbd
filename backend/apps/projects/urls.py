from django.urls import path
from . import views

urlpatterns = [
    path("", views.ProjectListView.as_view(), name="project-list"),
    path("featured/", views.FeaturedProjectsView.as_view(), name="project-featured"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("categories/<slug:slug>/", views.CategoryDetailView.as_view(), name="category-detail"),
    path("<slug:slug>/", views.ProjectDetailView.as_view(), name="project-detail"),
]
