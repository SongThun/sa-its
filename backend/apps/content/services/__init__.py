from apps.content.services.facade import ContentExternalFacade
from apps.content.services.internal_facade import ContentInternalFacade

# External facade for other modules (uses IDs only)
content_facade = ContentExternalFacade()

# Internal facade for content module
content_internal_facade = ContentInternalFacade()

__all__ = [
    "content_facade",
    "content_internal_facade",
]
