export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  enrolledCourses: string[];
  completedLessons: string[];
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  studentsCount: number;
  modules: Module[];
  lastAccessed?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  content: LessonContent;
}

export interface LessonContent {
  videoUrl?: string;
  text?: string;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface EnrollmentProgress {
  courseId: string;
  completedLessons: string[];
  lastAccessedLesson?: string;
  progress: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
