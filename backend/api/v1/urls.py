from django.urls import path, include

urlpatterns = [
    path("auth/", include("apps.users.urls")),
    path("projects/", include("apps.projects.urls")),
    path("blog/", include("apps.blog.urls")),
    path("contacts/", include("apps.contacts.urls")),
    path("jobs/", include("apps.jobs.urls")),
    path("site/", include("apps.site_settings.urls")),
    path("home/", include("apps.homepage.urls")),
    path("about/", include("apps.about.urls")),
    path("services/", include("apps.services.urls")),
    path("media/",    include("apps.media_library.urls")),
    path("seo/",      include("apps.seo.urls")),
    path("admin/",    include("apps.rbac.urls")),
    path("pages/",    include("apps.page_builder.urls")),
    path("workflow/",   include("apps.workflow.urls")),
    path("analytics/",    include("apps.analytics.urls")),
    path("translations/", include("apps.translations.urls")),
    path("ai/",           include("apps.ai.urls")),
]
