from django.urls import path
from . import views

urlpatterns = [
    path("",          views.MediaAssetListView.as_view(),   name="media-list"),
    path("upload/",   views.MediaUploadView.as_view(),      name="media-upload"),
    path("folders/",  views.MediaFoldersView.as_view(),     name="media-folders"),
    path("<int:pk>/", views.MediaAssetDetailView.as_view(), name="media-detail"),
]
