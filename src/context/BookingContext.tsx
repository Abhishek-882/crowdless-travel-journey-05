
import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Booking, BookingContextType, TripPlan } from '../types';
import { useToast } from '@/hooks/use-toast';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
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
      
      // Also load trip plans
      const storedTripPlans = localStorage.getItem('tripPlans');
      if (storedTripPlans) {
        setTripPlans(JSON.parse(storedTripPlans));
      } else {
        localStorage.setItem('tripPlans', JSON.stringify([]));
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

  // Save trip plans to localStorage whenever they change
  useEffect(() => {
    if (tripPlans.length > 0 || !loading) {
      localStorage.setItem('tripPlans', JSON.stringify(tripPlans));
    }
  }, [tripPlans]);

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

  const saveTripPlan = async (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a new trip plan ID
      const newTripPlanId = `trip_${uuidv4()}`;

      // Create new trip plan
      const newTripPlan: TripPlan = {
        ...tripPlanData,
        id: newTripPlanId,
        createdAt: new Date().toISOString(),
      };

      // Add to trip plans array
      setTripPlans((prev) => [...prev, newTripPlan]);

      // Also create a regular booking entry so it appears in the user's bookings
      const bookingData = {
        id: `booking_${uuidv4()}`,
        userId: tripPlanData.userId,
        destinationId: tripPlanData.selectedDestinations[0], // Use the first destination for the booking
        checkIn: tripPlanData.startDate,
        timeSlot: '09:00 AM', // Default time
        visitors: tripPlanData.numberOfPeople,
        ticketType: 'standard',
        totalAmount: tripPlanData.totalCost,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
        tripPlanId: newTripPlanId, // Link to the trip plan
      };

      // Add to bookings array
      setBookings((prev) => [...prev, bookingData]);

      // Update user's bookings array
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === tripPlanData.userId);
        
        if (userIndex !== -1) {
          users[userIndex].bookings.push(bookingData.id);
          localStorage.setItem('users', JSON.stringify(users));
          
          // Update current user if this is their booking
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
          if (currentUser && currentUser.id === tripPlanData.userId) {
            currentUser.bookings.push(bookingData.id);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
        }
      } catch (err) {
        console.error('Error updating user bookings:', err);
      }

      toast({
        title: 'Trip Plan Confirmed!',
        description: 'Your trip has been successfully booked.',
      });

      return newTripPlanId;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to save trip plan';
      setError(errorMsg);
      toast({
        title: 'Trip Booking Failed',
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
    // Get both regular bookings and trip plans
    const userBookings = bookings.filter((b) => b.userId === userId);
    
    // Get trip-related bookings
    const userTripPlans = tripPlans.filter((t) => t.userId === userId);
    
    return userBookings;
  };

  const getUserTripPlans = (userId: string) => {
    return tripPlans.filter((t) => t.userId === userId);
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        tripPlans,
        addBooking,
        cancelBooking,
        getBookingById,
        getUserBookings,
        getUserTripPlans,
        saveTripPlan,
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
