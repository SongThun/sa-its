from django.utils import timezone

from apps.learning_activities.models import Enrollment, LessonProgress


class LessonProgressService:
    def complete_lesson(self, enrollment: Enrollment, lesson_id) -> LessonProgress:
        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson_id=lesson_id,
            defaults={"is_completed": True, "completed_at": timezone.now()},
        )

        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save(update_fields=["is_completed", "completed_at", "updated_at"])

        return progress

    def uncomplete_lesson(self, enrollment: Enrollment, lesson_id) -> bool:
        updated = LessonProgress.objects.filter(
            enrollment=enrollment, lesson_id=lesson_id, is_completed=True
        ).update(is_completed=False, completed_at=None, updated_at=timezone.now())

        return updated > 0

    def get_completed_lessons(self, enrollment: Enrollment) -> list:
        return list(
            LessonProgress.objects.filter(
                enrollment=enrollment, is_completed=True
            ).values_list("lesson_id", flat=True)
        )

    def count_completed_lessons(self, enrollment: Enrollment) -> int:
        return LessonProgress.objects.filter(
            enrollment=enrollment, is_completed=True
        ).count()

    def count_completed_lessons_in_module(
        self, enrollment: Enrollment, lesson_ids: list
    ) -> int:
        return LessonProgress.objects.filter(
            enrollment=enrollment,
            lesson_id__in=lesson_ids,
            is_completed=True,
        ).count()
