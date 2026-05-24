from django.urls import path

from . import views

urlpatterns = [
    path("overview/",   views.OverviewView.as_view()),
    path("chart/",      views.ChartView.as_view()),
    path("top-pages/",  views.TopPagesView.as_view()),
    path("devices/",    views.DevicesView.as_view()),
    path("referrers/",  views.ReferrersView.as_view()),
    path("live/",       views.StatsLiveView.as_view()),
    path("collect/",    views.CollectView.as_view()),
    path("export/",     views.ExportCSVView.as_view()),
]
