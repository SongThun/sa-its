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
  id: number; // auto-increment integer
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

// Lesson content types
export type LessonContentType = 'video' | 'text' | 'document';

export interface VideoContent {
  video_url?: string;
  video_id?: string;
  duration_seconds?: number;
  transcript?: string;
  timestamps?: Array<{ time: number; label: string }>;
}

export interface TextContent {
  main_content?: string;
  images?: string[];
  reading_level?: string;
}

export interface DocumentContent {
  document_url?: string;
  file_type?: 'pdf' | 'docx' | 'pptx' | string;
  preview_images?: string[];
}

export type LessonContentData =
  | VideoContent
  | TextContent
  | DocumentContent;

// Lesson types
export interface Lesson {
  id: string; // UUID
  title: string;
  content_type: LessonContentType;
  estimated_duration: number; // in minutes
  order: number;
  content?: string; // legacy text/markdown content
  content_data?: LessonContentData; // structured content based on content_type
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
  topic_ids?: number[];
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
  content_type: LessonContentType;
  estimated_duration: number;
  order: number;
  content?: string;
  content_data?: LessonContentData;
  topic_ids?: number[]; // integer array for topics
}

// Progress types (matches backend response from /learning/courses/{id}/progress/)
export interface EnrollmentProgress {
  enrollment_id: string;
  course_id: string;
  progress: number;
  status: 'started' | 'in_progress' | 'completed';
  completedLessons: string[];
  completedModules: string[];
  last_accessed_at: string | null;
  completed_at: string | null;
}

// Enrolled course with progress (matches backend response from /learning/my-courses/)
export interface EnrolledCourse {
  // Course fields
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  est_duration: number;
  rating: number;
  students_count: number;
  category: string;
  instructor_name: string;
  total_lessons: number;
  // Enrollment/Progress fields
  enrollment_id: string;
  progress: number;
  enrollment_status: 'started' | 'in_progress' | 'completed';
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
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
