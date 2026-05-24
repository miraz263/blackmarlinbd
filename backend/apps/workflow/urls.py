from django.urls import path

from . import views

urlpatterns = [
    # Workflow definitions (admin)
    path("workflows/",                    views.WorkflowListView.as_view()),
    path("workflows/<int:pk>/",           views.WorkflowDetailView.as_view()),
    path("workflows/<int:pk>/steps/",     views.WorkflowStepBulkView.as_view()),

    # Review queues
    path("queue/",                        views.QueueView.as_view()),
    path("submissions/",                  views.MySubmissionsView.as_view()),
    path("all/",                          views.AllReviewsView.as_view()),

    # Review lifecycle
    path("submit/",                       views.SubmitView.as_view()),
    # status/ must come before <int:pk>/ to avoid "status" being treated as pk
    path("reviews/status/",               views.ContentReviewStatusView.as_view()),
    path("reviews/<int:pk>/",             views.ReviewDetailView.as_view()),
    path("reviews/<int:pk>/history/",     views.ReviewHistoryView.as_view()),
    path("reviews/<int:pk>/<str:action>/", views.ReviewActionView.as_view()),

    # Notifications
    path("notifications/",               views.NotificationListView.as_view()),
    path("notifications/unread/",        views.NotificationUnreadCountView.as_view()),
    path("notifications/read-all/",      views.NotificationMarkReadView.as_view()),
    path("notifications/<int:pk>/read/", views.NotificationMarkReadView.as_view()),

    # Stats
    path("stats/",                       views.WorkflowStatsView.as_view()),
]
