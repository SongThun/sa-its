// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role?: 'student' | 'instructor' | 'admin';
  avatar?: string;
  bio?: string;
  enrolled_courses?: string[];
  completed_lessons?: string[];
  created_at: string;
}

// Topic types
export interface Topic {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
  courses_count?: number;
}

// Course types
export interface Course {
  id: string; // UUID
  title: string;
  description: string;
  instructor_name: string;
  cover_image: string | null;
  est_duration: number; // in minutes
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string; // category name
  rating: number;
  students_count: number;
  is_published?: boolean;
  total_lessons: number;
  modules?: Module[];
  prerequisites?: Course[];
  created_at: string;
  updated_at?: string;
}

// Module types
export interface Module {
  id: string; // UUID
  title: string;
  description: string;
  order: number;
  estimated_duration: number; // in minutes
  is_published?: boolean;
  total_lessons?: number; // only in unlocked view
  lessons?: Lesson[]; // only in unlocked view
  created_at?: string;
  updated_at?: string;
}

// Lesson types
export interface Lesson {
  id: string; // UUID
  title: string;
  content_type: 'video' | 'text' | 'interactive' | 'document' | 'quiz';
  estimated_duration: number; // in minutes
  order: number;
  content?: string; // simple text/markdown content
  topics?: Topic[]; // topics for this lesson (only in unlocked view)
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Category types
export interface Category {
  id: number; // auto-increment integer
  name: string;
  description: string;
}

// Form data types
export interface CourseFormData {
  title: string;
  description: string;
  cover_image?: string;
  est_duration: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category_id?: number;
  topic_ids?: string[];
  is_published?: boolean;
}

export interface ModuleFormData {
  course_id: string; // UUID
  title: string;
  description: string;
  order: number;
  estimated_duration: number;
}

export interface LessonFormData {
  module_id: string; // UUID
  title: string;
  content_type: 'video' | 'text' | 'interactive' | 'document' | 'quiz';
  estimated_duration: number;
  order: number;
  content?: string;
}

// Progress types
export interface EnrollmentProgress {
  course_id: string;
  completed_lessons: string[];
  last_accessed_lesson?: string;
  progress: number;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// API Response types
export interface ApiError {
  message: string;
  field?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
