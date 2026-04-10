from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """Read JWT access token from httpOnly cookie."""

    def authenticate(self, request):
        # Try cookie first
        access_token = request.COOKIES.get(settings.SIMPLE_JWT.get("AUTH_COOKIE"))
        if access_token:
            validated_token = self.get_validated_token(access_token)
            return self.get_user(validated_token), validated_token

        # Fall back to Authorization header
        return super().authenticate(request)
