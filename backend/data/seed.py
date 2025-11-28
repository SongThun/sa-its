#!/usr/bin/env python
"""
Database seeding script.

Reads JSON fixture files and populates the database with example data.

Usage:
    python manage.py shell < data/seed.py

    Or run directly:
    python data/seed.py

JSON file format:
{
    "table": "<table_name>",
    "data": [
        { ... object fields ... }
    ]
}
"""

import json
import os
import sys
from pathlib import Path

# Setup Django environment if running directly
if __name__ == "__main__":
    # Add parent directory to path
    backend_dir = Path(__file__).resolve().parent.parent
    sys.path.insert(0, str(backend_dir))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    import django

    django.setup()

from django.apps import apps
from django.db import transaction


# Mapping of table names to model classes and special handlers
TABLE_HANDLERS = {}

# Define fixture processing order based on dependencies
# Users and categories first, then topics, then courses (which depend on all of the above)
FIXTURE_ORDER = [
    "users",
    "categories",
    "topics",
    "courses",
    "enrollments",
    "progress",
]


def register_handler(table_name):
    """Decorator to register a custom handler for a table."""

    def decorator(func):
        TABLE_HANDLERS[table_name] = func
        return func

    return decorator


@register_handler("users")
def handle_users(data_list):
    """
    Special handler for users table.
    Uses create_user to properly hash passwords.
    """
    from apps.authentication.models import User

    created_count = 0
    skipped_count = 0

    for item in data_list:
        email = item.get("email", "").strip().lower()

        # Skip if user already exists
        if User.objects.filter(email=email).exists():
            print(f"  - Skipping existing user: {email}")
            skipped_count += 1
            continue

        # Extract password before creating
        password = item.pop("password", None)

        # Create user
        User.objects.create_user(
            username=item.get("username"),
            email=email,
            password=password,
            fullname=item.get("fullname", ""),
            role=item.get("role", "student"),
            is_staff=item.get("is_staff", False),
            is_superuser=item.get("is_superuser", False),
        )
        print(f"  + Created user: {email}")
        created_count += 1

    return created_count, skipped_count


@register_handler("categories")
def handle_categories(data_list):
    """Handler for categories table."""
    from apps.content.models import Category

    created_count = 0
    skipped_count = 0

    for item in data_list:
        name = item.get("name")

        if Category.objects.filter(name=name).exists():
            print(f"  - Skipping existing category: {name}")
            skipped_count += 1
            continue

        Category.objects.create(
            name=name,
            description=item.get("description", ""),
        )
        print(f"  + Created category: {name}")
        created_count += 1

    return created_count, skipped_count


@register_handler("topics")
def handle_topics(data_list):
    """Handler for topics table."""
    from apps.content.models import Topic

    created_count = 0
    skipped_count = 0

    for item in data_list:
        name = item.get("name")
        slug = item.get("slug")

        if Topic.objects.filter(slug=slug).exists():
            print(f"  - Skipping existing topic: {name}")
            skipped_count += 1
            continue

        Topic.objects.create(
            name=name,
            slug=slug,
            description=item.get("description", ""),
        )
        print(f"  + Created topic: {name}")
        created_count += 1

    return created_count, skipped_count


@register_handler("courses")
def handle_courses(data_list):
    """
    Handler for courses with nested modules and lessons.
    """
    from apps.authentication.models import User
    from apps.content.models import Category, Course, Module, Lesson, Topic

    created_count = 0
    skipped_count = 0

    for item in data_list:
        title = item.get("title")

        # Skip if course already exists
        if Course.objects.filter(title=title).exists():
            print(f"  - Skipping existing course: {title}")
            skipped_count += 1
            continue

        # Get instructor by email
        instructor_email = item.get("instructor_email")
        try:
            instructor = User.objects.get(email=instructor_email)
        except User.DoesNotExist:
            print(f"  ! Instructor not found: {instructor_email}, skipping course")
            skipped_count += 1
            continue

        # Get category by name
        category_name = item.get("category_name")
        category = None
        if category_name:
            category = Category.objects.filter(name=category_name).first()

        # Extract modules before creating course
        modules_data = item.pop("modules", [])

        # Create course
        course = Course.objects.create(
            title=title,
            description=item.get("description", ""),
            instructor=instructor,
            cover_image=item.get("cover_image", ""),
            est_duration=item.get("est_duration", 0),
            difficulty_level=item.get("difficulty_level", "beginner"),
            category=category,
            is_published=item.get("is_published", False),
            rating=item.get("rating", 0.0),
            students_count=item.get("students_count", 0),
        )

        print(f"  + Created course: {title}")
        created_count += 1

        # Create modules and lessons
        for module_data in modules_data:
            lessons_data = module_data.pop("lessons", [])

            module = Module.objects.create(
                course=course,
                title=module_data.get("title"),
                description=module_data.get("description", ""),
                order=module_data.get("order", 0),
                estimated_duration=module_data.get("estimated_duration", 0),
                is_published=module_data.get("is_published", False),
            )
            print(f"    + Created module: {module.title}")

            for lesson_data in lessons_data:
                topic_names = lesson_data.pop("topic_names", [])

                lesson = Lesson.objects.create(
                    module=module,
                    title=lesson_data.get("title"),
                    content_type=lesson_data.get("content_type", "text"),
                    estimated_duration=lesson_data.get("estimated_duration", 0),
                    order=lesson_data.get("order", 0),
                    content=lesson_data.get("content", ""),
                    is_published=lesson_data.get("is_published", False),
                )

                # Add topics to lesson
                if topic_names:
                    topics = Topic.objects.filter(name__in=topic_names)
                    lesson.topics.set(topics)

                print(f"      + Created lesson: {lesson_data.get('title')}")

    return created_count, skipped_count


