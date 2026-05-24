from django.contrib.contenttypes.models import ContentType
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rbac.permissions import rbac_permission, user_has_permission

from .models import (
    ApprovalWorkflow,
    ContentReview,
    ContentStatus,
    WorkflowNotification,
    WorkflowStep,
)
from .serializers import (
    ApprovalWorkflowSerializer,
    ApprovalWorkflowWriteSerializer,
    ContentReviewSerializer,
    NotificationSerializer,
    TransitionSerializer,
    WorkflowStepWriteSerializer,
)


# ─── Workflow Definitions ────────────────────────────────────────────────────


class WorkflowListView(APIView):
    permission_classes = [rbac_permission("site_settings", "view")]

    def get(self, request):
        qs = ApprovalWorkflow.objects.prefetch_related("steps__required_role").filter(is_active=True)
        return Response(ApprovalWorkflowSerializer(qs, many=True).data)

    def post(self, request):
        ser = ApprovalWorkflowWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        wf = ser.save()
        return Response(ApprovalWorkflowSerializer(wf).data, status=201)


class WorkflowDetailView(APIView):
    permission_classes = [rbac_permission("site_settings", "view")]

    def _get(self, pk):
        try:
            return ApprovalWorkflow.objects.prefetch_related("steps__required_role").get(pk=pk)
        except ApprovalWorkflow.DoesNotExist:
            return None

    def get(self, request, pk):
        wf = self._get(pk)
        if not wf:
            return Response(status=404)
        return Response(ApprovalWorkflowSerializer(wf).data)

    def put(self, request, pk):
        wf = self._get(pk)
        if not wf:
            return Response(status=404)
        ser = ApprovalWorkflowWriteSerializer(wf, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ApprovalWorkflowSerializer(wf).data)

    def delete(self, request, pk):
        wf = self._get(pk)
        if not wf:
            return Response(status=404)
        if wf.reviews.exists():
            return Response({"error": "Cannot delete workflow with existing reviews"}, status=400)
        wf.delete()
        return Response(status=204)


class WorkflowStepBulkView(APIView):
    """Replace all steps for a workflow."""
    permission_classes = [rbac_permission("site_settings", "edit")]

    def put(self, request, pk):
        try:
            wf = ApprovalWorkflow.objects.get(pk=pk)
        except ApprovalWorkflow.DoesNotExist:
            return Response(status=404)
        wf.steps.all().delete()
        steps_data = request.data if isinstance(request.data, list) else []
        for step_data in steps_data:
            step_data["workflow"] = wf.pk
            ser = WorkflowStepWriteSerializer(data=step_data)
            ser.is_valid(raise_exception=True)
            ser.save()
        return Response(ApprovalWorkflowSerializer(wf).data)


# ─── Review Queues ───────────────────────────────────────────────────────────


class QueueView(ListAPIView):
    """Content pending approval for the current user's role."""
    serializer_class = ContentReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = ContentReview.objects.select_related(
            "workflow", "current_step__required_role", "submitted_by", "content_type"
        )
        if user.is_superuser:
            return base.filter(
                status__in=[ContentStatus.REVIEW, ContentStatus.APPROVED]
            ).order_by("-updated_at")
        try:
            role = user.userrole.role
            return base.filter(
                status=ContentStatus.REVIEW,
                current_step__required_role=role,
            ).order_by("-updated_at")
        except Exception:
            return ContentReview.objects.none()


class MySubmissionsView(ListAPIView):
    """Content submitted by the current user."""
    serializer_class = ContentReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ContentReview.objects.filter(
            submitted_by=self.request.user
        ).select_related(
            "workflow", "current_step", "content_type"
        ).order_by("-updated_at")


class AllReviewsView(ListAPIView):
    """All content reviews — for managers / superadmin."""
    serializer_class = ContentReviewSerializer
    permission_classes = [rbac_permission("site_settings", "view")]

    def get_queryset(self):
        qs = ContentReview.objects.select_related(
            "workflow", "current_step", "submitted_by", "content_type"
        ).order_by("-updated_at")
        if status_filter := self.request.query_params.get("status"):
            qs = qs.filter(status=status_filter)
        if app_label := self.request.query_params.get("app"):
            ct = ContentType.objects.filter(app_label=app_label).first()
            if ct:
                qs = qs.filter(content_type=ct)
        return qs


# ─── Review Lifecycle ────────────────────────────────────────────────────────


