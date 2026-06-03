from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AboutPage, Mission, Vision, CoreValue, TeamMember, AboutStatistic
from .serializers import (
    AboutPageSerializer,
    MissionSerializer,
    VisionSerializer,
    CoreValueSerializer,
    TeamMemberSerializer,
    AboutStatisticSerializer,
    ReorderSerializer,
)


class AboutAggregateView(APIView):
    """
    GET /api/v1/about/
    Single call returning all About page data.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "page": AboutPageSerializer(AboutPage.load()).data,
                "mission": MissionSerializer(Mission.load()).data,
                "vision": VisionSerializer(Vision.load()).data,
                "statistics": AboutStatisticSerializer(
                    AboutStatistic.objects.filter(is_published=True).order_by("order"),
                    many=True,
                ).data,
                "values": CoreValueSerializer(
                    CoreValue.objects.filter(is_published=True).order_by("order"),
                    many=True,
                ).data,
                "team": TeamMemberSerializer(
                    TeamMember.objects.filter(is_published=True).order_by(
                        "display_order", "name"
                    ),
                    many=True,
                    context={"request": request},
                ).data,
            }
        )


# ─── Singleton views ───────────────────────────────────────────────────────

class _SingletonView(generics.RetrieveUpdateAPIView):
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_object(self):
        return self.model.load()


class AboutPageView(_SingletonView):
    serializer_class = AboutPageSerializer
    model = AboutPage


class MissionView(_SingletonView):
    serializer_class = MissionSerializer
    model = Mission


class VisionView(_SingletonView):
    serializer_class = VisionSerializer
    model = Vision


# ─── Core Values ───────────────────────────────────────────────────────────

class CoreValueListView(generics.ListCreateAPIView):
    serializer_class = CoreValueSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return CoreValue.objects.filter(is_published=True).order_by("order")


class CoreValueDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CoreValueSerializer
    queryset = CoreValue.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class CoreValueReorderView(APIView):
    """
    POST /api/v1/about/values/reorder/
    Body: [{"id": 1, "order": 0}, {"id": 3, "order": 1}, ...]
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        items = ReorderSerializer(data=request.data, many=True)
        items.is_valid(raise_exception=True)
        with transaction.atomic():
            for item in items.validated_data:
                CoreValue.objects.filter(pk=item["id"]).update(order=item["order"])
        return Response({"status": "ok"})


# ─── Team Members ──────────────────────────────────────────────────────────

class TeamListView(generics.ListCreateAPIView):
    serializer_class = TeamMemberSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return TeamMember.objects.filter(is_published=True).order_by(
            "display_order", "name"
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamMemberSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = TeamMember.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class TeamReorderView(APIView):
    """
    POST /api/v1/about/team/reorder/
    Body: [{"id": 1, "order": 0}, {"id": 3, "order": 1}, ...]
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        items = ReorderSerializer(data=request.data, many=True)
        items.is_valid(raise_exception=True)
        with transaction.atomic():
            for item in items.validated_data:
                TeamMember.objects.filter(pk=item["id"]).update(
                    display_order=item["order"]
                )
        return Response({"status": "ok"})


# ─── Statistics ─────────────────────────────────────────────────────────────

class StatisticListView(generics.ListCreateAPIView):
    serializer_class = AboutStatisticSerializer
    queryset = AboutStatistic.objects.all().order_by("order")

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class StatisticDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AboutStatisticSerializer
    queryset = AboutStatistic.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class StatisticReorderView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        items = ReorderSerializer(data=request.data, many=True)
        items.is_valid(raise_exception=True)
        with transaction.atomic():
            for item in items.validated_data:
                AboutStatistic.objects.filter(pk=item["id"]).update(order=item["order"])
        return Response({"status": "ok"})
