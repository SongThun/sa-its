import type { User, Course, EnrollmentProgress } from '../types';
import { mockUsers, mockCourses } from '../data/mockData';
import { apiClient, type ApiError } from './apiClient';

// Simulate API delay for mock endpoints
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Backend API response types
interface BackendUser {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: 'student' | 'instructor' | 'admin';
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at?: string;
}

interface LoginResponse {
  user: BackendUser;
  tokens: {
    access: string;
    refresh: string;
  };
}

interface RegisterResponse {
  user: BackendUser;
  message: string;
}

interface ProfileResponse extends BackendUser {
  first_name: string;
  last_name: string;
}

// Transform backend user to frontend user format
function transformUser(backendUser: BackendUser): User {
  // Parse fullname into first/last name if not provided separately
  let firstName = backendUser.first_name || '';
  let lastName = backendUser.last_name || '';

  if (!firstName && backendUser.fullname) {
    const parts = backendUser.fullname.split(' ');
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  return {
    id: backendUser.id,
    email: backendUser.email,
    first_name: firstName,
    last_name: lastName,
    full_name: backendUser.fullname,
    role: backendUser.role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName || backendUser.username}`,
    bio: '',
    enrolled_courses: [],
    completed_lessons: [],
    created_at: backendUser.created_at,
  };
}

// Auth API - Uses real backend
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    password_confirm: string;
    username: string;
    fullname?: string;
    role?: 'student' | 'instructor' | 'admin';
  }) => {
    return apiClient.post<RegisterResponse>('/auth/register/', data);
  },

  login: async (data: { email: string; password: string }) => {
    return apiClient.post<LoginResponse>('/auth/login/', data);
  },

  logout: async (): Promise<void> => {
    apiClient.removeTokens();
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    // Check if we have valid tokens
    if (!apiClient.hasTokens()) {
      localStorage.removeItem('currentUser');
      return null;
    }

    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User | null> => {
    try {
      // Transform frontend fields to backend fields
      const backendUpdates: Record<string, unknown> = {};

      if (updates.firstName !== undefined) {
        backendUpdates.first_name = updates.firstName;
      }
      if (updates.lastName !== undefined) {
        backendUpdates.last_name = updates.lastName;
      }
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        backendUpdates.fullname = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
      }
      if (updates.bio !== undefined) {
        // Note: bio might not be supported by backend yet
      }

      const response = await apiClient.patch<ProfileResponse>('/auth/profile/', backendUpdates);

      const user = transformUser(response);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update profile error:', apiError.message);
      return null;
    }
  },

  refreshCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<ProfileResponse>('/auth/profile/');
      const user = transformUser(response);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },
};

// Course API - Mock (to be replaced with real API later)
export const courseApi = {
  getAllCourses: async (): Promise<Course[]> => {
    await delay(300);
    return mockCourses;
  },

  getCourseById: async (id: string): Promise<Course | null> => {
    await delay(200);
    return mockCourses.find(c => c.id === id) || null;
  },

  searchCourses: async (query: string): Promise<Course[]> => {
    await delay(300);
    const lowercaseQuery = query.toLowerCase();
    return mockCourses.filter(
      c =>
        c.title.toLowerCase().includes(lowercaseQuery) ||
        c.description.toLowerCase().includes(lowercaseQuery) ||
        c.category.toLowerCase().includes(lowercaseQuery)
    );
  },

  getCoursesByCategory: async (category: string): Promise<Course[]> => {
    await delay(200);
    return mockCourses.filter(c => c.category === category);
  },

  getCategories: async (): Promise<string[]> => {
    await delay(100);
    return [...new Set(mockCourses.map(c => c.category))];
  },
};

// Enrollment API - Mock (to be replaced with real API later)
export const enrollmentApi = {
  enrollInCourse: async (userId: string, courseId: string): Promise<boolean> => {
    await delay(400);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1 && !mockUsers[userIndex].enrolledCourses.includes(courseId)) {
      mockUsers[userIndex].enrolledCourses.push(courseId);
      localStorage.setItem('currentUser', JSON.stringify(mockUsers[userIndex]));
      return true;
    }
    return false;
  },

  unenrollFromCourse: async (userId: string, courseId: string): Promise<boolean> => {
    await delay(400);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].enrolledCourses = mockUsers[userIndex].enrolledCourses.filter(
        id => id !== courseId
      );
      localStorage.setItem('currentUser', JSON.stringify(mockUsers[userIndex]));
      return true;
    }
    return false;
  },

  getEnrolledCourses: async (userId: string): Promise<Course[]> => {
    await delay(300);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];
    return mockCourses.filter(c => user.enrolledCourses.includes(c.id));
  },

  getOngoingCourses: async (userId: string): Promise<Course[]> => {
    await delay(300);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];
    return mockCourses
      .filter(c => user.enrolledCourses.includes(c.id) && c.lastAccessed)
      .sort((a, b) => {
        const dateA = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
        const dateB = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
        return dateB - dateA;
      });
  },

  getCourseProgress: async (userId: string, courseId: string): Promise<EnrollmentProgress> => {
    await delay(200);
    const user = mockUsers.find(u => u.id === userId);
    const course = mockCourses.find(c => c.id === courseId);

    if (!user || !course) {
      return { courseId, completedLessons: [], progress: 0 };
    }

    const courseLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
    const completedLessons = user.completedLessons.filter(id => courseLessonIds.includes(id));
    const progress = courseLessonIds.length > 0
      ? Math.round((completedLessons.length / courseLessonIds.length) * 100)
      : 0;

    return {
      courseId,
      completedLessons,
      progress,
    };
  },
};

// Progress API - Mock (to be replaced with real API later)
export const progressApi = {
  completeLesson: async (userId: string, lessonId: string): Promise<boolean> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1 && !mockUsers[userIndex].completedLessons.includes(lessonId)) {
      mockUsers[userIndex].completedLessons.push(lessonId);
      localStorage.setItem('currentUser', JSON.stringify(mockUsers[userIndex]));
      return true;
    }
    return false;
  },

  uncompleteLesson: async (userId: string, lessonId: string): Promise<boolean> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].completedLessons = mockUsers[userIndex].completedLessons.filter(
        id => id !== lessonId
      );
      localStorage.setItem('currentUser', JSON.stringify(mockUsers[userIndex]));
      return true;
    }
    return false;
  },

  isLessonCompleted: (userId: string, lessonId: string): boolean => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.completedLessons.includes(lessonId) : false;
  },

  updateLastAccessed: async (courseId: string): Promise<void> => {
    await delay(100);
    const courseIndex = mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      mockCourses[courseIndex].lastAccessed = new Date().toISOString().split('T')[0];
    }
  },
};

// ============================================================================
// INSTRUCTOR API - Real backend endpoints for course management
// ============================================================================

import type { Topic, Category, CourseFormData, ModuleFormData, LessonFormData, Module, Lesson } from '../types';

export const topicsApi = {
  getAll: async (search?: string): Promise<Topic[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<Topic[]>(`/core/topics/${query}`);
  },

  getById: async (id: string): Promise<Topic> => {
    return apiClient.get<Topic>(`/core/topics/${id}/`);
  },

  create: async (data: { name: string; slug: string; description?: string }): Promise<Topic> => {
    return apiClient.post<Topic>('/core/topics/create/', data);
  },

  update: async (id: string, data: Partial<{ name: string; slug: string; description: string }>): Promise<Topic> => {
    return apiClient.put<Topic>(`/core/topics/${id}/update/`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/core/topics/${id}/delete/`);
  },
};

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/content/categories/');
  },
};

