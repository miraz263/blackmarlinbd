from rest_framework import serializers

from .models import (
    ApprovalWorkflow,
    WorkflowStep,
    ContentReview,
    WorkflowTransition,
    WorkflowNotification,
    VALID_TRANSITIONS,
)


class WorkflowStepSerializer(serializers.ModelSerializer):
    required_role_name = serializers.CharField(
        source="required_role.name", read_only=True, default=None
    )

    class Meta:
        model = WorkflowStep
        fields = ["id", "name", "order", "required_role", "required_role_name", "instructions"]


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True, source="steps_ordered")

    class Meta:
        model = ApprovalWorkflow
        fields = [
            "id", "name", "app_label", "model_name",
            "description", "is_active", "auto_publish", "steps",
        ]


class ApprovalWorkflowWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalWorkflow
        fields = ["name", "app_label", "model_name", "description", "is_active", "auto_publish"]


class WorkflowStepWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = ["workflow", "name", "order", "required_role", "instructions"]


class TransitionSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowTransition
        fields = ["id", "from_status", "to_status", "actor_name", "comment", "created_at"]

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.email
        return "System"


class ContentReviewSerializer(serializers.ModelSerializer):
    workflow_name      = serializers.CharField(source="workflow.name", read_only=True)
    current_step_name  = serializers.CharField(source="current_step.name", read_only=True, default=None)
    submitted_by_name  = serializers.SerializerMethodField()
    content_type_label = serializers.SerializerMethodField()
    valid_transitions  = serializers.SerializerMethodField()

    class Meta:
        model = ContentReview
        fields = [
            "id", "object_id", "status", "content_title",
            "workflow_name", "current_step_name",
            "submitted_by_name", "submitted_at",
            "content_type_label", "valid_transitions",
            "created_at", "updated_at",
        ]

    def get_submitted_by_name(self, obj):
        if obj.submitted_by:
            return obj.submitted_by.get_full_name() or obj.submitted_by.email
        return None

    def get_content_type_label(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"

    def get_valid_transitions(self, obj):
        return VALID_TRANSITIONS.get(obj.status, [])


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowNotification
        fields = ["id", "message", "notification_type", "is_read", "created_at"]