class SubmitView(APIView):
    """Submit content for review — creates or retrieves a ContentReview."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        app_label  = request.data.get("app_label", "")
        model_name = request.data.get("model_name", "")
        object_id  = request.data.get("object_id")
        comment    = request.data.get("comment", "")

        if not all([app_label, model_name, object_id]):
            return Response(
                {"error": "app_label, model_name, and object_id are required"}, status=400
            )

        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name.lower())
        except ContentType.DoesNotExist:
            return Response({"error": "Unknown content type"}, status=400)

        workflow = ApprovalWorkflow.objects.filter(
            app_label=app_label, model_name=model_name.lower(), is_active=True
        ).first()
        if not workflow:
            return Response(
                {"error": "No active workflow configured for this content type"}, status=400
            )

        try:
            obj = ct.get_object_for_this_type(pk=object_id)
        except Exception:
            return Response({"error": "Content object not found"}, status=404)

        title = (
            getattr(obj, "title", None)
            or getattr(obj, "name", None)
            or f"#{object_id}"
        )

        review, _ = ContentReview.objects.get_or_create(
            content_type=ct,
            object_id=object_id,
            defaults={
                "workflow": workflow,
                "submitted_by": request.user,
                "content_title": title,
                "status": ContentStatus.DRAFT,
            },
        )
        # Refresh title and workflow in case they changed
        review.workflow = workflow
        review.content_title = title
        review.save(update_fields=["workflow", "content_title"])

        if not review.can_transition(ContentStatus.REVIEW):
            return Response(
                {"error": f"Content is already in '{review.status}' state"}, status=400
            )

        review.transition(ContentStatus.REVIEW, actor=request.user, comment=comment)
        return Response(
            ContentReviewSerializer(review, context={"request": request}).data, status=200
        )


class ContentReviewStatusView(APIView):
    """Lightweight check — is this content object in a review?"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        app_label  = request.query_params.get("app_label", "")
        model_name = request.query_params.get("model_name", "")
        object_id  = request.query_params.get("object_id")
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name.lower())
            review = ContentReview.objects.select_related(
                "workflow", "current_step", "submitted_by"
            ).get(content_type=ct, object_id=object_id)
            return Response(ContentReviewSerializer(review, context={"request": request}).data)
        except (ContentType.DoesNotExist, ContentReview.DoesNotExist):
            return Response(None)


class ReviewDetailView(RetrieveAPIView):
    serializer_class = ContentReviewSerializer
    permission_classes = [IsAuthenticated]
    queryset = ContentReview.objects.select_related(
        "workflow", "current_step", "submitted_by", "content_type"
    )


class ReviewHistoryView(ListAPIView):
    serializer_class = TransitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return (
                ContentReview.objects.get(pk=self.kwargs["pk"])
                .transitions.select_related("actor")
                .order_by("-created_at")
            )
        except ContentReview.DoesNotExist:
            return WorkflowNotification.objects.none()


class ReviewActionView(APIView):
    """approve | reject | publish | archive | restore"""
    permission_classes = [IsAuthenticated]

    _ACTION_MAP = {
        "approve": ContentStatus.APPROVED,
        "reject":  ContentStatus.DRAFT,
        "publish": ContentStatus.PUBLISHED,
        "archive": ContentStatus.ARCHIVED,
        "restore": ContentStatus.DRAFT,
    }

    def post(self, request, pk, action):
        to_status = self._ACTION_MAP.get(action)
        if not to_status:
            return Response({"error": f"Unknown action '{action}'"}, status=400)

        try:
            review = ContentReview.objects.select_related(
                "workflow", "current_step__required_role", "submitted_by"
            ).get(pk=pk)
        except ContentReview.DoesNotExist:
            return Response(status=404)

        user = request.user
        if not user.is_superuser:
            if action == "approve" and review.current_step and review.current_step.required_role:
                try:
                    if user.userrole.role_id != review.current_step.required_role_id:
                        return Response(
                            {"error": "Your role is not authorized for this approval step"}, status=403
                        )
                except Exception:
                    return Response({"error": "No role assigned to your account"}, status=403)

            if action in ("publish", "archive"):
                if not (
                    getattr(user, "is_admin", False)
                    or user_has_permission(user, "site_settings", "publish")
                ):
                    return Response({"error": "Publish permission required"}, status=403)

        comment = request.data.get("comment", "")
        try:
            review.transition(to_status, actor=user, comment=comment)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)

        return Response(ContentReviewSerializer(review, context={"request": request}).data)


# ─── Notifications ───────────────────────────────────────────────────────────


class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkflowNotification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")[:50]


class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = WorkflowNotification.objects.filter(
            user=request.user, is_read=False
        ).count()
        return Response({"count": count})


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        qs = WorkflowNotification.objects.filter(user=request.user)
        if pk:
            qs = qs.filter(pk=pk)
        else:
            qs = qs.filter(is_read=False)
        qs.update(is_read=True)
        return Response({"ok": True})


# ─── Stats ───────────────────────────────────────────────────────────────────


class WorkflowStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count

        rows = ContentReview.objects.values("status").annotate(count=Count("id"))
        return Response({row["status"]: row["count"] for row in rows})
