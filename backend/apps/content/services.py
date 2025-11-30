from django.db.models import QuerySet
from typing import Dict, Any

from apps.content.models import Course, Module, Category, Lesson, Topic


class CategoryService:
    @staticmethod
    def get_all() -> QuerySet:
        return Category.objects.all()

    @staticmethod
    def get_by_id(category_id) -> Category | None:
        try:
            return Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return None


class TopicService:
    @staticmethod
    def get_all() -> QuerySet:
        return Topic.objects.all().order_by("name")

    @staticmethod
    def get_by_ids(topic_ids: list) -> QuerySet:
        return Topic.objects.filter(id__in=topic_ids)


class CourseService:
    @staticmethod
    def get_all() -> QuerySet:
        return Course.objects.all()

    @staticmethod
    def get_published() -> QuerySet:
        return Course.objects.filter(is_published=True)

    @staticmethod
    def get_by_id(course_id) -> Course | None:
        try:
            return Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return None

    @staticmethod
    def get_published_by_id(course_id) -> Course | None:
        try:
            return Course.objects.get(id=course_id, is_published=True)
        except Course.DoesNotExist:
            return None

    @staticmethod
    def get_by_instructor(instructor) -> QuerySet:
        return Course.objects.filter(instructor=instructor)

    @staticmethod
    def exists(course_id) -> bool:
        return Course.objects.filter(id=course_id).exists()

    @staticmethod
    def published_exists(course_id) -> bool:
        return Course.objects.filter(id=course_id, is_published=True).exists()

    @staticmethod
    def publish(course: Course) -> None:
        if not course.is_published:
            course.is_published = True
            course.save(update_fields=["is_published", "updated_at"])

    @staticmethod
    def unpublish(course: Course) -> None:
        if course.is_published:
            course.is_published = False
            course.save(update_fields=["is_published", "updated_at"])


class ModuleService:
    @staticmethod
    def get_by_instructor(instructor) -> QuerySet:
        return Module.objects.filter(course__instructor=instructor)

    @staticmethod
    def get_by_id(module_id) -> Module | None:
        try:
            return Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return None

    @staticmethod
    def get_by_course(course_id) -> QuerySet:
        return Module.objects.filter(course_id=course_id)

    @staticmethod
    def create(course: Course, module_data: dict) -> Module:
        return Module.objects.create(**module_data, course=course)

    @staticmethod
    def publish(module: Module) -> None:
        if not module.is_published:
            module.is_published = True
            module.save(update_fields=["is_published", "updated_at"])

    @staticmethod
    def unpublish(module: Module) -> None:
        if module.is_published:
            module.is_published = False
            module.save(update_fields=["is_published", "updated_at"])


class LessonService:
    @staticmethod
    def get_by_instructor(instructor) -> QuerySet:
        return Lesson.objects.filter(module__course__instructor=instructor)

    @staticmethod
    def get_by_id(lesson_id) -> Lesson | None:
        try:
            return Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return None

    @staticmethod
    def get_by_module(module_id) -> QuerySet:
        return Lesson.objects.filter(module_id=module_id)

    @staticmethod
    def exists_in_course(lesson_id, course_id) -> bool:
        return Lesson.objects.filter(
            id=lesson_id,
            module__course_id=course_id,
        ).exists()

    @staticmethod
    def get_module_id(lesson_id):
        try:
            return Lesson.objects.values_list("module_id", flat=True).get(id=lesson_id)
        except Lesson.DoesNotExist:
            return None

    @staticmethod
    def count_published_in_course(course_id) -> int:
        return Lesson.objects.filter(
            module__course_id=course_id,
            is_published=True,
            module__is_published=True,
        ).count()

    @staticmethod
    def count_published_in_module(module_id) -> int:
        return Lesson.objects.filter(
            module_id=module_id,
            is_published=True,
        ).count()

    @staticmethod
    def get_published_ids_in_module(module_id) -> list:
        return list(
            Lesson.objects.filter(
                module_id=module_id,
                is_published=True,
            ).values_list("id", flat=True)
        )

    @staticmethod
    def create(module: Module, lesson_data: dict) -> Lesson:
        return Lesson.objects.create(**lesson_data, module=module)

    @staticmethod
    def set_topics(lesson: Lesson, topic_ids: list) -> None:
        if topic_ids is not None:
            lesson.topics.set(Topic.objects.filter(id__in=topic_ids))

    @staticmethod
    def publish(lesson: Lesson) -> None:
        if not lesson.is_published:
            lesson.is_published = True
            lesson.save(update_fields=["is_published", "updated_at"])

    @staticmethod
    def unpublish(lesson: Lesson) -> None:
        if lesson.is_published:
            lesson.is_published = False
            lesson.save(update_fields=["is_published", "updated_at"])


