import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';
import { apiClient } from '../services/apiClient';

interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  refreshUser: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());

  // Listen for logout events from apiClient (e.g., when token refresh fails)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authApi.login({ email, password });
      if (response?.user) {
        // Save authentication tokens
        if (response.tokens) {
          apiClient.saveTokens(response.tokens);
        }

        const transformedUser: User = {
          id: response.user.id,
          email: response.user.email,
          first_name: response.user.first_name || response.user.fullname?.split(' ')[0] || '',
          last_name: response.user.last_name || response.user.fullname?.split(' ').slice(1).join(' ') || '',
          full_name: response.user.fullname,
          role: response.user.role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.username}`,
          bio: '',
          enrolled_courses: [],
          completed_lessons: [],
          created_at: response.user.created_at,
        };
        localStorage.setItem('currentUser', JSON.stringify(transformedUser));
        setUser(transformedUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (error: unknown) {
      const apiError = error as { message?: string; errors?: Record<string, string[]> };
      const message = apiError?.message || 'An error occurred';
      return { success: false, error: message };
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResult> => {
    try {
      const response = await authApi.register({
        email,
        password,
        password_confirm: password,
        username: email.split('@')[0],
        fullname: `${firstName} ${lastName}`.trim(),
        role: 'student',
      });
      if (response?.user) {
        // Registration successful - user needs to login separately
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error: unknown) {
      const apiError = error as { message?: string; errors?: Record<string, string[]> };
      const message = apiError?.message || 'An error occurred';
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    await authApi.logout();
    apiClient.removeTokens();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    if (user) {
      const updatedUser = await authApi.updateProfile(user.id, updates);
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      }
    }
    return false;
  };

  const refreshUser = () => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: false,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
