from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.content.serializers import CategorySerializer
from apps.content.services import ContentFacade


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for categories."""

    queryset = ContentFacade.get_all_category()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
