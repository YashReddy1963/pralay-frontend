import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, navigate: (path: string) => void) => Promise<void>;
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    role: 'user' | 'state_chairman' | 'district_chairman' | 'nagar_panchayat_chairman' | 'village_sarpanch' | 'other' | 'admin';
  }, navigate: (path: string) => void) => Promise<void>;
  logout: (navigate: (path: string) => void) => void;
  redirectBasedOnRole: (role: string, navigate: (path: string) => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, navigate: (path: string) => void) => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.token) {
        apiService.setAuthToken(response.token);
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      // Redirect based on user role
      redirectBasedOnRole(response.user.role, navigate);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    role: 'user' | 'state_chairman' | 'district_chairman' | 'nagar_panchayat_chairman' | 'village_sarpanch' | 'other' | 'admin';
  }, navigate: (path: string) => void) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.token) {
        apiService.setAuthToken(response.token);
      }
      
      setUser(response.user);
      
      // Redirect based on user role
      redirectBasedOnRole(response.user.role, navigate);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (navigate: (path: string) => void) => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and redirect
      setUser(null);
      navigate('/');
    }
  };

  const redirectBasedOnRole = (role: string, navigate: (path: string) => void) => {
    switch (role) {
      case 'user':
        navigate('/citizen');
        break;
      case 'state_chairman':
      case 'district_chairman':
      case 'nagar_panchayat_chairman':
      case 'village_sarpanch':
        navigate('/dashboard');
        break;
      case 'team_member':
        navigate('/dashboard'); // Team members use the same dashboard as authorities
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    redirectBasedOnRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
