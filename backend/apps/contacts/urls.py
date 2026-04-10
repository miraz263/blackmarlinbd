from django.urls import path
from . import views

urlpatterns = [
    path("", views.ContactCreateView.as_view(), name="contact-create"),
    path("list/", views.ContactListView.as_view(), name="contact-list"),
    path("<int:pk>/", views.ContactDetailView.as_view(), name="contact-detail"),
]
