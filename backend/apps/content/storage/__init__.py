from apps.content.storage.base import ContentStorage, StorageRegistry
from apps.content.storage.external import ExternalUrlStorage
from apps.content.storage.s3 import S3Storage


class ContentStorageService:
    _default_storage_type: str = "external_url"

    def _get_handler(self, storage_type: str) -> ContentStorage:
        handler = StorageRegistry.get_handler(storage_type)
        if not handler:
            raise ValueError(f"Unknown storage type: {storage_type}")
        return handler

    def store(self, content_data: dict, storage_type: str = None) -> dict:
        storage_type = storage_type or self._default_storage_type
        handler = self._get_handler(storage_type)
        if not handler.validate(content_data):
            raise ValueError("Invalid content data")
        return handler.store(content_data)

    def retrieve(self, storage_metadata: dict) -> dict:
        storage_type = storage_metadata.get("storage_type", self._default_storage_type)
        handler = self._get_handler(storage_type)
        return handler.retrieve(storage_metadata)

    def delete(self, storage_metadata: dict) -> bool:
        storage_type = storage_metadata.get("storage_type", self._default_storage_type)
        handler = self._get_handler(storage_type)
        return handler.delete(storage_metadata)


content_storage_service = ContentStorageService()

__all__ = [
    "ContentStorage",
    "ExternalUrlStorage",
    "S3Storage",
    "ContentStorageService",
    "content_storage_service",
]
