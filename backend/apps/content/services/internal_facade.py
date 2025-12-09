from apps.content.services.query import ContentQueryService
from apps.content.services.authority import InstructorAuthorityService
from apps.content.services.lesson_content import LessonContentService


class ContentInternalFacade:
    """Facade for internal content module operations."""

    def __init__(
        self,
        query_service=None,
        authority_service=None,
        lesson_content_service=None,
    ):
        self._query = query_service or ContentQueryService()
        self._authority = authority_service or InstructorAuthorityService()
        self._lesson_content = lesson_content_service or LessonContentService()

    # === Query operations ===
    def get_all_categories(self):
        return self._query.get_all_categories()

    def get_all_topics(self):
        return self._query.get_all_topics()

    def get_instructor_courses_with_details(self, user):
        return self._query.get_instructor_courses_with_details(user)

    def get_instructor_modules_with_lessons(self, user):
        return self._query.get_instructor_modules_with_lessons(user)

    def get_instructor_lessons_with_topics(self, user):
        return self._query.get_instructor_lessons_with_topics(user)

    def get_published_courses_with_content(self):
        return self._query.get_published_courses_with_content()

    # === Authority operations ===
    def is_course_owner(self, user, course_id) -> bool:
        return self._authority.is_course_owner(user, course_id)

    def is_module_owner(self, user, module_id) -> bool:
        return self._authority.is_module_owner(user, module_id)

    def is_lesson_owner(self, user, lesson_id) -> bool:
        return self._authority.is_lesson_owner(user, lesson_id)

    # === Lesson content operations ===
    def get_lesson_content(self, lesson) -> dict:
        return self._lesson_content.get_lesson_content(lesson)

    def set_lesson_content(self, lesson, content_data: dict, storage_type: str = None):
        return self._lesson_content.set_lesson_content(
            lesson, content_data, storage_type
        )
