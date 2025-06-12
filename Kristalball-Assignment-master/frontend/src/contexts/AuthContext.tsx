import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Admin' | 'Base Commander' | 'Logistics Officer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  base: string;
  email: string;
  militaryId?: string;
  rank?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  base: string;
  militaryId: string;
  rank: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: string, resource?: string) => boolean;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - in production, this would authenticate with a real backend
    if (email === 'admin@military.gov' && password === 'admin123') {
      setUser({
        id: '1',
        name: 'Colonel Sarah Johnson',
        role: 'Admin',
        base: 'All Bases',
        email: 'admin@military.gov',
        militaryId: 'ADM001',
        rank: 'Colonel'
      });
      return true;
    } else if (email === 'commander@base1.mil' && password === 'commander123') {
      setUser({
        id: '2',
        name: 'Major Robert Davis',
        role: 'Base Commander',
        base: 'Fort Alpha',
        email: 'commander@base1.mil',
        militaryId: 'CMD001',
        rank: 'Major'
      });
      return true;
    } else if (email === 'logistics@base1.mil' && password === 'logistics123') {
      setUser({
        id: '3',
        name: 'Lieutenant Maria Garcia',
        role: 'Logistics Officer',
        base: 'Fort Alpha',
        email: 'logistics@base1.mil',
        militaryId: 'LOG001',
        rank: 'Lieutenant'
      });
      return true;
    }
    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    // Simulate API call - in production, this would register with a real backend
    // For demo purposes, we'll simulate successful registration
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real system, this would:
      // 1. Validate the data
      // 2. Check for existing users
      // 3. Hash the password
      // 4. Store in database with pending approval status
      // 5. Send notification to administrators
      // 6. Send confirmation email to user
      
      console.log('Registration data:', data);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!user) return false;

    switch (user.role) {
      case 'Admin':
        return true;
      case 'Base Commander':
        if (action === 'manage_users') return false;
        if (resource && resource !== user.base && resource !== 'All Bases') {
          return action === 'view_summary';
        }
        return true;
      case 'Logistics Officer':
        if (action === 'manage_users' || action === 'approve_transfers') return false;
        if (resource && resource !== user.base && resource !== 'All Bases') {
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};