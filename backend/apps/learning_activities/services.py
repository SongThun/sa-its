from decimal import Decimal
from django.utils import timezone

from apps.learning_activities.models import Enrollment, LessonProgress, ModuleProgress


class EnrollmentService:
    @staticmethod
    def enroll_by_course_id(user, course_id) -> Enrollment:
        enrollment, created = Enrollment.objects.get_or_create(
            student_id=user.id,
            course_id=course_id,
            defaults={"is_active": True, "status": Enrollment.Status.STARTED},
        )

        if not created and not enrollment.is_active:
            enrollment.is_active = True
            enrollment.status = Enrollment.Status.STARTED
            enrollment.save(update_fields=["is_active", "status", "updated_at"])

        return enrollment

    @staticmethod
    def unenroll_by_course_id(user, course_id) -> bool:
        updated = Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).update(is_active=False, updated_at=timezone.now())

        return updated > 0

    @staticmethod
    def is_enrolled(user, course) -> bool:
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course.id, is_active=True
        ).exists()

    @staticmethod
    def is_enrolled_by_course_id(user, course_id) -> bool:
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).exists()

    @staticmethod
    def get_enrollment_by_course_id(user, course_id) -> Enrollment | None:
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).first()

    @staticmethod
    def get_user_enrollments(user):
        return Enrollment.objects.filter(
            student_id=user.id, is_active=True
        ).select_related("course")

    @staticmethod
    def update_last_accessed(enrollment: Enrollment) -> None:
        enrollment.last_accessed_at = timezone.now()
        enrollment.save(update_fields=["last_accessed_at", "updated_at"])


class LearningProgressService:
    @staticmethod
    def complete_lesson(enrollment: Enrollment, lesson_id) -> LessonProgress:
        from apps.content.services import ContentFacade

        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson_id=lesson_id,
            defaults={"is_completed": True, "completed_at": timezone.now()},
        )

        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save(update_fields=["is_completed", "completed_at", "updated_at"])

        facade = ContentFacade()
        module_id = facade.get_lesson_module_id(lesson_id)
        if module_id:
            LearningProgressService._update_module_progress(enrollment, module_id)

        LearningProgressService._update_enrollment_progress(enrollment)

        return progress

    @staticmethod
    def uncomplete_lesson(enrollment: Enrollment, lesson_id) -> bool:
        from apps.content.services import ContentFacade

        updated = LessonProgress.objects.filter(
            enrollment=enrollment, lesson_id=lesson_id, is_completed=True
        ).update(is_completed=False, completed_at=None, updated_at=timezone.now())

        if updated > 0:
            facade = ContentFacade()
            module_id = facade.get_lesson_module_id(lesson_id)
            if module_id:
                LearningProgressService._update_module_progress(enrollment, module_id)

            LearningProgressService._update_enrollment_progress(enrollment)
            return True
        return False

    @staticmethod
    def get_completed_lessons(enrollment: Enrollment) -> list:
        return list(
            LessonProgress.objects.filter(
                enrollment=enrollment, is_completed=True
            ).values_list("lesson_id", flat=True)
        )

    @staticmethod
    def get_completed_modules(enrollment: Enrollment) -> list:
        return list(
            ModuleProgress.objects.filter(
                enrollment=enrollment, is_completed=True
            ).values_list("module_id", flat=True)
        )

    @staticmethod
    def get_course_progress(enrollment: Enrollment) -> dict:
        completed_lessons = LearningProgressService.get_completed_lessons(enrollment)
        completed_modules = LearningProgressService.get_completed_modules(enrollment)
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

    @staticmethod
    def _update_enrollment_progress(enrollment: Enrollment) -> None:
        from apps.content.services import ContentFacade

        facade = ContentFacade()
        total_lessons = facade.count_published_lessons_in_course(enrollment.course_id)

        if total_lessons == 0:
            return

        completed_count = LessonProgress.objects.filter(
            enrollment=enrollment, is_completed=True
        ).count()

        progress_percent = Decimal(completed_count) / Decimal(total_lessons) * 100
        progress_percent = min(progress_percent, Decimal("100.00"))

        if progress_percent >= 100:
            status = Enrollment.Status.COMPLETED
            completed_at = timezone.now()
        elif progress_percent > 0:
            status = Enrollment.Status.IN_PROGRESS
            completed_at = None
        else:
            status = Enrollment.Status.STARTED
            completed_at = None

        enrollment.progress_percent = progress_percent
        enrollment.status = status
        enrollment.completed_at = completed_at
        enrollment.last_accessed_at = timezone.now()
        enrollment.save(
            update_fields=[
                "progress_percent",
                "status",
                "completed_at",
                "last_accessed_at",
                "updated_at",
            ]
        )

    @staticmethod
    def _update_module_progress(enrollment: Enrollment, module_id) -> None:
        from apps.content.services import ContentFacade

        facade = ContentFacade()
        total_lessons = facade.count_published_lessons_in_module(module_id)

        if total_lessons == 0:
            return

        lesson_ids_in_module = facade.get_published_lesson_ids_in_module(module_id)

        completed_count = LessonProgress.objects.filter(
            enrollment=enrollment,
            lesson_id__in=lesson_ids_in_module,
            is_completed=True,
        ).count()

        progress_percent = Decimal(completed_count) / Decimal(total_lessons) * 100
        progress_percent = min(progress_percent, Decimal("100.00"))

        is_completed = completed_count >= total_lessons
        completed_at = timezone.now() if is_completed else None

        module_progress, created = ModuleProgress.objects.get_or_create(
            enrollment=enrollment,
            module_id=module_id,
            defaults={
                "is_completed": is_completed,
                "completed_at": completed_at,
                "progress_percent": progress_percent,
            },
        )

        if not created:
            module_progress.is_completed = is_completed
            module_progress.completed_at = completed_at
            module_progress.progress_percent = progress_percent
            module_progress.save(
                update_fields=[
                    "is_completed",
                    "completed_at",
                    "progress_percent",
                    "updated_at",
                ]
            )