class ContentFacade:
    get_all_category = CategoryService.get_all

    get_all_topics = TopicService.get_all
    get_topics_by_ids = TopicService.get_by_ids
    set_lesson_topics = LessonService.set_topics

    get_published_courses = CourseService.get_published
    get_published_course_by_id = CourseService.get_published_by_id
    get_course_by_id = CourseService.get_by_id
    course_exists = CourseService.exists
    published_course_exists = CourseService.published_exists
    get_courses_for_instructor = CourseService.get_by_instructor
    publish_course = CourseService.publish
    unpublish_course = CourseService.unpublish

    get_modules_for_instructor = ModuleService.get_by_instructor
    publish_module = ModuleService.publish
    unpublish_module = ModuleService.unpublish

    get_lessons_for_instructor = LessonService.get_by_instructor
    lesson_exists_in_course = LessonService.exists_in_course
    get_module_id_for_lesson = LessonService.get_module_id
    count_published_lessons_in_course = LessonService.count_published_in_course
    count_published_lessons_in_module = LessonService.count_published_in_module
    get_published_lesson_ids_in_module = LessonService.get_published_ids_in_module
    publish_lesson = LessonService.publish
    unpublish_lesson = LessonService.unpublish

    @staticmethod
    def resolve_course_fks(course_data: Dict[str, Any]) -> Dict[str, Any] | None:
        resolved_data = course_data.copy()
        category_id = resolved_data.pop("category_id", None)

        if category_id is not None:
            category = CategoryService.get_by_id(category_id)
            if category is None:
                return None
            resolved_data["category"] = category

        return resolved_data

    @staticmethod
    def add_module_to_course(instructor, course_id, module_data) -> Module | None:
        try:
            course = Course.objects.get(instructor=instructor, id=course_id)
        except Course.DoesNotExist:
            return None
        return ModuleService.create(course, module_data)

    @staticmethod
    def resolve_module_update(
        instructor, module_id, module_data: Dict[str, Any]
    ) -> tuple[Module, Dict[str, Any]] | tuple[None, None]:
        try:
            module = Module.objects.get(course__instructor=instructor, id=module_id)
        except Module.DoesNotExist:
            return None, None
        return module, module_data

    @staticmethod
    def add_lesson_to_module(instructor, module_id, lesson_data) -> Lesson | None:
        try:
            module = Module.objects.get(course__instructor=instructor, id=module_id)
        except Module.DoesNotExist:
            return None

        topic_ids = lesson_data.pop("topic_ids", [])
        lesson = LessonService.create(module, lesson_data)

        if topic_ids:
            LessonService.set_topics(lesson, topic_ids)

        return lesson

    @staticmethod
    def resolve_lesson_update(
        instructor, lesson_id, lesson_data: Dict[str, Any]
    ) -> tuple[Lesson, Dict[str, Any], list] | tuple[None, None, None]:
        try:
            lesson = Lesson.objects.get(
                module__course__instructor=instructor, id=lesson_id
            )
        except Lesson.DoesNotExist:
            return None, None, None

        resolved_data = lesson_data.copy()
        topic_ids = resolved_data.pop("topic_ids", None)

        return lesson, resolved_data, topic_ids

    @staticmethod
    def get_course_statistics(course: Course) -> dict:
        modules = course.modules.all()
        total_lessons = 0
        total_duration = 0
        published_lessons = 0

        for module in modules:
            lessons = module.lessons.all()
            total_lessons += lessons.count()
            published_lessons += lessons.filter(is_published=True).count()
            total_duration += sum(lesson.estimated_duration for lesson in lessons)

        return {
            "total_modules": modules.count(),
            "published_modules": modules.filter(is_published=True).count(),
            "total_lessons": total_lessons,
            "published_lessons": published_lessons,
            "total_duration_minutes": total_duration,
        }
