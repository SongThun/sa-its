from decimal import Decimal
from django.utils import timezone

from apps.learning_activities.models import Enrollment, ModuleProgress


class ModuleProgressService:
    def update_module_progress(
        self,
        enrollment: Enrollment,
        module_id,
        total_lessons: int,
        completed_count: int,
    ) -> ModuleProgress | None:
        if total_lessons == 0:
            return None

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

        return module_progress

    def get_completed_modules(self, enrollment: Enrollment) -> list:
        return list(
            ModuleProgress.objects.filter(
                enrollment=enrollment, is_completed=True
            ).values_list("module_id", flat=True)
        )
