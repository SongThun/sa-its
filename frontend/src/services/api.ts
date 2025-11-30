import type { User, Course, EnrollmentProgress, EnrolledCourse } from '../types';
import { apiClient, type ApiError } from './apiClient';

interface EnrollmentResponse {
  id: string;
  course_id: string;
  course_title: string;
  status: 'started' | 'in_progress' | 'completed';
  progress_percent: string;
  is_active: boolean;
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
}

interface EnrollmentStatusResponse {
  is_enrolled: boolean;
  enrollment?: EnrollmentResponse;
}

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

function transformUser(backendUser: BackendUser): User {
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
    if (!apiClient.hasTokens()) {
      localStorage.removeItem('currentUser');
      return null;
    }

    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User | null> => {
    try {
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

export const courseApi = {
  getAllCourses: async (): Promise<Course[]> => {
    return apiClient.get<Course[]>('/content/courses/');
  },

  getCourseById: async (id: string): Promise<Course | null> => {
    try {
      return await apiClient.get<Course>(`/content/courses/${id}/`);
    } catch {
      return null;
    }
  },

  searchCourses: async (query: string): Promise<Course[]> => {
    return apiClient.get<Course[]>(`/content/courses/?search=${encodeURIComponent(query)}`);
  },

  getCoursesByCategory: async (category: string): Promise<Course[]> => {
    return apiClient.get<Course[]>(`/content/courses/?category=${encodeURIComponent(category)}`);
  },

  getCategories: async (): Promise<string[]> => {
    const categories = await apiClient.get<Array<{ id: number; name: string }>>('/content/categories/');
    return categories.map(c => c.name);
  },
};

export const enrollmentApi = {
  enrollInCourse: async (courseId: string): Promise<boolean> => {
    try {
      await apiClient.post<EnrollmentResponse>(`/learning/courses/${courseId}/enroll/`, {});
      return true;
    } catch (error) {
      console.error('Enroll error:', error);
      return false;
    }
  },

  unenrollFromCourse: async (courseId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/learning/courses/${courseId}/unenroll/`, {});
      return true;
    } catch (error) {
      console.error('Unenroll error:', error);
      return false;
    }
  },

  isEnrolled: async (courseId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<EnrollmentStatusResponse>(
        `/learning/courses/${courseId}/enrollment-status/`
      );
      return response.is_enrolled;
    } catch {
      return false;
    }
  },

  getMyCoursesWithProgress: async (status?: 'ongoing' | 'completed'): Promise<EnrolledCourse[]> => {
    try {
      const query = status ? `?status=${status}` : '';
      return await apiClient.get<EnrolledCourse[]>(`/learning/my-courses/${query}`);
    } catch {
      return [];
    }
  },

  getEnrolledCourses: async (): Promise<EnrolledCourse[]> => {
    try {
      return await apiClient.get<EnrolledCourse[]>('/learning/my-courses/');
    } catch {
      return [];
    }
  },

  getOngoingCourses: async (): Promise<EnrolledCourse[]> => {
    try {
      return await apiClient.get<EnrolledCourse[]>('/learning/my-courses/?status=ongoing');
    } catch {
      return [];
    }
  },

  getCourseProgress: async (courseId: string): Promise<EnrollmentProgress> => {
    try {
      return await apiClient.get<EnrollmentProgress>(
        `/learning/courses/${courseId}/progress/`
      );
    } catch {
      return {
        enrollment_id: '',
        course_id: courseId,
        progress: 0,
        status: 'started',
        completedLessons: [],
        completedModules: [],
        last_accessed_at: null,
        completed_at: null,
      };
    }
  },
};

export const progressApi = {
  completeLesson: async (courseId: string, lessonId: string): Promise<EnrollmentProgress | null> => {
    try {
      return await apiClient.post<EnrollmentProgress>(
        `/learning/courses/${courseId}/lessons/${lessonId}/complete/`,
        {}
      );
    } catch (error) {
      console.error('Complete lesson error:', error);
      return null;
    }
  },

  uncompleteLesson: async (courseId: string, lessonId: string): Promise<EnrollmentProgress | null> => {
    try {
      return await apiClient.delete<EnrollmentProgress>(
        `/learning/courses/${courseId}/lessons/${lessonId}/complete/`
      );
    } catch (error) {
      console.error('Uncomplete lesson error:', error);
      return null;
    }
  },

  updateLastAccessed: async (): Promise<void> => {},
};

import type { Topic, Category, ModuleFormData, LessonFormData, Module, Lesson } from '../types';

export const topicsApi = {
  getAll: async (search?: string): Promise<Topic[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<Topic[]>(`/content/topics/${query}`);
  },

  getById: async (id: string): Promise<Topic> => {
    return apiClient.get<Topic>(`/content/topics/${id}/`);
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
    return apiClient.get<Course[]>(`/content/instructor/courses/${query}`);
  },

  getById: async (id: string): Promise<Course> => {
    return apiClient.get<Course>(`/content/instructor/courses/${id}/`);
  },

  create: async (data: Record<string, unknown>): Promise<Course> => {
    return apiClient.post<Course>('/content/instructor/courses/', data);
  },

  update: async (id: string, data: Record<string, unknown>): Promise<Course> => {
    return apiClient.patch<Course>(`/content/instructor/courses/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/content/instructor/courses/${id}/`);
  },

  togglePublish: async (id: string, publish: boolean): Promise<Course> => {
    const action = publish ? 'publish' : 'unpublish';
    return apiClient.post<Course>(`/content/instructor/courses/${id}/${action}/`, {});
  },
};

export const modulesApi = {
  getByCourse: async (courseId: string): Promise<Module[]> => {
    return apiClient.get<Module[]>(`/content/courses/${courseId}/modules/`);
  },

  getById: async (id: string): Promise<Module> => {
    return apiClient.get<Module>(`/content/instructor/modules/${id}/`);
  },

  create: async (data: ModuleFormData): Promise<Module> => {
    return apiClient.post<Module>('/content/instructor/modules/', data);
  },

  update: async (id: string, data: Partial<ModuleFormData>): Promise<Module> => {
    return apiClient.patch<Module>(`/content/instructor/modules/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/content/instructor/modules/${id}/`);
  },
};

export const lessonsApi = {
  getByModule: async (moduleId: string): Promise<Lesson[]> => {
    return apiClient.get<Lesson[]>(`/content/modules/${moduleId}/lessons/`);
  },

  getById: async (id: string): Promise<Lesson> => {
    return apiClient.get<Lesson>(`/content/instructor/lessons/${id}/`);
  },

  create: async (data: LessonFormData): Promise<Lesson> => {
    return apiClient.post<Lesson>('/content/instructor/lessons/', data);
  },

  update: async (id: string, data: Partial<LessonFormData>): Promise<Lesson> => {
    return apiClient.patch<Lesson>(`/content/instructor/lessons/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/content/instructor/lessons/${id}/`);
  },
};
