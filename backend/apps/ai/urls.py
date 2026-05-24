from django.urls import path

from . import views

urlpatterns = [
    path("blog/",    views.BlogWriterView.as_view()),
    path("seo/",     views.SEOView.as_view()),
    path("faq/",     views.FAQView.as_view()),
    path("leads/",   views.LeadAnalyzerView.as_view()),
    path("chat/",    views.ChatView.as_view()),
    path("history/", views.AIHistoryView.as_view()),
    path("usage/",   views.AIUsageView.as_view()),
]
