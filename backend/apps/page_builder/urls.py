from django.urls import path
from . import views

urlpatterns = [
    # Pages
    path("",              views.PageListView.as_view(),   name="pb-page-list"),
    path("<slug:slug>/",  views.PageDetailView.as_view(), name="pb-page-detail"),

    # Sections  — reorder MUST precede <int:pk>
    path("<slug:slug>/sections/",            views.SectionListView.as_view(),    name="pb-section-list"),
    path("<slug:slug>/sections/reorder/",    views.SectionReorderView.as_view(), name="pb-section-reorder"),
    path("<slug:slug>/sections/<int:pk>/",   views.SectionDetailView.as_view(),  name="pb-section-detail"),

    # Blocks — reorder MUST precede <int:pk>
    path("<slug:slug>/sections/<int:section_pk>/blocks/",
         views.BlockListView.as_view(), name="pb-block-list"),
    path("<slug:slug>/sections/<int:section_pk>/blocks/reorder/",
         views.BlockReorderView.as_view(), name="pb-block-reorder"),
    path("<slug:slug>/sections/<int:section_pk>/blocks/<int:pk>/",
         views.BlockDetailView.as_view(), name="pb-block-detail"),
]
