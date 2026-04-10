from django.urls import path
from . import views

urlpatterns = [
    path("", views.JobListView.as_view(), name="job-list"),
    path("applications/", views.JobApplicationListView.as_view(), name="job-application-list"),
    path("applications/<int:pk>/", views.JobApplicationDetailView.as_view(), name="job-application-detail"),
    path("<int:pk>/", views.JobDetailView.as_view(), name="job-detail"),
    path("<int:pk>/apply/", views.JobApplyView.as_view(), name="job-apply"),
]
