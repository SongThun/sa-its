import type { User, Course, EnrollmentProgress } from '../types';
import { mockUsers, mockCourses } from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<User | null> => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length >= 6) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: async (email: string, _password: string, firstName: string, lastName: string): Promise<User | null> => {
    await delay(500);
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      firstName,
      lastName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
      bio: '',
      enrolledCourses: [],
      completedLessons: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    mockUsers.push(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
  },

  logout: async (): Promise<void> => {
    await delay(200);
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User | null> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      localStorage.setItem('currentUser', JSON.stringify(mockUsers[userIndex]));
      return mockUsers[userIndex];
    }
    return null;
  },
};

// Course API
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

// Enrollment API
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

// Progress API
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
