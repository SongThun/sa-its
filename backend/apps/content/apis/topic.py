from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny

from apps.content.serializers import TopicSerializer
from apps.content.services import ContentFacade


class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for topics."""

    serializer_class = TopicSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "slug", "description"]

    def get_queryset(self):
        return ContentFacade.get_all_topics()
