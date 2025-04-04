
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

  // Calculate distance between two destinations using Haversine formula
  const calculateDistanceBetweenDestinations = (from: Destination, to: Destination): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (to.coordinates.lat - from.coordinates.lat) * Math.PI / 180;
    const dLon = (to.coordinates.lng - from.coordinates.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.coordinates.lat * Math.PI / 180) * Math.cos(to.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Calculate travel time between destinations based on transport type
  const calculateTravelTimeBetweenDestinations = (from: Destination, to: Destination, transportType: string): number => {
    // Calculate distance using coordinates (using Haversine formula)
    const distanceKm = calculateDistanceBetweenDestinations(from, to);
    
    // Calculate travel time based on transport type
    let speedKmPerHour = 60; // Default speed
    
    if (transportType === 'bus') speedKmPerHour = 50;
    else if (transportType === 'train') speedKmPerHour = 80;
    else if (transportType === 'flight') speedKmPerHour = 500;
    else if (transportType === 'car') speedKmPerHour = 60;
    
    return distanceKm / speedKmPerHour;
  };

  // Calculate total trip cost based on various factors
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

  // Get detailed distance matrix between all selected destinations
  const getDistanceMatrix = (destinationIds: string[]): {
    fromId: string;
    toId: string;
    fromName: string;
    toName: string;
    distanceKm: number;
    travelTimesByTransport: {
      [key: string]: number; // transport type -> hours
    };
  }[] => {
    const selectedDestinations = destinationIds.map(id => 
      destinations.find(d => d.id === id)
    ).filter(Boolean) as Destination[];
    
    if (selectedDestinations.length <= 1) return [];
    
    const matrix: {
      fromId: string;
      toId: string;
      fromName: string;
      toName: string;
      distanceKm: number;
      travelTimesByTransport: {
        [key: string]: number;
      };
    }[] = [];
    
    // Calculate distances between each pair of destinations
    for (let i = 0; i < selectedDestinations.length - 1; i++) {
      for (let j = i + 1; j < selectedDestinations.length; j++) {
        const from = selectedDestinations[i];
        const to = selectedDestinations[j];
        
        const distanceKm = calculateDistanceBetweenDestinations(from, to);
        
        // Calculate travel times for different transport types
        const travelTimesByTransport = {
          'bus': calculateTravelTimeBetweenDestinations(from, to, 'bus'),
          'train': calculateTravelTimeBetweenDestinations(from, to, 'train'),
          'flight': calculateTravelTimeBetweenDestinations(from, to, 'flight'),
          'car': calculateTravelTimeBetweenDestinations(from, to, 'car')
        };
        
        // Add to matrix (both directions)
        matrix.push({
          fromId: from.id,
          toId: to.id,
          fromName: from.name,
          toName: to.name,
          distanceKm,
          travelTimesByTransport
        });
        
        matrix.push({
          fromId: to.id,
          toId: from.id,
          fromName: to.name,
          toName: from.name,
          distanceKm,
          travelTimesByTransport
        });
      }
    }
    
    return matrix;
  };
  
  // Get suggested transport type based on distances and time constraints
  const getSuggestedTransport = (
    destinationIds: string[], 
    numberOfDays: number, 
    isPremium: boolean = false
  ): {
    recommendedType: 'bus' | 'train' | 'flight' | 'car';
    alternativeType?: 'bus' | 'train' | 'flight' | 'car';
    reasoning: string;
    totalDistanceKm: number;
    totalTravelTimeHours: number;
    timeForSightseeing: number;
    isRealistic: boolean;
    premiumAdvantages?: string[];
  } => {
    if (destinationIds.length <= 1) {
      return {
        recommendedType: 'car',
        reasoning: 'Single destination selected, any transport is suitable.',
        totalDistanceKm: 0,
        totalTravelTimeHours: 0,
        timeForSightseeing: numberOfDays * 8, // Assuming 8 hours per day for sightseeing
        isRealistic: true
      };
    }
    
    // Get all selected destinations
    const selectedDestinations = destinationIds.map(id => 
      destinations.find(d => d.id === id)
    ).filter(Boolean) as Destination[];
    
    // Calculate total distance
    let totalDistanceKm = 0;
    for (let i = 0; i < selectedDestinations.length - 1; i++) {
      const from = selectedDestinations[i];
      const to = selectedDestinations[i + 1];
      totalDistanceKm += calculateDistanceBetweenDestinations(from, to);
    }
    
    // Calculate travel times for different transport types
    const travelTimes: Record<string, number> = {
      'bus': 0,
      'train': 0,
      'flight': 0,
      'car': 0
    };
    
    for (let i = 0; i < selectedDestinations.length - 1; i++) {
      const from = selectedDestinations[i];
      const to = selectedDestinations[i + 1];
      
      travelTimes.bus += calculateTravelTimeBetweenDestinations(from, to, 'bus');
      travelTimes.train += calculateTravelTimeBetweenDestinations(from, to, 'train');
      travelTimes.flight += calculateTravelTimeBetweenDestinations(from, to, 'flight') + 3; // Add 3 hours for airport procedures
      travelTimes.car += calculateTravelTimeBetweenDestinations(from, to, 'car');
    }
    
    // Calculate available time for activities
    const totalTripHours = numberOfDays * 8; // Assuming 8 active hours per day
    const timeForSightseeing: Record<string, number> = {
      'bus': totalTripHours - travelTimes.bus,
      'train': totalTripHours - travelTimes.train,
      'flight': totalTripHours - travelTimes.flight,
      'car': totalTripHours - travelTimes.car
    };
    
    // Find the optimal transport type
    const transportTypes = ['bus', 'train', 'flight', 'car'] as const;
    const viableTransports = transportTypes.filter(type => timeForSightseeing[type] > 0);
    
    if (viableTransports.length === 0) {
      // No viable transport option found
      // Find the least bad option
      const leastBadOption = transportTypes.reduce((best, current) => 
        timeForSightseeing[current] > timeForSightseeing[best] ? current : best
      );
      
      return {
        recommendedType: leastBadOption,
        reasoning: `Trip is too ambitious for the time available. Consider adding more days or reducing destinations.`,
        totalDistanceKm,
        totalTravelTimeHours: travelTimes[leastBadOption],
        timeForSightseeing: timeForSightseeing[leastBadOption],
        isRealistic: false,
        premiumAdvantages: isPremium ? [
          'Premium route optimization could save up to 15% travel time',
          'Access to premium lounges at transit points',
          'Priority boarding on trains and flights'
        ] : undefined
      };
    }
    
    // Determine the best option based on distance
    let recommendedType: 'bus' | 'train' | 'flight' | 'car';
    let alternativeType: 'bus' | 'train' | 'flight' | 'car' | undefined;
    let reasoning = '';
    
    if (totalDistanceKm > 1500) {
      // Long distance - recommend flight
      recommendedType = 'flight';
      alternativeType = 'train';
      reasoning = 'Long distances between destinations make flights the most time-efficient option.';
    } else if (totalDistanceKm > 800) {
      // Medium-long distance - recommend train or flight
      recommendedType = 'train';
      alternativeType = 'flight';
      reasoning = 'Moderate to long distances are well-suited for train travel, with flights as an alternative for saving time.';
    } else if (totalDistanceKm > 300) {
      // Medium distance - recommend train or car
      recommendedType = 'train';
      alternativeType = 'car';
      reasoning = 'Medium distances are ideal for train travel, offering a balance of comfort and sightseeing.';
    } else {
      // Short distance - recommend car or bus
      recommendedType = 'car';
      alternativeType = 'bus';
      reasoning = 'Shorter distances are perfect for road travel, offering flexibility to stop at points of interest.';
    }
    
    // Make sure the recommended type is viable
    if (!viableTransports.includes(recommendedType)) {
      recommendedType = viableTransports[0];
      reasoning = 'Original recommendation adjusted due to time constraints.';
    }
    
    // Add premium advantages
    const premiumAdvantages = isPremium ? [
      'Real-time traffic and crowd avoidance routes',
      'VIP access at stations/airports saves up to 45 minutes per transit',
      'Discounted business class upgrades available',
      'Flexible rescheduling without fees'
    ] : undefined;
    
    return {
      recommendedType,
      alternativeType,
      reasoning,
      totalDistanceKm,
      totalTravelTimeHours: travelTimes[recommendedType],
      timeForSightseeing: timeForSightseeing[recommendedType],
      isRealistic: timeForSightseeing[recommendedType] > 0,
      premiumAdvantages
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
        generateOptimalItinerary,
        getDistanceMatrix,
        getSuggestedTransport,
        calculateDistanceBetweenDestinations
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
