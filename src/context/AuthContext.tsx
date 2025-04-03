
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if there's a logged-in user in localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading user: ', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get users from localStorage
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user with matching email
      const user = users.find((u) => u.email === email);

      if (!user) {
        throw new Error('User not found');
      }

      // Check password
      if (user.password !== password) {
        throw new Error('Incorrect password');
      }

      // Save current user
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      toast({
        title: 'Success',
        description: 'Welcome back!',
      });
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      toast({
        title: 'Login Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get users from localStorage
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

      // Check if user already exists
      if (users.some((u) => u.email === userData.email)) {
        throw new Error('Email already in use');
      }

      // Create new user
      const newUser: User = {
        ...userData,
        id: `user_${uuidv4()}`,
        bookings: [],
        profileComplete: false,
        isPremium: false
      };

      // Add to users array
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Set as current user
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      toast({
        title: 'Account Created',
        description: 'Your account has been created successfully.',
      });
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      toast({
        title: 'Signup Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Remove current user from localStorage and state
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const completeProfile = async (profileData: User['profileData']): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      if (!currentUser) {
        throw new Error('No user is logged in');
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user profile
      const updatedUser: User = {
        ...currentUser,
        profileComplete: true,
        profileData,
      };

      // Update current user in state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update user in users array
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u) => 
        u.id === updatedUser.id ? updatedUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      toast({
        title: 'Profile Completed',
        description: 'Your profile has been completed successfully.',
      });
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPremium = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      if (!currentUser) {
        throw new Error('No user is logged in');
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user premium status
      const updatedUser: User = {
        ...currentUser,
        isPremium: true,
      };

      // Update current user in state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update user in users array
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u) => 
        u.id === updatedUser.id ? updatedUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      toast({
        title: 'Premium Activated',
        description: 'You are now a premium user with access to all features.',
      });
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        login,
        signup,
        logout,
        completeProfile,
        upgradeToPremium,
      }}
    >
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
