from django.urls import path
from . import views

urlpatterns = [
    # Aggregate
    path("", views.AboutAggregateView.as_view(), name="about"),

    # Singletons
    path("page/", views.AboutPageView.as_view(), name="about-page"),
    path("mission/", views.MissionView.as_view(), name="about-mission"),
    path("vision/", views.VisionView.as_view(), name="about-vision"),

    # Core Values
    path("values/", views.CoreValueListView.as_view(), name="about-values"),
    path("values/reorder/", views.CoreValueReorderView.as_view(), name="about-values-reorder"),
    path("values/<int:pk>/", views.CoreValueDetailView.as_view(), name="about-value-detail"),

    # Team
    path("team/", views.TeamListView.as_view(), name="about-team"),
    path("team/reorder/", views.TeamReorderView.as_view(), name="about-team-reorder"),
    path("team/<int:pk>/", views.TeamDetailView.as_view(), name="about-team-detail"),

    # Statistics
    path("statistics/", views.StatisticListView.as_view(), name="about-statistics"),
    path("statistics/reorder/", views.StatisticReorderView.as_view(), name="about-statistics-reorder"),
    path("statistics/<int:pk>/", views.StatisticDetailView.as_view(), name="about-statistic-detail"),
]
