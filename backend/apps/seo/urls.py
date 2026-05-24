from django.urls import path
from . import views

# NOTE: the <str:page_key> segment matches any non-slash string,
# so keys like "home", "about", "service-ai-ml" all work.
urlpatterns = [
    path("",                        views.SEOPageListView.as_view(),   name="seo-list"),
    path("<str:page_key>/",         views.SEOPageDetailView.as_view(), name="seo-detail"),
]
