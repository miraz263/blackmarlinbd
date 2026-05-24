from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AIGeneratedContent, AISession
from .serializers import (
    AIGeneratedContentSerializer,
    AISessionSerializer,
    BlogRequestSerializer,
    ChatRequestSerializer,
    FAQRequestSerializer,
    LeadRequestSerializer,
    SEORequestSerializer,
)
from . import services


def _store(content_type: str, prompt: str, result: dict, user) -> None:
    provider = result.pop("_provider", "")
    model    = result.pop("_model",    "")
    try:
        AIGeneratedContent.objects.create(
            content_type=content_type,
            prompt=prompt,
            result=result,
            provider=provider,
            model=model,
            created_by=user,
        )
    except Exception:
        pass


class BlogWriterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = BlogRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        try:
            result = services.generate_blog(
                topic=d["topic"],
                keywords=d.get("keywords", []),
                tone=d["tone"],
                length=d["length"],
                user=request.user,
                provider_name=d.get("provider"),
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        _store("blog", d["topic"], result, request.user)
        return Response(result)


class SEOView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = SEORequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        try:
            result = services.analyze_seo(
                content=d["content"],
                target_keywords=d.get("target_keywords", []),
                page_url=d.get("page_url", ""),
                user=request.user,
                provider_name=d.get("provider"),
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        prompt = d.get("page_url") or d["content"][:200]
        _store("seo", prompt, result, request.user)
        return Response(result)


class FAQView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = FAQRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        try:
            result = services.generate_faq(
                topic=d["topic"],
                count=d["count"],
                audience=d["audience"],
                user=request.user,
                provider_name=d.get("provider"),
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        _store("faq", d["topic"], result, request.user)
        return Response(result)


class LeadAnalyzerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = LeadRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        if contact_id := d.get("contact_id"):
            try:
                from apps.contacts.models import Contact
                c = Contact.objects.get(pk=contact_id)
                contact_data = {
                    "name":             c.name,
                    "email":            c.email,
                    "phone":            c.phone,
                    "company":          c.company,
                    "service_interest": c.service,
                    "subject":          c.subject,
                    "message":          c.message,
                    "budget":           c.budget,
                    "current_status":   c.status,
                    "submitted_at":     str(c.created_at.date()),
                }
            except Exception as exc:
                return Response({"error": f"Contact not found: {exc}"}, status=status.HTTP_404_NOT_FOUND)
        else:
            contact_data = d["contact_data"]

        try:
            result = services.analyze_lead(
                contact_data=contact_data,
                user=request.user,
                provider_name=d.get("provider"),
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        name    = contact_data.get("name", "")
        subject = contact_data.get("subject", "")
        _store("lead", f"{name} — {subject}", result, request.user)
        return Response(result)


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get("session_id")
        if session_id:
            try:
                session = AISession.objects.get(pk=session_id, user=request.user)
                return Response(AISessionSerializer(session).data)
            except AISession.DoesNotExist:
                return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

        sessions = AISession.objects.filter(user=request.user).order_by("-updated_at")[:30]
        return Response([
            {
                "id":         s.pk,
                "context":    s.context,
                "title":      s.title or "New Chat",
                "updated_at": s.updated_at,
            }
            for s in sessions
        ])

    def post(self, request):
        ser = ChatRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        if session_id := d.get("session_id"):
            try:
                session = AISession.objects.get(pk=session_id, user=request.user)
            except AISession.DoesNotExist:
                return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = AISession.objects.create(user=request.user, context=d["context"])

        try:
            result = services.chat(
                session=session,
                user_message=d["message"],
                user=request.user,
                provider_name=d.get("provider"),
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result)

    def delete(self, request):
        session_id = request.query_params.get("session_id")
        if not session_id:
            return Response({"error": "session_id required"}, status=status.HTTP_400_BAD_REQUEST)
        AISession.objects.filter(pk=session_id, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AIHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = AIGeneratedContent.objects.filter(created_by=request.user).order_by("-created_at")
        content_type = request.query_params.get("type")
        if content_type:
            qs = qs.filter(content_type=content_type)
        return Response(AIGeneratedContentSerializer(qs[:50], many=True).data)


class AIUsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count, Sum

        from .models import AIUsageLog
        from .providers import AIProviderFactory

        logs = AIUsageLog.objects.filter(created_by=request.user)
        by_feature = list(
            logs.values("feature").annotate(
                count=Count("id"),
                tokens_in=Sum("tokens_input"),
                tokens_out=Sum("tokens_output"),
            )
        )
        for row in by_feature:
            row["tokens"] = (row.pop("tokens_in") or 0) + (row.pop("tokens_out") or 0)

        agg = logs.aggregate(ti=Sum("tokens_input"), to=Sum("tokens_output"))
        total_tokens = (agg["ti"] or 0) + (agg["to"] or 0)

        try:
            available = AIProviderFactory.available()
        except Exception:
            available = []

        return Response({
            "available_providers": available,
            "by_feature":         by_feature,
            "total_tokens":       total_tokens,
        })
