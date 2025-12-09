from apps.learning_activities.services.enrollment import EnrollmentFacade
from apps.learning_activities.services.facade import LearningProgressFacade

# Facades (queries + mutations)
enrollment_facade = EnrollmentFacade()
learning_progress_facade = LearningProgressFacade()

__all__ = [
    "enrollment_facade",
    "learning_progress_facade",
]
