from django.urls import path
from . import views

urlpatterns = [
    path("", views.BlogPostListView.as_view(), name="blog-list"),
    path("featured/", views.FeaturedPostsView.as_view(), name="blog-featured"),
    path("categories/", views.BlogCategoryListView.as_view(), name="blog-category-list"),
    path("<slug:slug>/", views.BlogPostDetailView.as_view(), name="blog-detail"),
    path("<slug:slug>/comments/", views.CommentCreateView.as_view(), name="blog-comment-create"),
]
