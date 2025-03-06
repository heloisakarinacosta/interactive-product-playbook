
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

type User = {
  email: string;
  isAdmin: boolean;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Admin validation
      if (email === 'admin') {
        if (password !== '01928374') {
          toast.error('Invalid admin credentials');
          return false;
        }
        const adminUser = { email: 'admin', isAdmin: true };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast.success('Welcome Admin!');
        return true;
      }
      
      // Regular user validation (email only)
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email');
        return false;
      }
      
      const regularUser = { email, isAdmin: false };
      setUser(regularUser);
      localStorage.setItem('user', JSON.stringify(regularUser));
      
      // In a real implementation, we would log the access to a database here
      console.log('User accessed:', email, 'IP:', 'client-side-only');
      
      toast.success('Welcome!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
