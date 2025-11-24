# SA-ITS Implementation Plan

## Overview

Based on the ERD and ModuleView architecture, this plan outlines the implementation of the remaining modules for the Intelligent Tutoring System.

## Module Structure

```
backend/apps/
├── authentication/     # ✅ Implemented - User Management
├── content/            # 📋 To implement - Learning Content Management
├── enrollment/         # 📋 To implement - Course Enrollment
├── progress/           # 📋 To implement - Learning Progress Tracking
├── assessment/         # 📋 To implement - Quizzes & Assessments
└── ai_model/           # 📋 To implement - AI/Recommendation Service
```

---

## Phase 1: Content Management Module

### Models

```python
# apps/content/models.py

class Category(Model):
    name: str
    description: str
    icon: str (optional)

class Course(Model):
    title: str
    description: text
    instructor: FK(User)
    thumbnail: str (URL)
    duration: str
    level: enum('Beginner', 'Intermediate', 'Advanced')
    category: FK(Category)
    is_published: bool
    created_at, updated_at: datetime

class Module(Model):
    course: FK(Course)
    title: str
    description: text
    order: int

class Lesson(Model):
    module: FK(Module)
    title: str
    type: enum('video', 'text', 'quiz')
    duration: str
    order: int
    content: JSON  # {videoUrl, text, quiz}

class LearningObject(Model):
    lesson: FK(Lesson)
    type: str
    content: JSON
    difficulty: float (0-1)
    concepts: M2M(Concept)
```

### API Endpoints

```
GET    /api/content/courses/              # List courses
GET    /api/content/courses/{id}/         # Course detail with modules
GET    /api/content/courses/{id}/modules/ # Course modules
GET    /api/content/modules/{id}/lessons/ # Module lessons
GET    /api/content/lessons/{id}/         # Lesson detail
GET    /api/content/categories/           # List categories
POST   /api/content/courses/              # Create course (instructor)
PUT    /api/content/courses/{id}/         # Update course
DELETE /api/content/courses/{id}/         # Delete course
```

---

## Phase 2: Enrollment Module

### Models

```python
# apps/enrollment/models.py

class Enrollment(Model):
    user: FK(User)
    course: FK(Course)
    enrolled_at: datetime
    status: enum('active', 'completed', 'dropped')
    completed_at: datetime (nullable)

    class Meta:
        unique_together = ['user', 'course']
```

### API Endpoints

```
GET    /api/enrollment/my-courses/        # User's enrolled courses
POST   /api/enrollment/enroll/            # Enroll in course
DELETE /api/enrollment/unenroll/{course_id}/ # Unenroll
GET    /api/enrollment/course/{id}/students/ # Course students (instructor)
```

---

## Phase 3: Progress Tracking Module

### Models

```python
# apps/progress/models.py

class LessonProgress(Model):
    user: FK(User)
    lesson: FK(Lesson)
    started_at: datetime
    completed_at: datetime (nullable)
    is_completed: bool
    time_spent: int (seconds)

    class Meta:
        unique_together = ['user', 'lesson']

class CourseProgress(Model):
    user: FK(User)
    course: FK(Course)
    progress_percentage: float
    last_accessed_lesson: FK(Lesson)
    last_accessed_at: datetime

    class Meta:
        unique_together = ['user', 'course']
```

### API Endpoints

```
GET    /api/progress/course/{id}/         # Get course progress
POST   /api/progress/lesson/{id}/start/   # Start lesson
POST   /api/progress/lesson/{id}/complete/ # Complete lesson
GET    /api/progress/my-progress/         # All user progress
```

---

## Phase 4: Assessment Module

### Models

```python
# apps/assessment/models.py

class Assessment(Model):
    course: FK(Course)
    lesson: FK(Lesson, nullable)
    title: str
    type: enum('quiz', 'exam', 'practice')
    passing_score: int
    time_limit: int (minutes, nullable)

class Question(Model):
    assessment: FK(Assessment)
    text: str
    type: enum('multiple_choice', 'true_false', 'short_answer')
    difficulty: float (0-1)
    points: int
    order: int
    concepts: M2M(Concept)

class Answer(Model):
    question: FK(Question)
    text: str
    is_correct: bool
    order: int

class UserAssessmentAttempt(Model):
    user: FK(User)
    assessment: FK(Assessment)
    started_at: datetime
    completed_at: datetime
    score: float
    passed: bool

class UserAnswer(Model):
    attempt: FK(UserAssessmentAttempt)
    question: FK(Question)
    selected_answer: FK(Answer, nullable)
    text_answer: str (nullable)
    is_correct: bool
    time_spent: int (seconds)
```

