import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'sonner';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  bio?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'student' | 'teacher') => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('readify_user');
    const storedToken = localStorage.getItem('readify_token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Verify token is still valid
        API.get('/auth/me')
          .then((res) => {
            const updatedUser = { ...res.data, token: storedToken, id: res.data._id };
            setUser(updatedUser);
            localStorage.setItem('readify_user', JSON.stringify(updatedUser));
          })
          .catch(() => {
            // Token expired
            localStorage.removeItem('readify_user');
            localStorage.removeItem('readify_token');
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      } catch {
        localStorage.removeItem('readify_user');
        localStorage.removeItem('readify_token');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('readify_user', JSON.stringify(userData));
    localStorage.setItem('readify_token', userData.token);
  };

  const signIn = async (email: string, password: string) => {
    const { data } = await API.post('/auth/login', { email, password });
    const userData: User = {
      ...data,
      id: data._id,
    };
    login(userData);
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher' = 'student'
  ) => {
    const { data } = await API.post('/auth/register', { name, email, password, role });
    toast.success('Account created! You are now logged in.');
    const userData: User = {
      ...data,
      id: data._id,
    };
    login(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('readify_user');
    localStorage.removeItem('readify_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signIn, signUp, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
