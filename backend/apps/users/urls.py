from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", views.TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("me/", views.MeView.as_view(), name="auth-me"),
    path("change-password/", views.ChangePasswordView.as_view(), name="auth-change-password"),
    path("newsletter/subscribe/", views.NewsletterSubscribeView.as_view(), name="newsletter-subscribe"),
    path("users/", views.UserListView.as_view(), name="user-list"),
]
