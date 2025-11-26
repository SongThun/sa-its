"""
Core Services.
Service layer for core models - provides business logic and encapsulates data access.
Other modules should interact with core models through these services.
"""

from typing import List, Optional, Dict, Any
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils.text import slugify

from .models import Topic, ModuleItem


class TopicService:
    """
    Service for Topic operations.
    Encapsulates business logic and provides a stable API for other modules.
    """

    @staticmethod
    def get_all_active_topics() -> List[Topic]:
        """Get all active topics."""
        return list(Topic.objects.filter(is_active=True))

    @staticmethod
    def get_topic_by_id(topic_id: int) -> Optional[Topic]:
        """Get topic by ID."""
        try:
            return Topic.objects.get(id=topic_id, is_active=True)
        except Topic.DoesNotExist:
            return None

    @staticmethod
    def get_topic_by_slug(slug: str) -> Optional[Topic]:
        """Get topic by slug."""
        try:
            return Topic.objects.get(slug=slug, is_active=True)
        except Topic.DoesNotExist:
            return None

    @staticmethod
    def get_topics_by_ids(topic_ids: List[int]) -> List[Topic]:
        """Get multiple topics by IDs."""
        return list(Topic.objects.filter(id__in=topic_ids, is_active=True))

    @staticmethod
    def create_topic(
        name: str, description: str = "", user=None, slug: str = None
    ) -> Topic:
        """
        Create a new topic.
        Auto-generates slug from name if not provided.
        """
        if not slug:
            slug = slugify(name)

        return Topic.objects.create(
            name=name,
            description=description,
            slug=slug,
            created_by=user,
        )

    @staticmethod
    def update_topic(
        topic_id: int,
        name: str = None,
        description: str = None,
        slug: str = None,
        is_active: bool = None,
    ) -> Optional[Topic]:
        """Update an existing topic."""
        try:
            topic = Topic.objects.get(id=topic_id)

            if name is not None:
                topic.name = name
            if description is not None:
                topic.description = description
            if slug is not None:
                topic.slug = slug
            if is_active is not None:
                topic.is_active = is_active

            topic.save()
            return topic
        except Topic.DoesNotExist:
            return None

    @staticmethod
    def deactivate_topic(topic_id: int) -> bool:
        """Soft delete a topic by marking it inactive."""
        try:
            topic = Topic.objects.get(id=topic_id)
            topic.is_active = False
            topic.save()
            return True
        except Topic.DoesNotExist:
            return False

    @staticmethod
    def search_topics(query: str) -> List[Topic]:
        """Search topics by name or description."""
        from django.db.models import Q

        return list(
            Topic.objects.filter(is_active=True).filter(
                Q(name__icontains=query) | Q(description__icontains=query)
            )
        )


class ModuleItemService:
    """
    Service for managing module items ordering.
    Handles the polymorphic relationship between modules and their content.
    """

    @staticmethod
    def add_item_to_module(
        module_id: int, item_object: Any, order: int = None
    ) -> ModuleItem:
        """
        Add any content object (Lesson, Quiz, etc.) to a module at specified order.
        If order is not specified, adds to the end.
        """
        if order is None:
            # Get the last order number and increment
            last_item = (
                ModuleItem.objects.filter(module_id=module_id)
                .order_by("-order")
                .first()
            )
            order = (last_item.order + 1) if last_item else 0

        content_type = ContentType.objects.get_for_model(item_object)

        return ModuleItem.objects.create(
            module_id=module_id,
            order=order,
            content_type=content_type,
            object_id=item_object.id,
        )

    @staticmethod
    def get_module_items(module_id: int) -> List[ModuleItem]:
        """
        Get all ordered items for a module with content prefetched.
        Returns items in order with their actual content objects loaded.
        """
        return list(
            ModuleItem.objects.filter(module_id=module_id)
            .select_related("content_type")
            .prefetch_related("content_object")
        )

    @staticmethod
    def get_item_by_id(item_id: int) -> Optional[ModuleItem]:
        """Get a specific module item by ID."""
        try:
            return (
                ModuleItem.objects.select_related("content_type")
                .prefetch_related("content_object")
                .get(id=item_id)
            )
        except ModuleItem.DoesNotExist:
            return None

    @staticmethod
    def remove_item(item_id: int) -> bool:
        """
        Remove an item from a module.
        Note: This only removes the ordering entry, not the content itself.
        """
        try:
            item = ModuleItem.objects.get(id=item_id)
            module_id = item.module_id
            item.delete()

            # Reorder remaining items to fill the gap
            ModuleItemService._normalize_order(module_id)
            return True
        except ModuleItem.DoesNotExist:
            return False

    @staticmethod
    @transaction.atomic
    def reorder_items(module_id: int, item_orders: Dict[int, int]) -> bool:
        """
        Reorder items in a module.
        item_orders = {item_id: new_order, ...}
        """
        try:
            for item_id, new_order in item_orders.items():
                ModuleItem.objects.filter(id=item_id, module_id=module_id).update(
                    order=new_order
                )
            return True
        except Exception:
            return False

    @staticmethod
    @transaction.atomic
    def move_item(item_id: int, new_order: int) -> bool:
        """Move an item to a new position in the module."""
        from django.db.models import F

        try:
            item = ModuleItem.objects.get(id=item_id)
            old_order = item.order
            module_id = item.module_id

            if old_order == new_order:
                return True

            # Shift other items
            if new_order < old_order:
                # Moving up - shift items down
                ModuleItem.objects.filter(
                    module_id=module_id, order__gte=new_order, order__lt=old_order
                ).update(order=F("order") + 1)
            else:
                # Moving down - shift items up
                ModuleItem.objects.filter(
                    module_id=module_id, order__gt=old_order, order__lte=new_order
                ).update(order=F("order") - 1)

            # Update the item
            item.order = new_order
            item.save()
            return True
        except ModuleItem.DoesNotExist:
            return False

    @staticmethod
    def _normalize_order(module_id: int):
        """
        Normalize order numbers to be sequential starting from 0.
        Useful after deletions to remove gaps.
        """
        items = ModuleItem.objects.filter(module_id=module_id).order_by("order")

        for index, item in enumerate(items):
            if item.order != index:
                item.order = index
                item.save()

    @staticmethod
    def get_item_count(module_id: int) -> int:
        """Get the total number of items in a module."""
        return ModuleItem.objects.filter(module_id=module_id).count()

    @staticmethod
    def clear_module_items(module_id: int) -> int:
        """
        Remove all items from a module.
        Returns the number of items removed.
        """
        return ModuleItem.objects.filter(module_id=module_id).delete()[0]
