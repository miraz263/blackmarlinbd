from django.urls import path, include

urlpatterns = [
    path("auth/", include("apps.users.urls")),
    path("projects/", include("apps.projects.urls")),
    path("blog/", include("apps.blog.urls")),
    path("contacts/", include("apps.contacts.urls")),
    path("jobs/", include("apps.jobs.urls")),
]
