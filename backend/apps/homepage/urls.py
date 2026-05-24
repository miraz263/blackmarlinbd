from django.urls import path
from . import views

urlpatterns = [
    # Aggregate — single call for all homepage data
    path("", views.HomePageView.as_view(), name="homepage"),

    # Hero singleton
    path("hero/", views.HeroSectionView.as_view(), name="homepage-hero"),
    path("hero/buttons/", views.HeroButtonListView.as_view(), name="homepage-hero-buttons"),
    path("hero/buttons/<int:pk>/", views.HeroButtonDetailView.as_view(), name="homepage-hero-button-detail"),

    # Statistics
    path("statistics/", views.StatisticListView.as_view(), name="homepage-statistics"),
    path("statistics/<int:pk>/", views.StatisticDetailView.as_view(), name="homepage-stat-detail"),

    # Partners
    path("partners/", views.PartnerListView.as_view(), name="homepage-partners"),
    path("partners/<int:pk>/", views.PartnerDetailView.as_view(), name="homepage-partner-detail"),

    # Section controllers
    path("sections/", views.SectionListView.as_view(), name="homepage-sections"),
    path("sections/<int:pk>/", views.SectionDetailView.as_view(), name="homepage-section-detail"),
]
