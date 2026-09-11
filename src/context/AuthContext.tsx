import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isLogged = localStorage.getItem('dummy_logged_in') === 'true';
      if (isLogged) {
         try {
           const response = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Authorization': `Bearer DUMMY_TOKEN` }
           });
           if (response.ok) {
             const dbUser = await response.json();
             setUser(dbUser);
           } else {
             setUser(null);
             localStorage.removeItem('dummy_logged_in');
           }
         } catch(e) {
           setUser(null);
         }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async () => {
    localStorage.setItem('dummy_logged_in', 'true');
    setUser({ id: 'dummy-user-id', email: 'test@example.com', name: 'Test User', created_at: '' });
  };

  const logout = async () => {
    localStorage.removeItem('dummy_logged_in');
    setUser(null);
  };

  const getToken = async () => {
    if (localStorage.getItem('dummy_logged_in') === 'true') {
      return 'DUMMY_TOKEN';
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, getToken }}>
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
