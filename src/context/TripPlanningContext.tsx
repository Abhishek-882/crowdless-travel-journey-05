import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  TripPlanningContextType, 
  HotelType, 
  TransportType, 
  GuideType, 
  TripPlan,
  Destination
} from '../types';
import { hotels } from '../data/hotels';
import { transports } from '../data/transports';
import { guides } from '../data/guides';
import { useToast } from '@/hooks/use-toast';
import { useBookings } from './BookingContext';
import { useDestinations } from './DestinationContext';

const TripPlanningContext = createContext<TripPlanningContextType | undefined>(undefined);

export const TripPlanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveTripPlan: saveBookingTripPlan } = useBookings();
  const { destinations } = useDestinations();

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

  const calculateTravelTimeBetweenDestinations = (from: Destination, to: Destination, transportType: string): number => {
    // Calculate distance using coordinates (simple Euclidean distance for demonstration)
    const latDiff = from.coordinates.lat - to.coordinates.lat;
    const lngDiff = from.coordinates.lng - to.coordinates.lng;
    const distanceKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough conversion to kilometers
    
    // Calculate travel time based on transport type
    let speedKmPerHour = 60; // Default speed
    
    if (transportType === 'bus') speedKmPerHour = 50;
    else if (transportType === 'train') speedKmPerHour = 80;
    else if (transportType === 'flight') speedKmPerHour = 500;
    else if (transportType === 'car') speedKmPerHour = 60;
    
    return distanceKm / speedKmPerHour;
  };

  const checkTripFeasibility = (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
  }) => {
    if (options.destinationIds.length <= 1) {
      return { feasible: true, daysNeeded: options.numberOfDays };
    }
    
    // Get destinations data
    const selectedDestinations = options.destinationIds.map(id => 
      destinations.find(dest => dest.id === id)
    ).filter(Boolean) as Destination[];
    
    if (selectedDestinations.length <= 1) {
      return { feasible: true, daysNeeded: options.numberOfDays };
    }
    
    // Calculate minimum visit time per destination (1 day)
    const visitDaysNeeded = selectedDestinations.length;
    
    // Calculate travel time between destinations
    let totalTravelTimeHours = 0;
    for (let i = 0; i < selectedDestinations.length - 1; i++) {
      const from = selectedDestinations[i];
      const to = selectedDestinations[i + 1];
      totalTravelTimeHours += calculateTravelTimeBetweenDestinations(from, to, options.transportType);
    }
    
    // Convert travel hours to days (assume 8 hours of travel per day)
    const travelDaysNeeded = Math.ceil(totalTravelTimeHours / 8);
    
    // Total days needed = visit days + travel days
    const totalDaysNeeded = visitDaysNeeded + travelDaysNeeded;
    
    return {
      feasible: totalDaysNeeded <= options.numberOfDays,
      daysNeeded: totalDaysNeeded,
      daysShort: totalDaysNeeded - options.numberOfDays
    };
  };
  
  const generateOptimalItinerary = (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    startDate: Date;
  }) => {
    const selectedDestinations = options.destinationIds.map(id => 
      destinations.find(dest => dest.id === id)
    ).filter(Boolean) as Destination[];
    
    if (!selectedDestinations.length) return [];
    
    const itinerary = [];
    let currentDate = new Date(options.startDate);
    let currentDestIndex = 0;
    
    // Create day-by-day itinerary
    for (let day = 1; day <= options.numberOfDays; day++) {
      if (currentDestIndex < selectedDestinations.length) {
        const destination = selectedDestinations[currentDestIndex];
        
        // Add a day at this destination
        itinerary.push({
          day,
          date: new Date(currentDate),
          destinationId: destination.id,
          destinationName: destination.name,
          activities: ["Explore " + destination.name],
          isTransitDay: false
        });
        
        // Check if we need to travel to the next destination
        if (currentDestIndex < selectedDestinations.length - 1) {
          const nextDest = selectedDestinations[currentDestIndex + 1];
          const travelTime = calculateTravelTimeBetweenDestinations(
            destination, 
            nextDest, 
            options.transportType
          );
          
          // If travel time > 4 hours, next day will be transit day
          if (travelTime > 4) {
            // Add a transit day
            currentDate.setDate(currentDate.getDate() + 1);
            day++;
            
            if (day <= options.numberOfDays) {
              itinerary.push({
                day,
                date: new Date(currentDate),
                destinationId: nextDest.id,
                destinationName: nextDest.name,
                activities: [`Travel from ${destination.name} to ${nextDest.name}`],
                isTransitDay: true
              });
            }
          }
          
          currentDestIndex++;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return itinerary;
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
        checkTripFeasibility,
        generateOptimalItinerary
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
