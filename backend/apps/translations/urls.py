from django.urls import path

from . import views

urlpatterns = [
    # Languages (public list, admin write)
    path("languages/",              views.LanguageListView.as_view()),
    path("languages/<str:code>/",   views.LanguageDetailView.as_view()),
    path("geo-language/",           views.GeoLanguageView.as_view()),

    # UI strings
    path("ui/<str:lang>/",          views.UITranslationPublicView.as_view()),  # public
    path("ui/",                     views.UITranslationAdminView.as_view()),   # admin CRUD

    # Content translations
    path("content/",                views.ContentTranslationView.as_view()),
    path("content/models/",         views.TranslatableModelListView.as_view()),
    path("content/objects/",        views.TranslatableObjectListView.as_view()),
]
