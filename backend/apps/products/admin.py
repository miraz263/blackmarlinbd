from django.contrib import admin
from .models import ProductCategory, Product


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon_name", "order")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "name")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "category", "badge", "is_new", "is_featured", "is_active", "order")
    list_filter = ("category", "is_featured", "is_active", "is_new")
    search_fields = ("name", "tagline", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "name")
