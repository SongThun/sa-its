import { createContext, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

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

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const loggedInUser = await authApi.login(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
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
      const newUser = await authApi.register(email, password, firstName, lastName);
      if (newUser) {
        setUser(newUser);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    await authApi.logout();
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
