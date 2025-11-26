"""
Core Admin.
Admin interface for core models.
"""

from django.contrib import admin
from .models import Topic, ModuleItem


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    """Admin interface for Topic model."""

    list_display = ["name", "slug", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "description", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        (None, {"fields": ("name", "slug", "description", "is_active")}),
        (
            "Metadata",
            {
                "fields": ("created_by", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(ModuleItem)
class ModuleItemAdmin(admin.ModelAdmin):
    """Admin interface for ModuleItem model."""

    list_display = ["id", "module_id", "order", "item_type", "object_id", "created_at"]
    list_filter = ["content_type", "created_at"]
    search_fields = ["module_id", "object_id"]
    readonly_fields = ["created_at", "updated_at", "item_type"]

    fieldsets = (
        (None, {"fields": ("module_id", "order")}),
        ("Content Reference", {"fields": ("content_type", "object_id", "item_type")}),
        (
            "Metadata",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def item_type(self, obj):
        """Display the content type model name."""
        return obj.content_type.model if obj.content_type else "-"

    item_type.short_description = "Item Type"
