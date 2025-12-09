from apps.content.storage import content_storage_service


class LessonContentService:
    def __init__(self, storage_service=None):
        self._storage_service = storage_service or content_storage_service

    def get_lesson_content(self, lesson) -> dict:
        if lesson.content_data:
            return self._storage_service.retrieve(lesson.content_data)
        if lesson.content:
            return {"main_content": lesson.content}
        return {}

    def set_lesson_content(
        self, lesson, content_data: dict, storage_type: str = None
    ) -> None:
        lesson.content_data = self._storage_service.store(content_data, storage_type)
        lesson.save(update_fields=["content_data", "updated_at"])
