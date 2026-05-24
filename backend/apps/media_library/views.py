import io
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsEditorOrReadOnly
from .models import MediaAsset
from .serializers import MediaAssetSerializer, MediaUploadSerializer


def _try_make_thumbnail(asset: MediaAsset) -> None:
    if asset.asset_type != MediaAsset.AssetType.IMAGE:
        return
    try:
        from PIL import Image

        asset.file.seek(0)
        img = Image.open(asset.file)
        img.thumbnail((400, 400))
        img_io = io.BytesIO()
        fmt = img.format or "JPEG"
        img.save(img_io, format=fmt)
        img_io.seek(0)

        from django.core.files.base import ContentFile

        ext = asset.original_filename.rsplit(".", 1)[-1].lower() if "." in asset.original_filename else "jpg"
        thumb_name = f"thumb_{asset.original_filename.rsplit('.', 1)[0]}.{ext}"
        asset.thumbnail.save(thumb_name, ContentFile(img_io.read()), save=False)
    except Exception:
        pass  # thumbnail is optional — never block the upload


class MediaAssetListView(generics.ListAPIView):
    serializer_class   = MediaAssetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = MediaAsset.objects.select_related("uploaded_by").all()

        asset_type = self.request.query_params.get("type")
        if asset_type:
            qs = qs.filter(asset_type=asset_type)

        folder = self.request.query_params.get("folder")
        if folder is not None:
            qs = qs.filter(folder=folder)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(original_filename__icontains=search)
            )

        return qs


class MediaAssetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = MediaAssetSerializer
    permission_classes = [IsEditorOrReadOnly]
    queryset           = MediaAsset.objects.select_related("uploaded_by").all()

    def perform_destroy(self, instance):
        instance.delete()  # post_delete signal handles file cleanup


class MediaUploadView(APIView):
    parser_classes     = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = MediaUploadSerializer(data={
            "files":  request.FILES.getlist("files"),
            "folder": request.data.get("folder", ""),
        })
        ser.is_valid(raise_exception=True)

        folder     = ser.validated_data["folder"]
        created    = []

        for uploaded in ser.validated_data["files"]:
            asset = MediaAsset.from_file(uploaded, folder=folder, uploaded_by=request.user)
            asset.save()
            _try_make_thumbnail(asset)
            if asset.thumbnail:
                MediaAsset.objects.filter(pk=asset.pk).update(thumbnail=asset.thumbnail.name)
            created.append(asset)

        out = MediaAssetSerializer(created, many=True, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)


class MediaFoldersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        folders = (
            MediaAsset.objects
            .exclude(folder="")
            .values_list("folder", flat=True)
            .distinct()
            .order_by("folder")
        )
        return Response(list(folders))
