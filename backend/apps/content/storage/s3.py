from apps.content.storage.base import ContentStorage


class S3Storage(ContentStorage):
    storage_type = "s3"

    def __init__(self, bucket_name: str = "", region: str = ""):
        self.bucket_name = bucket_name
        self.region = region

    def store(self, content_data: dict) -> dict:
        raise NotImplementedError("S3 storage not yet implemented")

    def retrieve(self, storage_metadata: dict) -> dict:
        raise NotImplementedError("S3 storage not yet implemented")

    def delete(self, storage_metadata: dict) -> bool:
        raise NotImplementedError("S3 storage not yet implemented")

    def validate(self, content_data: dict) -> bool:
        raise NotImplementedError("S3 storage not yet implemented")