---

## Phase 5: AI Model Service (Core ITS)

### Models

```python
# apps/ai_model/models.py

class Concept(Model):
    """Knowledge concepts/skills to be learned"""
    name: str
    description: text
    prerequisites: M2M(Concept, self)  # Concept dependencies

class KnowledgeState(Model):
    """Bayesian Knowledge Tracing state per user-concept"""
    user: FK(User)
    concept: FK(Concept)
    mastery_level: float (0-1)  # P(L) - probability of mastery
    last_updated: datetime

    class Meta:
        unique_together = ['user', 'concept']

class LearningEvent(Model):
    """Log of learning interactions for model updates"""
    user: FK(User)
    concept: FK(Concept)
    content: FK(LearningObject)
    event_type: enum('view', 'complete', 'quiz_correct', 'quiz_incorrect')
    timestamp: datetime

class Recommendation(Model):
    """Content recommendations for users"""
    user: FK(User)
    content: FK(LearningObject)
    score: float  # Recommendation strength
    reason: str   # Explanation
    created_at: datetime
    is_shown: bool
    is_clicked: bool

class StudentModel(Model):
    """Aggregate student model for personalization"""
    user: OneToOne(User)
    learning_style: JSON  # {visual, auditory, reading, kinesthetic}
    preferred_difficulty: float
    avg_session_duration: int
    strengths: M2M(Concept)
    weaknesses: M2M(Concept)
```

### Services Architecture

```python
# apps/ai_model/services/

class BayesianKnowledgeTracing:
    """
    Implements BKT algorithm for knowledge state estimation.

    Parameters:
    - P(L0): Prior probability of mastery
    - P(T): Probability of learning/transition
    - P(G): Probability of guess
    - P(S): Probability of slip
    """
    def update_knowledge_state(user, concept, is_correct) -> float
    def get_mastery_probability(user, concept) -> float
    def get_all_knowledge_states(user) -> Dict[Concept, float]

class ContentRecommender:
    """
    Recommends next learning content based on:
    - Current knowledge state
    - Learning objectives
    - Content difficulty
    - User preferences
    """
    def get_recommendations(user, course=None, limit=5) -> List[Recommendation]
    def get_next_lesson(user, course) -> Lesson
    def explain_recommendation(recommendation) -> str

class KnowledgeInference:
    """
    Infers knowledge state from various signals:
    - Quiz performance
    - Time spent on content
    - Content completion patterns
    """
    def infer_from_quiz(user, assessment_attempt) -> None
    def infer_from_progress(user, lesson_progress) -> None

class AdaptiveDifficulty:
    """
    Adjusts content difficulty based on performance.
    """
    def get_optimal_difficulty(user, concept) -> float
    def filter_content_by_difficulty(user, content_list) -> List
```

### API Endpoints

```
GET    /api/ai/recommendations/           # Get personalized recommendations
GET    /api/ai/next-lesson/{course_id}/   # Get next recommended lesson
GET    /api/ai/knowledge-state/           # Get user's knowledge state
GET    /api/ai/knowledge-state/{concept}/ # Get specific concept mastery
POST   /api/ai/learning-event/            # Log learning event
GET    /api/ai/student-model/             # Get student model summary
GET    /api/ai/explain/{recommendation_id}/ # Explain recommendation
```

---

## Seed Data Structure

### courses.json
```json
{
  "table": "content_course",
  "data": [
    {
      "title": "Introduction to Python",
      "description": "Learn Python from scratch",
      "level": "Beginner",
      "category": "Programming",
      "duration": "10 hours",
      "modules": [...]
    }
  ]
}
```

### concepts.json
```json
{
  "table": "ai_model_concept",
  "data": [
    {"name": "Variables", "description": "Understanding variables"},
    {"name": "Loops", "description": "For and while loops", "prerequisites": ["Variables"]},
    {"name": "Functions", "description": "Defining functions", "prerequisites": ["Variables", "Loops"]}
  ]
}
```

---

## Implementation Order

1. **Content Module** - Foundation for all content
2. **Enrollment Module** - User-course relationships
3. **Progress Module** - Track learning progress
4. **Assessment Module** - Quizzes and knowledge checks
5. **AI Model Service** - Adaptive learning intelligence

## Dependencies

```
Content ← Enrollment ← Progress ← Assessment ← AI Model
   ↑______________________________________________|
```

The AI Model Service depends on all other modules to:
- Access content metadata and difficulty
- Know user enrollments
- Track progress for knowledge inference
- Use assessment results for BKT updates
