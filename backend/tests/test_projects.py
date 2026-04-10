import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.users.models import User
from apps.projects.models import Category, Project


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username="admin",
        email="admin@test.com",
        password="adminpass123",
        role=User.Role.ADMIN,
    )


@pytest.fixture
def category(db):
    return Category.objects.create(name="AI & ML", slug="ai-ml", color="#6366f1")


@pytest.fixture
def published_project(db, category):
    return Project.objects.create(
        title="Test Project",
        slug="test-project",
        short_description="A test project",
        description="Full description",
        category=category,
        status=Project.Status.PUBLISHED,
        tech_stack=["Python", "React"],
    )


@pytest.mark.django_db
class TestProjectEndpoints:
    def test_list_projects_unauthenticated(self, api_client, published_project):
        url = reverse("project-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_draft_project_hidden_from_public(self, api_client, category):
        Project.objects.create(
            title="Draft Project",
            short_description="draft",
            description="draft",
            category=category,
            status=Project.Status.DRAFT,
        )
        url = reverse("project-list")
        response = api_client.get(url)
        # Should not see draft projects
        for proj in response.data["results"]:
            assert proj["status"] == Project.Status.PUBLISHED

    def test_create_project_requires_auth(self, api_client, category):
        url = reverse("project-list")
        response = api_client.post(url, {"title": "New Project"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_project_as_admin(self, api_client, admin_user, category):
        api_client.force_authenticate(user=admin_user)
        url = reverse("project-list")
        data = {
            "title": "Admin Project",
            "short_description": "Short desc",
            "description": "Full desc",
            "category_id": category.pk,
            "tech_stack": ["Django"],
            "status": "draft",
            "tags": [],
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_project_detail_increments_views(self, api_client, published_project):
        url = reverse("project-detail", kwargs={"slug": published_project.slug})
        api_client.get(url)
        published_project.refresh_from_db()
        assert published_project.views_count == 1


@pytest.mark.django_db
class TestCategoryEndpoints:
    def test_list_categories(self, api_client, category):
        url = reverse("category-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
