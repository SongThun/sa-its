from urllib.parse import urlparse

from apps.content.storage.base import ContentStorage


class ExternalUrlStorage(ContentStorage):
    storage_type = "external_url"

    def store(self, content_data: dict) -> dict:
        return {
            "storage_type": self.storage_type,
            "url": content_data.get("url", ""),
            "title": content_data.get("title", ""),
        }

    def retrieve(self, storage_metadata: dict) -> dict:
        return {
            "url": storage_metadata.get("url", ""),
            "title": storage_metadata.get("title", ""),
            "storage_type": self.storage_type,
        }

    def delete(self, storage_metadata: dict) -> bool:
        return True

    def validate(self, content_data: dict) -> bool:
        url = content_data.get("url", "")
        if not url:
            return False
        parsed = urlparse(url)
        return bool(parsed.scheme and parsed.netloc)
