# Content Module API Endpoints

## Architecture Overview

The content module is now organized with:
- **Separate public and instructor APIs**
- **Service layer** for business logic
- **Permission-based access control**
- **Clean serializers** for different use cases

## Public APIs (Read-only, Published Content)

### Categories
- `GET /api/content/categories/` - List all categories

### Courses
- `GET /api/content/courses/` - List published courses
  - Query params: `?category=Web&level=beginner&search=python`
- `GET /api/content/courses/{id}/` - Get course detail with modules and lessons

### Modules
- `GET /api/content/modules/{id}/` - Get module detail with lessons

### Lessons
- `GET /api/content/lessons/{id}/` - Get lesson detail (requires authentication)

## Instructor APIs (Full CRUD)

**Base URL:** `/api/content/instructor/`
**Permissions:** Requires instructor role + course ownership

### Courses
- `GET /api/content/instructor/courses/` - List instructor's courses (all)
  - Query params: `?level=beginner&search=python&is_published=true`
- `POST /api/content/instructor/courses/` - Create new course
- `GET /api/content/instructor/courses/{id}/` - Get course detail
- `PUT /api/content/instructor/courses/{id}/` - Update course
- `PATCH /api/content/instructor/courses/{id}/` - Partial update
- `DELETE /api/content/instructor/courses/{id}/` - Delete course
- `POST /api/content/instructor/courses/{id}/publish/` - Publish course
- `POST /api/content/instructor/courses/{id}/unpublish/` - Unpublish course

### Modules
- `GET /api/content/instructor/modules/` - List instructor's modules
  - Query params: `?course_id={id}`
- `POST /api/content/instructor/modules/` - Create new module
- `GET /api/content/instructor/modules/{id}/` - Get module detail
- `PUT /api/content/instructor/modules/{id}/` - Update module
- `PATCH /api/content/instructor/modules/{id}/` - Partial update
- `DELETE /api/content/instructor/modules/{id}/` - Delete module

### Lessons
- `GET /api/content/instructor/lessons/` - List instructor's lessons
  - Query params: `?module_id={id}&course_id={id}`
- `POST /api/content/instructor/lessons/` - Create new lesson
- `GET /api/content/instructor/lessons/{id}/` - Get lesson detail
- `PUT /api/content/instructor/lessons/{id}/` - Update lesson
- `PATCH /api/content/instructor/lessons/{id}/` - Partial update
- `DELETE /api/content/instructor/lessons/{id}/` - Delete lesson

## File Structure

```
apps/content/
├── models.py                    # Course, Module, Lesson, Category models
├── serializers.py               # All serializers (public + instructor)
├── services.py                  # Service layer (CourseService, ModuleService, LessonService)
├── permissions.py               # IsInstructor, IsCourseOwner permissions
├── urls.py                      # URL routing
└── apis/
    ├── public_apis.py          # Public read-only APIs
    └── instructor_apis.py      # Instructor CRUD APIs
```

## Permissions

### IsInstructor
- Checks if user has `role == "instructor"`
- Required for all instructor APIs

### IsCourseOwner
- Checks if user owns the course/module/lesson
- Works for Course, Module (via course), and Lesson (via module.course)

## Service Layer

### CourseService
- `get_public_courses(filters)` - Published courses with filtering
- `get_public_course_detail(course_id)` - Published course with modules/lessons
- `get_instructor_courses(instructor, filters)` - All instructor's courses
- `get_instructor_course_detail(course_id, instructor)` - Instructor's course detail

### ModuleService
- `get_public_modules(course_id)` - Modules from published courses
- `get_public_module_detail(module_id)` - Module detail with lessons
- `get_instructor_modules(instructor, course_id)` - Instructor's modules
- `get_instructor_module_detail(module_id, instructor)` - Module detail for instructor

### LessonService
- `get_public_lessons(module_id, course_id)` - Lessons from published courses
- `get_public_lesson_detail(lesson_id)` - Public lesson detail
- `get_instructor_lessons(instructor, module_id, course_id)` - Instructor's lessons
- `get_instructor_lesson_detail(lesson_id, instructor)` - Lesson detail for instructor

### CategoryService
- `get_categories()` - All categories

## Serializers

### Public View Serializers
- `CategorySerializer` - Category with course count
- `CourseListSerializer` - Course list view
- `CourseDetailSerializer` - Course with modules and lessons
- `ModuleDetailSerializer` - Module with lessons
- `LessonListSerializer` - Minimal lesson info
- `LessonDetailSerializer` - Full lesson detail

### Instructor Serializers
- `InstructorCourseListSerializer` - Course list for instructor
- `InstructorCourseDetailSerializer` - Course detail for instructor
- `InstructorCourseWriteSerializer` - Create/update course
- `InstructorModuleSerializer` - Module CRUD
- `InstructorLessonSerializer` - Lesson CRUD
