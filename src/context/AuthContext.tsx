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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      
      const user = users.find((u) => u.email === email);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.password !== password) {
        throw new Error('Incorrect password');
      }

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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

      if (users.some((u) => u.email === userData.email)) {
        throw new Error('Email already in use');
      }

      const newUser: User = {
        ...userData,
        id: `user_${uuidv4()}`,
        bookings: [],
        profileComplete: false,
        isPremium: false
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));

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

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedUser: User = {
        ...currentUser,
        profileComplete: true,
        profileData,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!currentUser) {
        throw new Error('You must be logged in to upgrade to premium');
      }

      const updatedUser: User = {
        ...currentUser,
        isPremium: true,
        premiumPurchaseDate: new Date().toISOString(),
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }

      toast({
        title: 'Upgrade Successful',
        description: 'You are now a premium member! You can cancel within 7 days for a full refund.',
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to upgrade to premium';
      setError(errorMsg);
      toast({
        title: 'Upgrade Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPremium = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!currentUser) {
        throw new Error('You must be logged in to cancel premium');
      }

      if (!currentUser.isPremium) {
        throw new Error('You do not have an active premium subscription');
      }

      const purchaseDate = currentUser.premiumPurchaseDate 
        ? new Date(currentUser.premiumPurchaseDate) 
        : new Date();
      const currentDate = new Date();
      const daysSincePurchase = Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSincePurchase > 7) {
        throw new Error('Premium can only be cancelled within 7 days of purchase');
      }

      const updatedUser: User = {
        ...currentUser,
        isPremium: false,
        premiumPurchaseDate: undefined,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }

      toast({
        title: 'Premium Cancelled',
        description: 'Your premium subscription has been cancelled.',
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to cancel premium';
      setError(errorMsg);
      toast({
        title: 'Cancellation Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    completeProfile,
    upgradeToPremium,
    cancelPremium,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