@register_handler("enrollments")
def handle_enrollments(data_list):
    """
    Handler for enrollments table.
    Links users to courses with enrollment status.
    """
    from apps.authentication.models import User
    from apps.content.models import Course
    from apps.learning_activities.models import Enrollment

    created_count = 0
    skipped_count = 0

    for item in data_list:
        user_email = item.get("user_email")
        course_title = item.get("course_title")

        # Get user by email
        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            print(f"  ! User not found: {user_email}, skipping enrollment")
            skipped_count += 1
            continue

        # Get course by title
        try:
            course = Course.objects.get(title=course_title)
        except Course.DoesNotExist:
            print(f"  ! Course not found: {course_title}, skipping enrollment")
            skipped_count += 1
            continue

        # Skip if enrollment already exists
        if Enrollment.objects.filter(user=user, course=course).exists():
            print(f"  - Skipping existing enrollment: {user_email} -> {course_title}")
            skipped_count += 1
            continue

        # Create enrollment
        Enrollment.objects.create(
            user=user,
            course=course,
            status=item.get("status", "active"),
        )
        print(f"  + Created enrollment: {user_email} -> {course_title}")
        created_count += 1

    return created_count, skipped_count


@register_handler("progress")
def handle_progress(data_list):
    """
    Handler for progress table.
    Creates lesson progress and course progress records.
    """
    from apps.authentication.models import User
    from apps.content.models import Course, Lesson
    from apps.learning_activities.models import LessonProgress, CourseProgress

    created_count = 0
    skipped_count = 0

    for item in data_list:
        user_email = item.get("user_email")
        course_title = item.get("course_title")
        lessons_completed = item.get("lessons_completed", [])
        progress_percentage = item.get("progress_percentage", 0.0)

        # Get user by email
        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            print(f"  ! User not found: {user_email}, skipping progress")
            skipped_count += 1
            continue

        # Get course by title
        try:
            course = Course.objects.get(title=course_title)
        except Course.DoesNotExist:
            print(f"  ! Course not found: {course_title}, skipping progress")
            skipped_count += 1
            continue

        # Get all lessons in the course
        all_lessons = Lesson.objects.filter(module__course=course)
        total_lessons = all_lessons.count()

        # Create or update course progress
        course_progress, cp_created = CourseProgress.objects.get_or_create(
            user=user,
            course=course,
            defaults={
                "progress_percentage": progress_percentage,
                "completed_lessons": len(lessons_completed),
                "total_lessons": total_lessons,
            },
        )

        if cp_created:
            print(
                f"  + Created course progress: {user_email} -> {course_title} ({progress_percentage}%)"
            )
            created_count += 1
        else:
            print(f"  - Course progress exists: {user_email} -> {course_title}")
            skipped_count += 1

        # Create lesson progress for completed lessons
        for lesson_title in lessons_completed:
            try:
                lesson = all_lessons.get(title=lesson_title)
            except Lesson.DoesNotExist:
                print(f"    ! Lesson not found: {lesson_title}")
                continue

            lesson_progress, lp_created = LessonProgress.objects.get_or_create(
                user=user,
                lesson=lesson,
                defaults={
                    "is_completed": True,
                    "time_spent": 600,  # Default 10 minutes
                },
            )

            if lp_created:
                print(f"    + Completed lesson: {lesson_title}")
            else:
                print(f"    - Lesson progress exists: {lesson_title}")

        # Update last accessed lesson
        if lessons_completed:
            last_lesson_title = lessons_completed[-1]
            try:
                last_lesson = all_lessons.get(title=last_lesson_title)
                course_progress.last_accessed_lesson = last_lesson
                course_progress.save()
            except Lesson.DoesNotExist:
                pass

    return created_count, skipped_count


