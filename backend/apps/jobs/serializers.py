from rest_framework import serializers
from .models import Job, JobApplication


class JobListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = (
            "id", "title", "department", "location", "type", "experience",
            "salary_min", "salary_max", "salary_currency", "skills", "status",
            "is_featured", "deadline", "application_count", "created_at",
        )


class JobDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ("application_count", "created_at", "updated_at")


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = (
            "id", "full_name", "email", "phone", "linkedin_url",
            "portfolio_url", "resume", "cover_letter", "created_at",
        )

    def validate(self, attrs):
        job_id = self.context["view"].kwargs.get("pk")
        if JobApplication.objects.filter(job_id=job_id, email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "You have already applied for this position."})
        return attrs


class JobApplicationAdminSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = JobApplication
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")
