"""
Admin configuration for Content Management module.
"""

from django.contrib import admin

from .models import Category, Course, Lesson, Module


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "description", "created_at"]
    search_fields = ["name"]


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    ordering = ["order"]


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    ordering = ["order"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "instructor",
        "category",
        "level",
        "is_published",
        "students_count",
        "created_at",
    ]
    list_filter = ["level", "category", "is_published"]
    search_fields = ["title", "description"]
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "order", "created_at"]
    list_filter = ["course"]
    search_fields = ["title"]
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["title", "module", "type", "duration", "order"]
    list_filter = ["type", "module__course"]
    search_fields = ["title"]
