from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsEditorOrReadOnly, IsAdminRole
from .models import Page, Section, Block, BLOCK_DEFAULTS, SECTION_STYLE_DEFAULTS
from .serializers import (
    PageListSerializer, PageDetailSerializer,
    SectionSerializer, BlockSerializer, ReorderItemSerializer,
)


# ─── Pages ────────────────────────────────────────────────────────────────

class PageListView(generics.ListCreateAPIView):
    permission_classes = [IsEditorOrReadOnly]

    def get_serializer_class(self):
        return PageListSerializer

    def get_queryset(self):
        qs = Page.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_editor):
            qs = qs.filter(is_published=True)
        return qs


class PageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsEditorOrReadOnly]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT", "POST"):
            return PageListSerializer
        return PageDetailSerializer

    def get_queryset(self):
        qs = Page.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_editor):
            qs = qs.filter(is_published=True)
        return qs

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


# ─── Sections ─────────────────────────────────────────────────────────────

def _get_page(slug, user):
    qs = Page.objects.all()
    if not (user.is_authenticated and user.is_editor):
        qs = qs.filter(is_published=True)
    return get_object_or_404(qs, slug=slug)


class SectionListView(APIView):
    permission_classes = [IsEditorOrReadOnly]

    def post(self, request, slug):
        page = _get_page(slug, request.user)
        next_order = page.sections.count()
        section = Section.objects.create(
            page=page,
            label=request.data.get("label", ""),
            order=next_order,
            style_json=request.data.get("style_json", SECTION_STYLE_DEFAULTS.copy()),
        )
        return Response(SectionSerializer(section, context={"request": request}).data,
                        status=status.HTTP_201_CREATED)


class SectionDetailView(APIView):
    permission_classes = [IsEditorOrReadOnly]

    def _get_section(self, slug, pk):
        return get_object_or_404(Section, pk=pk, page__slug=slug)

    def patch(self, request, slug, pk):
        section = self._get_section(slug, pk)
        for field in ("label", "style_json", "is_published"):
            if field in request.data:
                setattr(section, field, request.data[field])
        section.save()
        return Response(SectionSerializer(section, context={"request": request}).data)

    def delete(self, request, slug, pk):
        section = self._get_section(slug, pk)
        section.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SectionReorderView(APIView):
    permission_classes = [IsEditorOrReadOnly]

    def post(self, request, slug):
        page = _get_page(slug, request.user)
        items = ReorderItemSerializer(data=request.data, many=True)
        items.is_valid(raise_exception=True)
        with transaction.atomic():
            for item in items.validated_data:
                Section.objects.filter(pk=item["id"], page=page).update(order=item["order"])
        return Response({"status": "ok"})


# ─── Blocks ───────────────────────────────────────────────────────────────

class BlockListView(APIView):
    permission_classes = [IsEditorOrReadOnly]

    def post(self, request, slug, section_pk):
        section = get_object_or_404(Section, pk=section_pk, page__slug=slug)
        block_type = request.data.get("block_type", "text")
        if block_type not in [c[0] for c in Block.BlockType.choices]:
            return Response({"block_type": "Invalid block type."}, status=status.HTTP_400_BAD_REQUEST)

        next_order = section.blocks.count()
        block = Block.objects.create(
            section=section,
            block_type=block_type,
            order=next_order,
            content_json=request.data.get("content_json", BLOCK_DEFAULTS.get(block_type, {})),
            style_json=request.data.get("style_json", {}),
        )
        return Response(BlockSerializer(block).data, status=status.HTTP_201_CREATED)


class BlockDetailView(APIView):
    permission_classes = [IsEditorOrReadOnly]

    def _get_block(self, slug, section_pk, pk):
        return get_object_or_404(Block, pk=pk, section_id=section_pk, section__page__slug=slug)

    def patch(self, request, slug, section_pk, pk):
        block = self._get_block(slug, section_pk, pk)
        for field in ("content_json", "style_json", "is_published", "order"):
            if field in request.data:
                setattr(block, field, request.data[field])
        block.save()
        return Response(BlockSerializer(block).data)

    def delete(self, request, slug, section_pk, pk):
        block = self._get_block(slug, section_pk, pk)
        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BlockReorderView(APIView):
    permission_classes = [IsEditorOrReadOnly]

    def post(self, request, slug, section_pk):
        section = get_object_or_404(Section, pk=section_pk, page__slug=slug)
        items = ReorderItemSerializer(data=request.data, many=True)
        items.is_valid(raise_exception=True)
        with transaction.atomic():
            for item in items.validated_data:
                Block.objects.filter(pk=item["id"], section=section).update(order=item["order"])
        return Response({"status": "ok"})
