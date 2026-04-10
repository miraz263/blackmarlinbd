from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Job, JobApplication
from .serializers import (
    JobListSerializer, JobDetailSerializer,
    JobApplicationSerializer, JobApplicationAdminSerializer,
)
from apps.core.permissions import IsEditorOrReadOnly


class JobListView(generics.ListCreateAPIView):
    permission_classes = [IsEditorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["type", "experience", "status", "is_featured", "department"]
    search_fields = ["title", "department", "description"]
    ordering_fields = ["created_at", "deadline"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return JobListSerializer
        return JobDetailSerializer

    def get_queryset(self):
        qs = Job.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_editor):
            qs = qs.filter(status=Job.Status.OPEN)
        return qs


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobDetailSerializer
    permission_classes = [IsEditorOrReadOnly]

    def get_queryset(self):
        return Job.objects.prefetch_related("applications")


class JobApplyView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        job = Job.objects.get(pk=self.kwargs["pk"])
        applicant = self.request.user if self.request.user.is_authenticated else None
        application = serializer.save(job=job, applicant=applicant)
        Job.objects.filter(pk=job.pk).update(application_count=job.application_count + 1)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"detail": "Application submitted successfully!"},
            status=status.HTTP_201_CREATED,
        )


class JobApplicationListView(generics.ListAPIView):
    serializer_class = JobApplicationAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ["status", "job"]
    search_fields = ["full_name", "email"]

    def get_queryset(self):
        return JobApplication.objects.select_related("job").order_by("-created_at")


class JobApplicationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = JobApplicationAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = JobApplication.objects.select_related("job")
