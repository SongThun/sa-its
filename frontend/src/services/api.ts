import type { User, Course, EnrollmentProgress } from '../types';
import { mockUsers, mockCourses } from '../data/mockData';
import { apiClient, type ApiError } from './apiClient';

// Simulate API delay for mock endpoints
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Backend API response types
interface BackendUser {
  id: number;
  username: string;
  email: string;
  fullname: string;
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
    id: String(backendUser.id),
    email: backendUser.email,
    firstName,
    lastName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName || backendUser.username}`,
    bio: '',
    enrolledCourses: [],
    completedLessons: [],
    createdAt: backendUser.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
}

// Auth API - Uses real backend
export const authApi = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login/', {
        email,
        password,
      });

      // Save tokens
      apiClient.saveTokens(response.tokens);

      // Transform and save user
      const user = transformUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Login error:', apiError.message);
      throw new Error(apiError.message || 'Invalid email or password');
    }
  },

  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<User | null> => {
    try {
      // Generate username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const fullname = `${firstName} ${lastName}`.trim();

      await apiClient.post<RegisterResponse>('/auth/register/', {
        email,
        password,
        password_confirm: password,
        username,
        fullname,
      });

      // After registration, login to get tokens
      return await authApi.login(email, password);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Register error:', apiError.message);
      throw new Error(apiError.message || 'Registration failed');
    }
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
