from django.db import models


class PublishableMixin(models.Model):
    is_published = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def publish(self) -> None:
        if not self.is_published and self.can_publish:
            self.is_published = True
            self.save(update_fields=["is_published", "updated_at"])

    def unpublish(self) -> None:
        if self.is_published:
            self.is_published = False
            self.save(update_fields=["is_published", "updated_at"])

    @property
    def can_publish(self) -> bool:
        return True


class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class OrderableMixin(models.Model):
    order = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True
        ordering = ["order"]
