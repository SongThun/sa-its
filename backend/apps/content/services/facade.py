from typing import Dict, Any, Optional, Tuple
from django.db.models import QuerySet

from apps.content.models import Course, Module, Lesson
from apps.content.services.course import CourseService
from apps.content.services.module import ModuleService
from apps.content.services.lesson import LessonService


class ContentFacade:
    def __init__(
        self,
        course_service: CourseService = None,
        module_service: ModuleService = None,
        lesson_service: LessonService = None,
    ):
        self.courses = course_service or CourseService()
        self.modules = module_service or ModuleService()
        self.lessons = lesson_service or LessonService()

    def get_public_course_modules(
        self, course_id
    ) -> Tuple[Optional[Course], Optional[QuerySet[Module]]]:
        course = self.courses.get_published_by_id(course_id)
        if course is None:
            return None, None

        modules = self.modules.get_by_parent(course_id).filter(is_published=True)
        return course, modules

    def get_public_module_lessons(
        self, module_id
    ) -> Tuple[Optional[Module], Optional[QuerySet[Lesson]]]:
        module = self.modules.get_by_id(module_id)
        if module is None:
            return None, None

        if not module.course.is_published:
            return None, None

        lessons = self.lessons.get_by_parent(module_id).filter(is_published=True)
        return module, lessons

    def get_instructor_course_modules(
        self, instructor, course_id
    ) -> Tuple[Optional[Course], Optional[QuerySet[Module]]]:
        course = self.courses.get_for_instructor(course_id, instructor)
        if course is None:
            return None, None

        modules = self.modules.get_by_parent(course_id)
        return course, modules

    def get_instructor_module_lessons(
        self, instructor, module_id
    ) -> Tuple[Optional[Module], Optional[QuerySet[Lesson]]]:
        module = self.modules.get_for_instructor(module_id, instructor)
        if module is None:
            return None, None

        lessons = self.lessons.get_by_parent(module_id)
        return module, lessons

    def get_course_modules_for_user(
        self, course_id, user=None
    ) -> Tuple[Optional[Course], Optional[QuerySet[Module]]]:
        if user and user.is_authenticated:
            course = self.courses.get_for_instructor(course_id, user)
            if course:
                modules = self.modules.get_by_parent(course_id)
                return course, modules

        return self.get_public_course_modules(course_id)

    def get_module_lessons_for_user(
        self, module_id, user=None
    ) -> Tuple[Optional[Module], Optional[QuerySet[Lesson]]]:
        if user and user.is_authenticated:
            module = self.modules.get_for_instructor(module_id, user)
            if module:
                lessons = self.lessons.get_by_parent(module_id)
                return module, lessons

        return self.get_public_module_lessons(module_id)

    def add_module_to_course(
        self, instructor, course_id, data: dict
    ) -> Optional[Module]:
        course = self.courses.get_for_instructor(course_id, instructor)
        if course is None:
            return None
        return self.modules.create_for_parent(course, data)

    def add_lesson_to_module(
        self, instructor, module_id, data: dict
    ) -> Optional[Lesson]:
        module = self.modules.get_for_instructor(module_id, instructor)
        if module is None:
            return None

        topic_ids = data.pop("topic_ids", [])
        lesson = self.lessons.create_for_parent(module, data)

        if topic_ids:
            self.lessons.set_topics(lesson, topic_ids)

        return lesson

    def resolve_module_update(
        self, instructor, module_id, data: Dict[str, Any]
    ) -> Tuple[Optional[Module], Optional[Dict[str, Any]]]:
        module = self.modules.get_for_instructor(module_id, instructor)
        if module is None:
            return None, None
        return module, data

    def resolve_lesson_update(
        self, instructor, lesson_id, data: Dict[str, Any]
    ) -> Tuple[Optional[Lesson], Optional[Dict[str, Any]], Optional[list]]:
        lesson = self.lessons.get_for_instructor(lesson_id, instructor)
        if lesson is None:
            return None, None, None

        resolved = data.copy()
        topic_ids = resolved.pop("topic_ids", None)
        return lesson, resolved, topic_ids

    def get_lesson_module_id(self, lesson_id):
        return self.lessons.get_parent_id(lesson_id)

    def count_published_lessons_in_course(self, course_id) -> int:
        return self.lessons.count_published_in_course(course_id)

    def count_published_lessons_in_module(self, module_id) -> int:
        return self.lessons.count_published_in_module(module_id)

    def get_published_lesson_ids_in_module(self, module_id) -> list:
        return self.lessons.get_published_ids_in_module(module_id)

    def lesson_exists_in_course(self, lesson_id, course_id) -> bool:
        return self.lessons.exists_in_course(lesson_id, course_id)
