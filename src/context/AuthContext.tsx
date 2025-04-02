
import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthContextType } from '../types';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize localStorage on first load
  useEffect(() => {
    try {
      // Check if users array exists in localStorage
      const users = localStorage.getItem('users');
      if (!users) {
        localStorage.setItem('users', JSON.stringify([]));
      }

      // Check if there's a current user session
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      toast({
        title: 'Error',
        description: 'There was an error loading your session.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const user = users.find((u) => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Save email for "remember me" functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      setCurrentUser(user);
      
      toast({
        title: 'Success!',
        description: 'You have successfully logged in.',
      });

    } catch (err) {
      setError((err as Error).message);
      toast({
        title: 'Login Failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      
      // Check if email already exists
      if (users.some((u) => u.email === userData.email)) {
        throw new Error('This email is already registered');
      }

      // Create new user
      const newUser: User = {
        ...userData,
        id: `user_${uuidv4()}`,
        bookings: [],
        profileComplete: false,
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      toast({
        title: 'Success!',
        description: 'Your account has been created. Please log in.',
      });

    } catch (err) {
      setError((err as Error).message);
      toast({
        title: 'Signup Failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const completeProfile = async (profileData: User['profileData']) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    setIsLoading(true);
    
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user profile
      const updatedUser: User = {
        ...users[userIndex],
        profileComplete: true,
        profileData: profileData,
      };
      
      // Update in users array
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully completed!',
      });

    } catch (err) {
      setError((err as Error).message);
      toast({
        title: 'Error',
        description: (err as Error).message,
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
        login,
        signup,
        logout,
        completeProfile,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
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
