'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'MAIN_ADMIN' | 'SUPER_ADMIN' | 'SUB_ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT';
  departmentId?: string;
  shift?: string;
  year?: string;
  rollNumber?: string;
  enrollmentNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        if (pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
        return;
      }

      try {
        const res = await api.get('/users/profile');
        setUser(res.data);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        if (pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [pathname, router]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    
    // Simplify redirection to central dashboard
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
