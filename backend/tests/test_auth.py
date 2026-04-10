import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@test.com",
        password="testpass123",
    )


@pytest.mark.django_db
class TestAuthentication:
    def test_register(self, api_client):
        url = reverse("auth-register")
        data = {
            "username": "newuser",
            "email": "new@test.com",
            "password": "newpass123!",
            "password2": "newpass123!",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert "access_token" in response.cookies

    def test_login(self, api_client, user):
        url = reverse("auth-login")
        response = api_client.post(url, {"email": "test@test.com", "password": "testpass123"})
        assert response.status_code == status.HTTP_200_OK
        assert "access_token" in response.cookies

    def test_login_wrong_password(self, api_client, user):
        url = reverse("auth-login")
        response = api_client.post(url, {"email": "test@test.com", "password": "wrongpass"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_me(self, api_client, user):
        api_client.force_authenticate(user=user)
        url = reverse("auth-me")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == user.email

    def test_logout(self, api_client, user):
        api_client.force_authenticate(user=user)
        url = reverse("auth-logout")
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
