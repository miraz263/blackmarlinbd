from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    HeroSection,
    HeroButton,
    StatisticCard,
    PartnerLogo,
    TechItem,
    ServiceItem,
    HomepageSection,
)
from .serializers import (
    HeroSectionSerializer,
    HeroButtonSerializer,
    StatisticCardSerializer,
    PartnerLogoSerializer,
    TechItemSerializer,
    ServiceItemSerializer,
    HomepageSectionSerializer,
)

# Default section configs seeded on first GET /home/
_SECTION_DEFAULTS = [
    {"section_key": "hero",       "order": 1, "is_visible": True},
    {"section_key": "statistics", "order": 2, "is_visible": True, "badge_text": "By the numbers"},
    {"section_key": "tech_stack", "order": 3, "is_visible": True,
     "title": "Built with industry-leading technologies"},
    {"section_key": "services",   "order": 4, "is_visible": True,
     "title": "End-to-End Technology Services",
     "badge_text": "What We Do",
     "description": "From AI research to production deployment, we engineer solutions that solve real business problems at enterprise scale."},
    {"section_key": "projects",   "order": 5, "is_visible": True,
     "title": "Featured Projects", "badge_text": "Portfolio"},
    {"section_key": "partners",   "order": 6, "is_visible": True,
     "title": "Trusted By"},
    {"section_key": "cta",        "order": 7, "is_visible": True,
     "title": "Ready to Build Something Extraordinary?",
     "description": "Join 50+ global enterprises that trust BlackMarlinBD to engineer their most critical technology infrastructure.",
     "cta_text": "Start Your Project", "cta_link": "/contact"},
]


def _seed_sections():
    """Idempotently create HomepageSection rows with default values."""
    for defaults in _SECTION_DEFAULTS:
        key = defaults.pop("section_key")
        HomepageSection.objects.get_or_create(
            section_key=key, defaults=defaults
        )
        defaults["section_key"] = key  # restore for potential re-calls


class HomePageView(APIView):
    """
    GET /api/v1/home/
    Returns all published homepage data in a single response.
    Seeds section defaults on first call.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        _seed_sections()

        hero = HeroSection.load()
        sections = {
            s.section_key: HomepageSectionSerializer(s).data
            for s in HomepageSection.objects.all().order_by("order")
        }
        stats = StatisticCard.objects.filter(is_published=True).order_by("order")
        partners = PartnerLogo.objects.filter(is_published=True).order_by("order")
        tech_items = TechItem.objects.filter(is_published=True).order_by("order")
        services = ServiceItem.objects.filter(is_published=True).order_by("order")

        return Response(
            {
                "hero": HeroSectionSerializer(
                    hero, context={"request": request}
                ).data,
                "sections": sections,
                "statistics": StatisticCardSerializer(stats, many=True).data,
                "partners": PartnerLogoSerializer(
                    partners, context={"request": request}, many=True
                ).data,
                "tech_items": TechItemSerializer(tech_items, many=True).data,
                "services": ServiceItemSerializer(services, many=True).data,
            }
        )


# ─── Hero ──────────────────────────────────────────────────────────────────

class HeroSectionView(generics.RetrieveUpdateAPIView):
    serializer_class = HeroSectionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_object(self):
        return HeroSection.load()


class HeroButtonListView(generics.ListCreateAPIView):
    serializer_class = HeroButtonSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return HeroButton.objects.filter(
            hero=HeroSection.load(), is_published=True
        ).order_by("order")

    def perform_create(self, serializer):
        serializer.save(hero=HeroSection.load())


class HeroButtonDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HeroButtonSerializer
    queryset = HeroButton.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


# ─── Statistics ────────────────────────────────────────────────────────────

class StatisticListView(generics.ListCreateAPIView):
    serializer_class = StatisticCardSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return StatisticCard.objects.filter(is_published=True).order_by("order")


class StatisticDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StatisticCardSerializer
    queryset = StatisticCard.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


# ─── Partners ──────────────────────────────────────────────────────────────

class PartnerListView(generics.ListCreateAPIView):
    serializer_class = PartnerLogoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return PartnerLogo.objects.filter(is_published=True).order_by("order")


class PartnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PartnerLogoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = PartnerLogo.objects.all()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


# ─── Sections ──────────────────────────────────────────────────────────────

class SectionListView(generics.ListAPIView):
    serializer_class = HomepageSectionSerializer
    permission_classes = [permissions.AllowAny]
    queryset = HomepageSection.objects.all().order_by("order")


class SectionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = HomepageSectionSerializer
    queryset = HomepageSection.objects.all()
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
