import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>) => Promise<void>;
  logout: () => void;
  completeProfile: (profileData: User['profileData']) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  cancelPremium: () => Promise<void>;
  withdrawPremium: () => Promise<void>;
  addBooking: (bookingData: {
    destinationIds: string[];
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u) => u.email === email);

      if (!user) throw new Error('User not found');
      if (user.password !== password) throw new Error('Incorrect password');

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

  // Signup function
  const signup = async (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
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

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  // Complete profile function
  const completeProfile = async (profileData: User['profileData']): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      if (!currentUser) throw new Error('No user is logged in');

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

  // Upgrade to premium function
  const upgradeToPremium = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      if (!currentUser) throw new Error('You must be logged in to upgrade');

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
        description: 'You are now a premium member!',
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to upgrade';
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

  // Add booking function
  const addBooking = async (bookingData: {
    destinationIds: string[];
    startDate: string;
    endDate: string;
  }): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      if (!currentUser) throw new Error('You must be logged in to add a booking');

      const newBooking = {
        id: `booking_${uuidv4()}`,
        ...bookingData
      };

      const updatedUser: User = {
        ...currentUser,
        bookings: [...(currentUser.bookings || []), newBooking]
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
        title: 'Booking Added',
        description: 'Your booking has been recorded.',
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to add booking';
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

  // Other premium management functions (cancelPremium, withdrawPremium) would go here...

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    completeProfile,
    upgradeToPremium,
    cancelPremium: async () => {}, // Implementation would go here
    withdrawPremium: async () => {}, // Implementation would go here
    addBooking,
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
