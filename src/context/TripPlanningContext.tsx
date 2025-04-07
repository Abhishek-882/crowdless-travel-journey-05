import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  TripPlanningContextType, 
  HotelType, 
  TransportType, 
  GuideType, 
  TripPlan,
  Destination,
  TripItineraryDay
} from '../types';
import { hotels } from '../data/hotels';
import { transports } from '../data/transports';
import { guides } from '../data/guides';
import { useToast } from '@/hooks/use-toast';
import { useBookings } from './BookingContext';
import { useDestinations } from './DestinationContext';
import { calculateRequiredDays } from '../utils/travelCalculator';
import { getSuggestedTransport as getTransportSuggestion } from '../utils/tripValidationUtils';

const TripPlanningContext = createContext<TripPlanningContextType | undefined>(undefined);

export const TripPlanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveTripPlan: saveBookingTripPlan } = useBookings();
  const { destinations } = useDestinations();

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

  useEffect(() => {
    if (tripPlans.length > 0 || !loading) {
      localStorage.setItem('tripPlans', JSON.stringify(tripPlans));
    }
  }, [tripPlans]);

  const getHotelsByDestination = (destinationId: string): HotelType[] => {
    if (!destinationId) return [];
    return hotels.filter(hotel => hotel.destinationId === destinationId);
  };

  const getGuidesByDestination = (destinationId: string): GuideType[] => {
    if (!destinationId) return [];
    return guides.filter(guide => guide.destinationId === destinationId);
  };

  const calculateDistanceBetweenDestinations = (from: Destination, to: Destination): number => {
    if (!from || !to || !from.coordinates || !to.coordinates) return 0;
    
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

  const calculateTravelTimeBetweenDestinations = (from: Destination, to: Destination, transportType: string): number => {
    if (!from || !to) return 0;
    
    const distanceKm = calculateDistanceBetweenDestinations(from, to);
    
    let speedKmPerHour = 60; // Default speed
    
    if (transportType === 'bus') speedKmPerHour = 50;
    else if (transportType === 'train') speedKmPerHour = 80;
    else if (transportType === 'flight') speedKmPerHour = 500;
    else if (transportType === 'car') speedKmPerHour = 60;
    
    return distanceKm / speedKmPerHour;
  };

  const calculateTripCost = (options: {
    destinationIds: string[];
    guideIds: string[];
    hotelType: 'budget' | 'standard' | 'luxury';
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    numberOfPeople: number;
  }) => {
    const destinationsCost = options.destinationIds.reduce((total, destId) => {
      return total; // Placeholder for actual calculation
    }, 0);

    let totalHotelsCost = 0;
    options.destinationIds.forEach(destId => {
      const hotelsInDestination = getHotelsByDestination(destId);
      const hotel = hotelsInDestination.find(h => h.type === options.hotelType);
      if (hotel) {
        const pricePerPerson = hotel.type === 'budget' ? 500 :
                              hotel.type === 'standard' ? 1000 : 1500;
        totalHotelsCost += pricePerPerson * options.numberOfPeople * options.numberOfDays;
      }
    });

    const transport = transports.find(t => t.type === options.transportType);
    const transportCost = transport 
      ? transport.pricePerPerson * options.numberOfPeople * options.destinationIds.length
      : 0;

    const guidesCost = options.guideIds.reduce((total, guideId) => {
      const guide = guides.find(g => g.id === guideId);
      return total + (guide ? guide.pricePerDay * options.numberOfDays : 0);
    }, 0);

    const totalCost = destinationsCost + totalHotelsCost + transportCost + guidesCost;

    return {
      destinationsCost,
      hotelsCost: totalHotelsCost,
      transportCost,
      guidesCost,
      totalCost
    };
  };

  const getDistanceMatrix = (destinationIds: string[]): {
    fromId: string;
    toId: string;
    fromName: string;
    toName: string;
    distanceKm: number;
    travelTimesByTransport: {
      [key: string]: number;
    };
  }[] => {
    if (!destinationIds || destinationIds.length <= 1) return [];
    
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
    
    for (let i = 0; i < selectedDestinations.length - 1; i++) {
      for (let j = i + 1; j < selectedDestinations.length; j++) {
        const from = selectedDestinations[i];
        const to = selectedDestinations[j];
        
        const distanceKm = calculateDistanceBetweenDestinations(from, to);
        
        const travelTimesByTransport = {
          'bus': calculateTravelTimeBetweenDestinations(from, to, 'bus'),
          'train': calculateTravelTimeBetweenDestinations(from, to, 'train'),
          'flight': calculateTravelTimeBetweenDestinations(from, to, 'flight'),
          'car': calculateTravelTimeBetweenDestinations(from, to, 'car')
        };
        
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
    return getTransportSuggestion(destinations, destinationIds, numberOfDays, isPremium);
  };

  const saveTripPlan = async (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newTripPlanId = `trip_${uuidv4()}`;

      const newTripPlan: TripPlan = {
        ...tripPlanData,
        id: newTripPlanId,
        createdAt: new Date().toISOString(),
      };

      setTripPlans((prev) => [...prev, newTripPlan]);

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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const tripPlanIndex = tripPlans.findIndex((plan) => plan.id === tripPlanId);
      if (tripPlanIndex === -1) {
        throw new Error('Trip plan not found');
      }

      const updatedTripPlan: TripPlan = {
        ...tripPlans[tripPlanIndex],
        status: 'cancelled',
      };

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
    if (!options.destinationIds || options.destinationIds.length <= 1) {
      return { 
        feasible: true, 
        daysNeeded: options.numberOfDays || 1,
        breakdown: (options.destinationIds || []).map(id => {
          const dest = destinations.find(d => d.id === id);
          return {
            destinationId: id,
            destinationName: dest?.name || 'Unknown',
            daysNeeded: 1,
            travelHoursToNext: 0,
            travelDaysToNext: 0
          };
        })
      };
    }
    
    const selectedDestinations = options.destinationIds.map(id => 
      destinations.find(dest => dest.id === id)
    ).filter(Boolean) as Destination[];
    
    if (selectedDestinations.length <= 1) {
      return { 
        feasible: true, 
        daysNeeded: options.numberOfDays || 1,
        breakdown: options.destinationIds.map(id => {
          const dest = destinations.find(d => d.id === id);
          return {
            destinationId: id,
            destinationName: dest?.name || 'Unknown',
            daysNeeded: 1,
            travelHoursToNext: 0,
            travelDaysToNext: 0
          };
        })
      };
    }
    
    const getDistanceById = (fromId: string, toId: string): number => {
      const fromDest = destinations.find(d => d.id === fromId);
      const toDest = destinations.find(d => d.id === toId);
      
      if (!fromDest || !toDest) return 0;
      
      return calculateDistanceBetweenDestinations(fromDest, toDest);
    };
    
    const calculation = calculateRequiredDays(
      {
        destinationIds: options.destinationIds,
        transportType: options.transportType,
        tourismHoursPerDestination: 8,
        travelStartHour: 8,
        maxTravelHoursPerDay: 10
      },
      getDistanceById
    );
    
    const breakdown = calculation.breakdownByDestination.map(item => {
      const dest = destinations.find(d => d.id === item.destinationId);
      return {
        ...item,
        destinationName: dest?.name || 'Unknown'
      };
    });
    
    const totalDaysNeeded = calculation.minDaysRequired;
    const currentDays = options.numberOfDays || 1;
    
    return {
      feasible: totalDaysNeeded <= currentDays,
      daysNeeded: totalDaysNeeded,
      daysShort: Math.max(0, totalDaysNeeded - currentDays),
      breakdown,
      totalDistance: calculation.totalDistanceKm,
      totalTravelHours: calculation.totalTravelHours
    };
  };

  const generateOptimalItinerary = (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    startDate: Date;
  }): TripItineraryDay[] => {
    if (!options.destinationIds || !options.destinationIds.length || !options.startDate) {
      return [];
    }
    
    const selectedDestinations = options.destinationIds.map(id => 
      destinations.find(dest => dest.id === id)
    ).filter(Boolean) as Destination[];
    
    if (!selectedDestinations.length) return [];
    
    const itinerary: TripItineraryDay[] = [];
    let currentDate = new Date(options.startDate);
    let currentDestIndex = 0;
    
    const transportSpeeds = {
      'bus': 45,
      'train': 60,
      'flight': 500,
      'car': 50
    };
    
    for (let day = 1; day <= (options.numberOfDays || 1); day++) {
      if (currentDestIndex < selectedDestinations.length) {
        const destination = selectedDestinations[currentDestIndex];
        
        itinerary.push({
          day,
          date: new Date(currentDate),
          destinationId: destination.id,
          destinationName: destination.name,
          activities: [`Explore ${destination.name}`],
          isTransitDay: false
        });
        
        if (currentDestIndex < selectedDestinations.length - 1) {
          const nextDest = selectedDestinations[currentDestIndex + 1];
          const distanceKm = calculateDistanceBetweenDestinations(destination, nextDest);
          const travelHours = distanceKm / transportSpeeds[options.transportType];
          
          if (travelHours > 4) {
            currentDate.setDate(currentDate.getDate() + 1);
            day++;
            
            if (day <= (options.numberOfDays || 1)) {
              itinerary.push({
                day,
                date: new Date(currentDate),
                destinationId: nextDest.id,
                destinationName: nextDest.name,
                activities: [`Travel from ${destination.name} to ${nextDest.name} (${Math.round(distanceKm)} km, ~${Math.round(travelHours)} hours)`],
                isTransitDay: true
              });
            }
          }
          
          currentDestIndex++;
        } else {
          if (day < (options.numberOfDays || 1)) {
            currentDate.setDate(currentDate.getDate() + 1);
            day++;
            
            itinerary.push({
              day,
              date: new Date(currentDate),
              destinationId: destination.id,
              destinationName: destination.name,
              activities: [`More time to explore ${destination.name}`],
              isTransitDay: false
            });
          }
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