export const instructorCoursesApi = {
  getAll: async (filters?: {
    category?: string;
    level?: string;
    search?: string;
    topics?: string;
  }): Promise<Course[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.topics) params.append('topics', filters.topics);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Course[]>(`/content/courses/${query}`);
  },

  getById: async (id: string): Promise<Course> => {
    return apiClient.get<Course>(`/content/courses/${id}/`);
  },

  create: async (data: CourseFormData): Promise<Course> => {
    return apiClient.post<Course>('/content/courses/', data);
  },

  update: async (id: string, data: Partial<CourseFormData>): Promise<Course> => {
    return apiClient.put<Course>(`/content/courses/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/content/courses/${id}/`);
  },

  togglePublish: async (id: string, is_published: boolean): Promise<Course> => {
    return apiClient.patch<Course>(`/content/courses/${id}/`, { is_published });
  },
};

export const modulesApi = {
  getByCourse: async (courseId: string): Promise<Module[]> => {
    return apiClient.get<Module[]>(`/content/courses/${courseId}/modules/`);
  },

  getById: async (id: string): Promise<Module> => {
    return apiClient.get<Module>(`/content/modules/${id}/`);
  },

  create: async (data: ModuleFormData): Promise<Module> => {
    return apiClient.post<Module>('/content/modules/', data);
  },

  update: async (id: string, data: Partial<ModuleFormData>): Promise<Module> => {
    return apiClient.put<Module>(`/content/modules/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/content/modules/${id}/`);
  },
};

export const lessonsApi = {
  getByModule: async (moduleId: string): Promise<Lesson[]> => {
    return apiClient.get<Lesson[]>(`/content/modules/${moduleId}/lessons/`);
  },

  getById: async (id: string): Promise<Lesson> => {
    return apiClient.get<Lesson>(`/content/lessons/${id}/`);
  },

  create: async (data: LessonFormData): Promise<Lesson> => {
    return apiClient.post<Lesson>('/content/lessons/', data);
  },

  update: async (id: string, data: Partial<LessonFormData>): Promise<Lesson> => {
    return apiClient.put<Lesson>(`/content/lessons/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/content/lessons/${id}/`);
  },
};

export const uploadApi = {
  uploadFile: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string }> => {
    // Note: This is a placeholder. Backend file upload endpoint needs to be implemented
    // For now, simulate upload
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress?.(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            url: `https://example.com/uploads/${file.name}`,
          });
        }
      }, 100);
    });
  },
};
