from django.contrib import admin

from .models import (
    ApprovalWorkflow,
    ContentReview,
    ContentStatus,
    WorkflowNotification,
    WorkflowStep,
    WorkflowTransition,
)


class WorkflowStepInline(admin.TabularInline):
    model   = WorkflowStep
    extra   = 1
    ordering = ["order"]
    fields  = ["order", "name", "required_role", "instructions"]


@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display  = ["name", "app_label", "model_name", "is_active", "auto_publish", "created_at"]
    list_filter   = ["is_active", "app_label", "auto_publish"]
    search_fields = ["name", "app_label", "model_name"]
    inlines       = [WorkflowStepInline]


class TransitionInline(admin.TabularInline):
    model         = WorkflowTransition
    extra         = 0
    readonly_fields = ["from_status", "to_status", "actor", "comment", "created_at"]
    can_delete    = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ContentReview)
class ContentReviewAdmin(admin.ModelAdmin):
    list_display  = [
        "content_title", "status", "workflow", "current_step",
        "submitted_by", "submitted_at", "updated_at",
    ]
    list_filter   = ["status", "workflow", "content_type"]
    search_fields = ["content_title"]
    readonly_fields = [
        "content_type", "object_id", "submitted_by",
        "submitted_at", "created_at", "updated_at",
    ]
    inlines = [TransitionInline]
    actions = ["action_approve", "action_publish", "action_archive"]

    @admin.action(description="Approve selected reviews")
    def action_approve(self, request, queryset):
        count = 0
        for review in queryset.filter(status=ContentStatus.REVIEW):
            try:
                review.transition(ContentStatus.APPROVED, actor=request.user, comment="Bulk approved via admin")
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"Approved {count} review(s).")

    @admin.action(description="Publish selected reviews")
    def action_publish(self, request, queryset):
        count = 0
        for review in queryset.filter(status=ContentStatus.APPROVED):
            try:
                review.transition(ContentStatus.PUBLISHED, actor=request.user, comment="Bulk published via admin")
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"Published {count} review(s).")

    @admin.action(description="Archive selected reviews")
    def action_archive(self, request, queryset):
        count = 0
        for review in queryset.exclude(status=ContentStatus.ARCHIVED):
            try:
                review.transition(ContentStatus.ARCHIVED, actor=request.user, comment="Bulk archived via admin")
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"Archived {count} review(s).")


@admin.register(WorkflowNotification)
class WorkflowNotificationAdmin(admin.ModelAdmin):
    list_display = ["user", "message", "notification_type", "is_read", "created_at"]
    list_filter  = ["notification_type", "is_read"]
    search_fields = ["message", "user__email"]
