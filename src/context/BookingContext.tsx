
import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Booking, BookingContextType } from '../types';
import { useToast } from '@/hooks/use-toast';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize bookings from localStorage
  useEffect(() => {
    try {
      const storedBookings = localStorage.getItem('bookings');
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      } else {
        localStorage.setItem('bookings', JSON.stringify([]));
      }
    } catch (err) {
      console.error('Error initializing bookings:', err);
      setError('Failed to load bookings');
      toast({
        title: 'Error',
        description: 'Failed to load your bookings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (bookings.length > 0 || !loading) {
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a new booking ID
      const newBookingId = `booking_${uuidv4()}`;

      // Create new booking
      const newBooking: Booking = {
        ...bookingData,
        id: newBookingId,
        createdAt: new Date().toISOString(),
      };

      // Add to bookings array
      setBookings((prev) => [...prev, newBooking]);

      // Add booking to user's bookings array
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === bookingData.userId);
        
        if (userIndex !== -1) {
          users[userIndex].bookings.push(newBookingId);
          localStorage.setItem('users', JSON.stringify(users));
          
          // Update current user if this is their booking
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
          if (currentUser && currentUser.id === bookingData.userId) {
            currentUser.bookings.push(newBookingId);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
        }
      } catch (err) {
        console.error('Error updating user bookings:', err);
      }

      toast({
        title: 'Booking Confirmed!',
        description: 'Your booking has been successfully created.',
      });

      return newBookingId;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to create booking';
      setError(errorMsg);
      toast({
        title: 'Booking Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find booking index
      const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
      if (bookingIndex === -1) {
        throw new Error('Booking not found');
      }

      // Calculate refund based on timing
      const booking = bookings[bookingIndex];
      const checkInDate = new Date(booking.checkIn);
      const hoursLeft = (checkInDate.getTime() - Date.now()) / (1000 * 60 * 60);
      const refundPercent = hoursLeft > 24 ? 100 : hoursLeft > 12 ? 50 : 0;

      // Update booking status
      const updatedBooking: Booking = {
        ...booking,
        status: 'cancelled',
      };

      // Update bookings array
      const updatedBookings = [...bookings];
      updatedBookings[bookingIndex] = updatedBooking;
      setBookings(updatedBookings);

      toast({
        title: 'Booking Cancelled',
        description: refundPercent > 0 
          ? `You will receive a ${refundPercent}% refund within 3-5 business days.`
          : 'No refund is available for this cancellation.',
      });

    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to cancel booking';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBookingById = (bookingId: string) => {
    return bookings.find((b) => b.id === bookingId);
  };

  const getUserBookings = (userId: string) => {
    return bookings.filter((b) => b.userId === userId);
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        cancelBooking,
        getBookingById,
        getUserBookings,
        loading,
        error,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};
