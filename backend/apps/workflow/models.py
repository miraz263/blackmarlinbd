from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

from apps.core.models import TimeStampedModel


class ContentStatus(models.TextChoices):
    DRAFT     = "draft",     "Draft"
    REVIEW    = "review",    "In Review"
    APPROVED  = "approved",  "Approved"
    PUBLISHED = "published", "Published"
    ARCHIVED  = "archived",  "Archived"


VALID_TRANSITIONS: dict[str, list[str]] = {
    ContentStatus.DRAFT:     [ContentStatus.REVIEW, ContentStatus.ARCHIVED],
    ContentStatus.REVIEW:    [ContentStatus.APPROVED, ContentStatus.DRAFT],
    ContentStatus.APPROVED:  [ContentStatus.PUBLISHED, ContentStatus.DRAFT],
    ContentStatus.PUBLISHED: [ContentStatus.ARCHIVED],
    ContentStatus.ARCHIVED:  [ContentStatus.DRAFT],
}


class ApprovalWorkflow(TimeStampedModel):
    name         = models.CharField(max_length=200)
    app_label    = models.CharField(max_length=100)
    model_name   = models.CharField(max_length=100)
    description  = models.TextField(blank=True)
    is_active    = models.BooleanField(default=True)
    auto_publish = models.BooleanField(
        default=False,
        help_text="Automatically publish content when the final approval step is reached",
    )

    class Meta:
        db_table = "workflow_approval_workflows"
        unique_together = [["app_label", "model_name"]]
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def steps_ordered(self):
        return self.steps.order_by("order")


class WorkflowStep(TimeStampedModel):
    workflow      = models.ForeignKey(
        ApprovalWorkflow, on_delete=models.CASCADE, related_name="steps"
    )
    name          = models.CharField(max_length=200)
    order         = models.PositiveIntegerField(default=0, db_index=True)
    required_role = models.ForeignKey(
        "rbac.Role",
        on_delete=models.PROTECT,
        related_name="workflow_steps",
        null=True,
        blank=True,
    )
    instructions = models.TextField(blank=True)

    class Meta:
        db_table = "workflow_steps"
        ordering = ["order"]

    def __str__(self):
        return f"{self.workflow.name} / Step {self.order}: {self.name}"


class ContentReview(TimeStampedModel):
    content_type   = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id      = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    workflow     = models.ForeignKey(
        ApprovalWorkflow, on_delete=models.PROTECT, related_name="reviews"
    )
    current_step = models.ForeignKey(
        WorkflowStep,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="active_reviews",
    )
    status = models.CharField(
        max_length=20,
        choices=ContentStatus.choices,
        default=ContentStatus.DRAFT,
        db_index=True,
    )

    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="submitted_reviews",
    )
    submitted_at  = models.DateTimeField(null=True, blank=True)
    content_title = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = "workflow_content_reviews"
        unique_together = [["content_type", "object_id"]]
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self):
        return f"{self.content_title or self.object_id} ({self.status})"

    def get_next_step(self):
        if not self.current_step:
            return self.workflow.steps_ordered.first()
        return self.workflow.steps_ordered.filter(order__gt=self.current_step.order).first()

    def can_transition(self, to_status: str) -> bool:
        return to_status in VALID_TRANSITIONS.get(self.status, [])

    @transaction.atomic
    def transition(self, to_status: str, actor, comment: str = "") -> "ContentReview":
        if not self.can_transition(to_status):
            raise ValueError(f"Cannot transition from '{self.status}' to '{to_status}'")

        from_status = self.status

        if to_status == ContentStatus.REVIEW:
            self.submitted_at = timezone.now()
            self.submitted_by = self.submitted_by or actor
            self.current_step = self.workflow.steps_ordered.first()

        elif to_status == ContentStatus.APPROVED:
            next_step = self.get_next_step()
            if next_step:
                # Multi-step: advance to next step, stay in review
                self.current_step = next_step
                to_status = ContentStatus.REVIEW
            else:
                self.current_step = None
                if self.workflow.auto_publish:
                    to_status = ContentStatus.PUBLISHED

        elif to_status in (ContentStatus.PUBLISHED, ContentStatus.DRAFT, ContentStatus.ARCHIVED):
            self.current_step = None

        self.status = to_status
        self.save(update_fields=["status", "current_step", "submitted_at", "submitted_by", "updated_at"])

        WorkflowTransition.objects.create(
            review=self,
            from_status=from_status,
            to_status=to_status,
            actor=actor,
            comment=comment,
        )

        self._sync_content_published()
        self._notify(to_status, from_status, actor)
        return self

    def _sync_content_published(self):
        obj = self.content_object
        if obj is None:
            return
        is_published = self.status == ContentStatus.PUBLISHED
        if hasattr(obj, "is_published") and obj.is_published != is_published:
            type(obj).objects.filter(pk=obj.pk).update(is_published=is_published)

    def _notify(self, to_status: str, from_status: str, actor):
        verb_map = {
            ContentStatus.REVIEW:    "submitted for review",
            ContentStatus.APPROVED:  "approved",
            ContentStatus.PUBLISHED: "published",
            ContentStatus.ARCHIVED:  "archived",
            ContentStatus.DRAFT:     "returned to draft",
        }
        verb = verb_map.get(to_status, to_status)
        title = self.content_title or f"Content #{self.object_id}"
        actor_name = getattr(actor, "get_full_name", lambda: None)() or actor.email

        notify_user_ids: set[int] = set()

        # Notify author on any transition they didn't trigger
        if self.submitted_by_id and self.submitted_by_id != actor.pk:
            notify_user_ids.add(self.submitted_by_id)

        # Notify the role members responsible for the current step
        if to_status == ContentStatus.REVIEW and self.current_step and self.current_step.required_role_id:
            from apps.rbac.models import UserRole
            role_users = UserRole.objects.filter(
                role_id=self.current_step.required_role_id
            ).values_list("user_id", flat=True)
            notify_user_ids.update(role_users)

        WorkflowNotification.objects.bulk_create([
            WorkflowNotification(
                user_id=uid,
                review=self,
                message=f'"{title}" was {verb} by {actor_name}.',
                notification_type=to_status,
            )
            for uid in notify_user_ids
            if uid != actor.pk
        ])


class WorkflowTransition(TimeStampedModel):
    review      = models.ForeignKey(
        ContentReview, on_delete=models.CASCADE, related_name="transitions"
    )
    from_status = models.CharField(max_length=20, choices=ContentStatus.choices)
    to_status   = models.CharField(max_length=20, choices=ContentStatus.choices)
    actor       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="workflow_transitions",
    )
    comment = models.TextField(blank=True)

    class Meta:
        db_table = "workflow_transitions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.review} | {self.from_status} → {self.to_status}"


class WorkflowNotification(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workflow_notifications",
    )
    review = models.ForeignKey(
        ContentReview, on_delete=models.CASCADE, related_name="notifications"
    )
    message           = models.CharField(max_length=500)
    notification_type = models.CharField(max_length=30)
    is_read           = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = "workflow_notifications"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "is_read", "created_at"])]

    def __str__(self):
        return f"[{self.notification_type}] {self.user} — {self.message[:60]}"
