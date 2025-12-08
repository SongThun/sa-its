from apps.content.models import Module, Course
from apps.content.services.mixins import (
    QueryMixin,
    PublishableMixin,
    InstructorMixin,
    ChildContentMixin,
)


class ModuleService(
    QueryMixin[Module],
    PublishableMixin[Module],
    InstructorMixin[Module],
    ChildContentMixin[Module, Course],
):
    model = Module
    instructor_path = "course__instructor"
    parent_field = "course"
