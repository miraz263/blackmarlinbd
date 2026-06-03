from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    AdminUserSerializer,
    ChangePasswordSerializer,
    NewsletterSerializer,
)
from .models import NewsletterSubscriber

User = get_user_model()

JWT_SETTINGS = settings.SIMPLE_JWT


def _set_auth_cookies(response, access_token, refresh_token):
    secure = JWT_SETTINGS.get("AUTH_COOKIE_SECURE", True)
    http_only = JWT_SETTINGS.get("AUTH_COOKIE_HTTP_ONLY", True)
    samesite = JWT_SETTINGS.get("AUTH_COOKIE_SAMESITE", "Lax")

    response.set_cookie(
        key=JWT_SETTINGS["AUTH_COOKIE"],
        value=str(access_token),
        max_age=int(JWT_SETTINGS["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        secure=secure,
        httponly=http_only,
        samesite=samesite,
        path="/",
    )
    response.set_cookie(
        key=JWT_SETTINGS["AUTH_COOKIE_REFRESH"],
        value=str(refresh_token),
        max_age=int(JWT_SETTINGS["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        secure=secure,
        httponly=http_only,
        samesite=samesite,
        path="/api/v1/auth/token/refresh/",
    )


def _clear_auth_cookies(response):
    secure = JWT_SETTINGS.get("AUTH_COOKIE_SECURE", True)
    samesite = JWT_SETTINGS.get("AUTH_COOKIE_SAMESITE", "Lax")
    # Explicitly expire with matching attributes so every browser honours the deletion
    cookie_paths = {
        JWT_SETTINGS["AUTH_COOKIE"]: "/",
        JWT_SETTINGS["AUTH_COOKIE_REFRESH"]: "/api/v1/auth/token/refresh/",
    }
    for key, path in cookie_paths.items():
        response.set_cookie(
            key=key,
            value="",
            max_age=0,
            path=path,
            httponly=True,
            secure=secure,
            samesite=samesite,
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        _set_auth_cookies(response, refresh.access_token, refresh)
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.contrib.auth import authenticate

        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data)
        _set_auth_cookies(response, refresh.access_token, refresh)
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(JWT_SETTINGS["AUTH_COOKIE_REFRESH"])
        response = Response({"detail": "Logged out successfully."})

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        _clear_auth_cookies(response)
        return response


class TokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(JWT_SETTINGS["AUTH_COOKIE_REFRESH"])
        if not refresh_token:
            return Response({"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token

            response = Response({"detail": "Token refreshed."})
            _set_auth_cookies(response, access_token, refresh)
            return response
        except TokenError:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"old_password": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password updated successfully."})


class NewsletterSubscribeView(generics.CreateAPIView):
    serializer_class = NewsletterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        if not created and subscriber.is_active:
            return Response({"detail": "Already subscribed."}, status=status.HTTP_200_OK)
        subscriber.is_active = True
        subscriber.save()
        return Response({"detail": "Subscribed successfully."}, status=status.HTTP_201_CREATED)


class UserListView(generics.ListAPIView):
    """Admin-only user list."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all().order_by("-date_joined")
    search_fields = ["email", "username", "first_name", "last_name"]
    filterset_fields = ["role", "is_active"]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only: view, update role/status, or delete a user."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