def get_model_for_table(table_name):
    """
    Get Django model class for a given table name.
    Searches through all installed apps.
    """
    for model in apps.get_models():
        if model._meta.db_table == table_name:
            return model
    return None


def handle_generic_table(model, data_list):
    """
    Generic handler for tables without special handling.
    """
    created_count = 0
    skipped_count = 0

    for item in data_list:
        # Try to find existing record by unique fields or pk
        pk_field = model._meta.pk.name
        pk_value = item.get(pk_field)

        if pk_value and model.objects.filter(**{pk_field: pk_value}).exists():
            print(f"  - Skipping existing record: {pk_value}")
            skipped_count += 1
            continue

        try:
            obj = model.objects.create(**item)
            print(f"  + Created: {obj}")
            created_count += 1
        except Exception as e:
            print(f"  ! Error creating record: {e}")
            skipped_count += 1

    return created_count, skipped_count


def load_fixture_file(filepath):
    """Load and parse a JSON fixture file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_from_file(filepath):
    """
    Seed database from a single fixture file.

    Args:
        filepath: Path to the JSON fixture file

    Returns:
        Tuple of (created_count, skipped_count)
    """
    print(f"\nProcessing: {filepath}")

    fixture = load_fixture_file(filepath)
    table_name = fixture.get("table")
    data_list = fixture.get("data", [])

    if not table_name:
        print("  ! Error: No 'table' field in fixture")
        return 0, 0

    if not data_list:
        print(f"  ! Warning: No data to seed for table '{table_name}'")
        return 0, 0

    print(f"  Table: {table_name}")
    print(f"  Records: {len(data_list)}")

    # Check for custom handler
    if table_name in TABLE_HANDLERS:
        return TABLE_HANDLERS[table_name](data_list)

    # Use generic handler
    model = get_model_for_table(table_name)
    if not model:
        print(f"  ! Error: No model found for table '{table_name}'")
        return 0, 0

    return handle_generic_table(model, data_list)


def seed_all(fixtures_dir=None):
    """
    Seed database from all fixture files in the fixtures directory.
    Files are processed in dependency order defined by FIXTURE_ORDER.

    Args:
        fixtures_dir: Path to fixtures directory. Defaults to data/fixtures/
    """
    if fixtures_dir is None:
        fixtures_dir = Path(__file__).parent / "fixtures"
    else:
        fixtures_dir = Path(fixtures_dir)

    if not fixtures_dir.exists():
        print(f"Error: Fixtures directory not found: {fixtures_dir}")
        return

    # Find all JSON files
    all_fixture_files = {f.stem: f for f in fixtures_dir.glob("*.json")}

    if not all_fixture_files:
        print(f"No fixture files found in: {fixtures_dir}")
        return

    # Order files based on FIXTURE_ORDER, then append any remaining files
    ordered_files = []
    for table_name in FIXTURE_ORDER:
        if table_name in all_fixture_files:
            ordered_files.append(all_fixture_files.pop(table_name))

    # Add any remaining files not in FIXTURE_ORDER (sorted alphabetically)
    for name in sorted(all_fixture_files.keys()):
        ordered_files.append(all_fixture_files[name])

    print("=" * 50)
    print("Database Seeding")
    print("=" * 50)
    print(f"Processing order: {[f.stem for f in ordered_files]}")

    total_created = 0
    total_skipped = 0

    with transaction.atomic():
        for filepath in ordered_files:
            created, skipped = seed_from_file(filepath)
            total_created += created
            total_skipped += skipped

    print("\n" + "=" * 50)
    print("Seeding Complete!")
    print(f"  Created: {total_created}")
    print(f"  Skipped: {total_skipped}")
    print("=" * 50)


def clear_table(table_name):
    """
    Clear all data from a table.

    Args:
        table_name: Name of the database table to clear
    """
    if table_name in TABLE_HANDLERS:
        # Handle special tables
        if table_name == "users":
            from apps.authentication.models import User

            count = User.objects.exclude(is_superuser=True).count()
            User.objects.exclude(is_superuser=True).delete()
            print(f"Cleared {count} records from {table_name} (kept superusers)")
            return

    model = get_model_for_table(table_name)
    if model:
        count = model.objects.count()
        model.objects.all().delete()
        print(f"Cleared {count} records from {table_name}")
    else:
        print(f"No model found for table: {table_name}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Database seeding utility")
    parser.add_argument(
        "--clear",
        type=str,
        help="Clear a specific table before seeding",
        metavar="TABLE",
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Seed from a specific fixture file",
        metavar="FILE",
    )
    parser.add_argument(
        "--dir",
        type=str,
        help="Fixtures directory path",
        metavar="DIR",
    )

    args = parser.parse_args()

    if args.clear:
        clear_table(args.clear)

    if args.file:
        with transaction.atomic():
            seed_from_file(args.file)
    else:
        seed_all(args.dir)
