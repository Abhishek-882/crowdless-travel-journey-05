
import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  TripPlanningContextType, 
  HotelType, 
  TransportType, 
  GuideType, 
  TripPlan 
} from '../types';
import { hotels } from '../data/hotels';
import { transports } from '../data/transports';
import { guides } from '../data/guides';
import { useToast } from '@/hooks/use-toast';
import { useBookings } from './BookingContext';

const TripPlanningContext = createContext<TripPlanningContextType | undefined>(undefined);

export const TripPlanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveTripPlan: saveBookingTripPlan } = useBookings();

  // Initialize trip plans from localStorage
  useEffect(() => {
    try {
      const storedTripPlans = localStorage.getItem('tripPlans');
      if (storedTripPlans) {
        setTripPlans(JSON.parse(storedTripPlans));
      } else {
        localStorage.setItem('tripPlans', JSON.stringify([]));
      }
    } catch (err) {
      console.error('Error initializing trip plans:', err);
      setError('Failed to load trip plans');
      toast({
        title: 'Error',
        description: 'Failed to load your trip plans.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Save trip plans to localStorage whenever they change
  useEffect(() => {
    if (tripPlans.length > 0 || !loading) {
      localStorage.setItem('tripPlans', JSON.stringify(tripPlans));
    }
  }, [tripPlans]);

  const getHotelsByDestination = (destinationId: string): HotelType[] => {
    return hotels.filter(hotel => hotel.destinationId === destinationId);
  };

  const getGuidesByDestination = (destinationId: string): GuideType[] => {
    return guides.filter(guide => guide.destinationId === destinationId);
  };

  const calculateTripCost = (options: {
    destinationIds: string[];
    guideIds: string[];
    hotelType: 'budget' | 'standard' | 'luxury';
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    numberOfPeople: number;
  }) => {
    // Calculate destinations cost
    const destinationsCost = options.destinationIds.reduce((total, destId) => {
      return total; // Placeholder for actual calculation
    }, 0);

    // Calculate hotels cost based on hotel type
    let totalHotelsCost = 0;
    options.destinationIds.forEach(destId => {
      const hotelsInDestination = getHotelsByDestination(destId);
      const hotel = hotelsInDestination.find(h => h.type === options.hotelType);
      if (hotel) {
        // Reducing hotel costs as requested
        const pricePerPerson = hotel.type === 'budget' ? 500 :
                              hotel.type === 'standard' ? 1000 : 1500;
        totalHotelsCost += pricePerPerson * options.numberOfPeople * options.numberOfDays;
      }
    });

    // Calculate transport cost
    const transport = transports.find(t => t.type === options.transportType);
    const transportCost = transport 
      ? transport.pricePerPerson * options.numberOfPeople * options.destinationIds.length
      : 0;

    // Calculate guides cost
    const guidesCost = options.guideIds.reduce((total, guideId) => {
      const guide = guides.find(g => g.id === guideId);
      return total + (guide ? guide.pricePerDay * options.numberOfDays : 0);
    }, 0);

    // Calculate total cost
    const totalCost = destinationsCost + totalHotelsCost + transportCost + guidesCost;

    return {
      destinationsCost,
      hotelsCost: totalHotelsCost,
      transportCost,
      guidesCost,
      totalCost
    };
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

      // Also save the trip plan to the bookings context to ensure it appears in booking history
      await saveBookingTripPlan(tripPlanData);
      
      toast({
        title: 'Trip Plan Saved!',
        description: 'Your trip plan has been successfully created.',
      });

      return newTripPlanId;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to create trip plan';
      setError(errorMsg);
      toast({
        title: 'Trip Planning Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserTripPlans = (userId: string): TripPlan[] => {
    return tripPlans.filter((plan) => plan.userId === userId);
  };

  const getTripPlanById = (tripPlanId: string): TripPlan | undefined => {
    return tripPlans.find((plan) => plan.id === tripPlanId);
  };

  const cancelTripPlan = async (tripPlanId: string): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find trip plan index
      const tripPlanIndex = tripPlans.findIndex((plan) => plan.id === tripPlanId);
      if (tripPlanIndex === -1) {
        throw new Error('Trip plan not found');
      }

      // Update trip plan status
      const updatedTripPlan: TripPlan = {
        ...tripPlans[tripPlanIndex],
        status: 'cancelled',
      };

      // Update trip plans array
      const updatedTripPlans = [...tripPlans];
      updatedTripPlans[tripPlanIndex] = updatedTripPlan;
      setTripPlans(updatedTripPlans);

      toast({
        title: 'Trip Plan Cancelled',
        description: 'Your trip plan has been cancelled successfully.',
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to cancel trip plan';
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

  return (
    <TripPlanningContext.Provider
      value={{
        hotels,
        transports,
        guides,
        tripPlans,
        loading,
        error,
        getHotelsByDestination,
        getGuidesByDestination,
        calculateTripCost,
        saveTripPlan,
        getUserTripPlans,
        getTripPlanById,
        cancelTripPlan,
      }}
    >
      {children}
    </TripPlanningContext.Provider>
  );
};

export const useTripPlanning = () => {
  const context = useContext(TripPlanningContext);
  if (context === undefined) {
    throw new Error('useTripPlanning must be used within a TripPlanningProvider');
  }
  return context;
};
