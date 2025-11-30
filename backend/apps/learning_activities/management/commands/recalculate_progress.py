from django.core.management.base import BaseCommand

from apps.learning_activities.models import Enrollment
from apps.learning_activities.services import LearningProgressService


class Command(BaseCommand):
    help = "Recalculate progress for all enrollments based on actual LessonProgress records"

    def handle(self, *args, **options):
        enrollments = Enrollment.objects.filter(is_active=True)
        total = enrollments.count()

        self.stdout.write(f"Recalculating progress for {total} enrollments...")

        for i, enrollment in enumerate(enrollments, 1):
            old_progress = enrollment.progress_percent
            LearningProgressService._update_enrollment_progress(enrollment)
            enrollment.refresh_from_db()
            new_progress = enrollment.progress_percent

            if old_progress != new_progress:
                self.stdout.write(
                    f"  [{i}/{total}] {enrollment.student.email} - {enrollment.course.title}: "
                    f"{old_progress}% -> {new_progress}%"
                )

        self.stdout.write(self.style.SUCCESS(f"Done! Processed {total} enrollments."))
