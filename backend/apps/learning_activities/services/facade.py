from dataclasses import dataclass

from apps.learning_activities.models import Enrollment
from apps.learning_activities.services.lesson_progress import LessonProgressService
from apps.learning_activities.services.module_progress import ModuleProgressService
from apps.learning_activities.services.enrollment_progress import (
    EnrollmentProgressService,
)


@dataclass
class ProgressResult:
    success: bool
    progress: dict | None = None
    error: str | None = None


class LearningProgressFacade:
    """Facade for learning progress operations - coordinates lesson, module, and enrollment progress."""

    def __init__(
        self,
        content_facade=None,
        lesson_progress_service=None,
        module_progress_service=None,
        enrollment_progress_service=None,
    ):
        self._content_facade = content_facade
        self._lesson_progress = lesson_progress_service or LessonProgressService()
        self._module_progress = module_progress_service or ModuleProgressService()
        self._enrollment_progress = (
            enrollment_progress_service or EnrollmentProgressService()
        )

    @property
    def content_facade(self):
        if self._content_facade is None:
            from apps.content.services import content_facade

            self._content_facade = content_facade
        return self._content_facade

    # ==================== Queries ====================

    def get_course_progress(self, enrollment: Enrollment) -> dict:
        completed_lessons = self._lesson_progress.get_completed_lessons(enrollment)
        completed_modules = self._module_progress.get_completed_modules(enrollment)

        return {
            "enrollment_id": str(enrollment.id),
            "course_id": str(enrollment.course_id),
            "progress": float(enrollment.progress_percent),
            "status": enrollment.status,
            "completedLessons": [str(lid) for lid in completed_lessons],
            "completedModules": [str(mid) for mid in completed_modules],
            "last_accessed_at": enrollment.last_accessed_at,
            "completed_at": enrollment.completed_at,
        }

    # ==================== Mutations ====================

    def complete_lesson(self, enrollment: Enrollment, lesson_id) -> ProgressResult:
        """Complete a lesson for an enrollment."""
        if not self.content_facade.lesson_exists_in_course(
            lesson_id, enrollment.course_id
        ):
            return ProgressResult(
                success=False, error="Lesson not found in this course"
            )

        self._lesson_progress.complete_lesson(enrollment, lesson_id)
        self._recalculate_progress(enrollment, lesson_id)

        progress = self.get_course_progress(enrollment)
        return ProgressResult(success=True, progress=progress)

    def uncomplete_lesson(self, enrollment: Enrollment, lesson_id) -> ProgressResult:
        """Uncomplete a lesson for an enrollment."""
        result = self._lesson_progress.uncomplete_lesson(enrollment, lesson_id)
        if not result:
            return ProgressResult(
                success=False, error="Lesson was not marked as completed"
            )

        self._recalculate_progress(enrollment, lesson_id)

        progress = self.get_course_progress(enrollment)
        return ProgressResult(success=True, progress=progress)

    # ==================== Internal ====================

    def _recalculate_progress(self, enrollment: Enrollment, lesson_id) -> None:
        module_id = self.content_facade.get_module_id_for_lesson(lesson_id)
        if module_id:
            self._recalculate_module_progress(enrollment, module_id)

        self._recalculate_enrollment_progress(enrollment)

    def _recalculate_module_progress(self, enrollment: Enrollment, module_id) -> None:
        total_lessons = self.content_facade.count_published_lessons_in_module(module_id)
        lesson_ids = self.content_facade.get_published_lesson_ids_in_module(module_id)
        completed_count = self._lesson_progress.count_completed_lessons_in_module(
            enrollment, lesson_ids
        )

        self._module_progress.update_module_progress(
            enrollment, module_id, total_lessons, completed_count
        )

    def _recalculate_enrollment_progress(self, enrollment: Enrollment) -> None:
        total_lessons = self.content_facade.count_published_lessons_in_course(
            enrollment.course_id
        )
        completed_count = self._lesson_progress.count_completed_lessons(enrollment)

        self._enrollment_progress.update_enrollment_progress(
            enrollment, total_lessons, completed_count
        )
