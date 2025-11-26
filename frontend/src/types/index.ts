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
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  topics: Topic[] | string[]; // Full objects or just names
  rating: number;
  students_count: number;
  is_published: boolean;
  total_lessons: number;
  modules?: Module[];
  created_at: string;
  updated_at: string;
}

// Module types
export interface Module {
  id: string; // UUID
  title: string;
  description: string;
  order: number;
  total_lessons: number;
  lessons?: Lesson[];
  items?: ModuleItem[];
  created_at: string;
  updated_at: string;
}

// Module Item (polymorphic content)
export interface ModuleItem {
  id: string; // UUID
  module_id: string;
  order: number;
  item_type: 'lesson' | 'quiz' | 'assignment';
  content: Lesson | Quiz | Record<string, unknown>;
  created_at: string;
}

// Lesson types
export interface Lesson {
  id: string; // UUID
  title: string;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  duration: string;
  order: number;
  content: LessonContent;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonContent {
  markdown?: string;
  video_url?: string;
  attachments?: FileAttachment[];
  [key: string]: unknown; // Flexible JSON content
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

// Category types
export interface Category {
  id: string; // UUID
  name: string;
  description: string;
  icon?: string;
  courses_count?: number;
}

// Form data types
export interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string; // UUID
  topic_ids: string[]; // UUIDs
  is_published: boolean;
}

export interface ModuleFormData {
  course: string; // UUID
  title: string;
  description: string;
  order: number;
}

export interface LessonFormData {
  module: string; // UUID
  title: string;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  duration: string;
  order: number;
  content: LessonContent;
  is_free: boolean;
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
