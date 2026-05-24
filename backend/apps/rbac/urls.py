from django.urls import path
from . import views

urlpatterns = [
    # Current user's effective permissions
    path("me/",                              views.MyPermissionsView.as_view(),  name="rbac-me"),

    # Permission catalogue (read-only)
    path("permissions/",                     views.PermissionListView.as_view(), name="rbac-permissions"),

    # Role CRUD
    path("roles/",                           views.RoleListView.as_view(),       name="rbac-role-list"),
    path("roles/<slug:slug>/",               views.RoleDetailView.as_view(),     name="rbac-role-detail"),

    # User management
    path("users/",                           views.UserAdminListView.as_view(),  name="rbac-user-list"),
    path("users/<int:pk>/",                  views.UserAdminDetailView.as_view(), name="rbac-user-detail"),
    path("users/<int:pk>/assign-role/",      views.AssignRoleView.as_view(),     name="rbac-assign-role"),
]
