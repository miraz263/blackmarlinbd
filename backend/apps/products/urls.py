from django.urls import path
from . import views

urlpatterns = [
    path("categories/", views.ProductCategoryListView.as_view(), name="product-category-list"),
    path("categories/<slug:slug>/", views.ProductCategoryDetailView.as_view(), name="product-category-detail"),
    path("", views.ProductListView.as_view(), name="product-list"),
    path("<slug:slug>/", views.ProductDetailView.as_view(), name="product-detail"),
]
