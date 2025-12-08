from typing import TypeVar, Generic, Optional
from django.db.models import Model, QuerySet

T = TypeVar("T", bound=Model)
P = TypeVar("P", bound=Model)


class QueryMixin(Generic[T]):
    """Basic CRUD operations using Django ORM."""

    model: type[T]

    def get_all(self) -> QuerySet[T]:
        return self.model.objects.all()

    def get_by_id(self, id) -> Optional[T]:
        try:
            return self.model.objects.get(id=id)
        except self.model.DoesNotExist:
            return None

    def exists(self, id) -> bool:
        return self.model.objects.filter(id=id).exists()

    def create(self, **kwargs) -> T:
        return self.model.objects.create(**kwargs)

    def delete(self, entity: T) -> None:
        entity.delete()


class PublishableMixin(Generic[T]):
    """Publish/unpublish operations for content with is_published field."""

    model: type[T]

    def get_published(self) -> QuerySet[T]:
        return self.model.objects.filter(is_published=True)

    def get_published_by_id(self, id) -> Optional[T]:
        try:
            return self.model.objects.get(id=id, is_published=True)
        except self.model.DoesNotExist:
            return None

    def published_exists(self, id) -> bool:
        return self.model.objects.filter(id=id, is_published=True).exists()

    def publish(self, entity: T) -> None:
        if not entity.is_published:
            entity.is_published = True
            entity.save(update_fields=["is_published", "updated_at"])

    def unpublish(self, entity: T) -> None:
        if entity.is_published:
            entity.is_published = False
            entity.save(update_fields=["is_published", "updated_at"])


class InstructorMixin(Generic[T]):
    """Queries for instructor-owned content."""

    model: type[T]
    instructor_path: str  # FK path: "instructor", "course__instructor", etc.

    def get_by_instructor(self, instructor) -> QuerySet[T]:
        return self.model.objects.filter(**{self.instructor_path: instructor})

    def get_for_instructor(self, id, instructor) -> Optional[T]:
        try:
            return self.model.objects.get(id=id, **{self.instructor_path: instructor})
        except self.model.DoesNotExist:
            return None

    def is_owned_by(self, id, instructor) -> bool:
        return self.model.objects.filter(
            id=id, **{self.instructor_path: instructor}
        ).exists()


class ChildContentMixin(Generic[T, P]):
    """Operations for content with a parent (Module->Course, Lesson->Module)."""

    model: type[T]
    parent_field: str

    def get_by_parent(self, parent_id) -> QuerySet[T]:
        return self.model.objects.filter(**{f"{self.parent_field}_id": parent_id})

    def create_for_parent(self, parent: P, data: dict) -> T:
        return self.model.objects.create(**data, **{self.parent_field: parent})

    def get_parent_id(self, child_id):
        try:
            return self.model.objects.values_list(
                f"{self.parent_field}_id", flat=True
            ).get(id=child_id)
        except self.model.DoesNotExist:
            return None

    def exists_under_ancestor(self, child_id, ancestor_path: str, ancestor_id) -> bool:
        return self.model.objects.filter(
            id=child_id, **{f"{self.parent_field}__{ancestor_path}_id": ancestor_id}
        ).exists()
