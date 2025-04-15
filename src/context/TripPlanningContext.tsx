
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
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
import { useToast } from '../hooks/use-toast';
import { useBookings } from './BookingContext';
import { useDestinations } from './DestinationContext';
import { generateOptimalItinerary as generateItinerary } from '../utils/travelCalculator';

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
        const parsedPlans = JSON.parse(storedTripPlans);
        if (Array.isArray(parsedPlans)) {
          setTripPlans(parsedPlans);
        } else {
          console.warn('Invalid trip plans data in localStorage');
          localStorage.removeItem('tripPlans');
        }
      }
    } catch (err) {
      console.error('Error initializing trip plans:', err);
      setError('Failed to load trip plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist trip plans to localStorage
  useEffect(() => {
    if (tripPlans.length > 0 || !loading) {
      try {
        localStorage.setItem('tripPlans', JSON.stringify(tripPlans));
      } catch (err) {
        console.error('Failed to save trip plans to localStorage:', err);
      }
    }
  }, [tripPlans, loading]);

  // Memoized distance calculation using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Calculate distance between destinations
  const calculateDistanceBetweenDestinations = useCallback((from: Destination, to: Destination): number => {
    if (!from.coordinates || !to.coordinates) return 0;
    return calculateDistance(
      from.coordinates.lat,
      from.coordinates.lng,
      to.coordinates.lat,
      to.coordinates.lng
    );
  }, [calculateDistance]);

  // Calculate hotel proximity with caching
  const calculateHotelProximity = useCallback((hotel: HotelType, destination: Destination): HotelType => {
    if (!destination.coordinates) return hotel;
    
    const distance = calculateDistance(
      hotel.location.coordinates.lat,
      hotel.location.coordinates.lng,
      destination.coordinates.lat,
      destination.coordinates.lng
    );
    
    const proximityScore = Math.max(1, 10 - Math.floor(distance / 2));
    
    return {
      ...hotel,
      location: {
        ...hotel.location,
        distanceFromCenter: distance,
        proximityScore
      }
    };
  }, [calculateDistance]);

  // Get hotels by destination with proximity data
  const getHotelsByDestination = useCallback((destinationId: string): HotelType[] => {
    const destination = destinations.find(d => d.id === destinationId);
    return hotels
      .filter(hotel => hotel.destinationId === destinationId)
      .map(hotel => destination ? calculateHotelProximity(hotel, destination) : hotel);
  }, [destinations, calculateHotelProximity]);

  // Get nearby hotels sorted by distance
  const getNearbyHotels = useCallback((destinationId: string, limit = 3) => {
    return getHotelsByDestination(destinationId)
      .sort((a, b) => a.location.distanceFromCenter - b.location.distanceFromCenter)
      .slice(0, limit);
  }, [getHotelsByDestination]);

  // Get optimal hotels that balance proximity across destinations
  const getOptimalHotels = useCallback((destinationIds: string[]): HotelType[] => {
    const destinationHotels = destinationIds.map(destId => {
      const destination = destinations.find(d => d.id === destId);
      return hotels
        .filter(h => h.destinationId === destId)
        .map(h => destination ? calculateHotelProximity(h, destination) : h);
    });

    const avgProximity = destinationHotels.reduce((sum, hotels) => {
      const destAvg = hotels.reduce((sum, hotel) => sum + hotel.location.proximityScore, 0) / hotels.length;
      return sum + destAvg;
    }, 0) / destinationIds.length;

    return destinationHotels.map(hotels => 
      hotels.sort((a, b) => 
        Math.abs(a.location.proximityScore - avgProximity) - 
        Math.abs(b.location.proximityScore - avgProximity)
      )[0]
    );
  }, [destinations, calculateHotelProximity]);

  // Get distance matrix between destinations
  const getDistanceMatrix = useCallback((destinationIds: string[]) => {
    const selectedDestinations = destinationIds
      .map(id => destinations.find(d => d.id === id))
      .filter(Boolean) as Destination[];
    
    if (selectedDestinations.length < 2) return [];

    const matrix = [];
    for (let i = 0; i < selectedDestinations.length - 1; i++) {
      const from = selectedDestinations[i];
      const to = selectedDestinations[i + 1];
      const distance = calculateDistanceBetweenDestinations(from, to);
      
      matrix.push({
        fromId: from.id,
        toId: to.id,
        fromName: from.name,
        toName: to.name,
        distanceKm: distance,
        travelTimesByTransport: {
          bus: Math.round(distance / 45),
          train: Math.round(distance / 60),
          flight: Math.round(distance / 500) + 1.5, // Adding 1.5 hours for boarding/security
          car: Math.round(distance / 50)
        }
      });
    }
    return matrix;
  }, [destinations, calculateDistanceBetweenDestinations]);

  // Generate optimal itinerary with premium features
  const generateOptimalItinerary = useCallback((options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    startDate: Date;
    travelStyle?: 'base-hotel' | 'mobile';
    isPremium?: boolean;
  }): TripItineraryDay[] => {
    // Use the improved function from travelCalculator.ts
    return generateItinerary(
      options,
      destinations,
      calculateDistanceBetweenDestinations
    );
  }, [destinations, calculateDistanceBetweenDestinations]);

  // Save trip plan with validation
  const saveTripPlan = useCallback(async (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
      if (!tripPlanData.selectedDestinations?.length) {
        throw new Error('At least one destination is required');
      }

      const newTripPlanId = `trip_${uuidv4()}`;
      const transportType = tripPlanData.transportType || 'car';
      
      const optimalHotels = getOptimalHotels(tripPlanData.selectedDestinations);
      
      const itinerary = generateOptimalItinerary({
        destinationIds: tripPlanData.selectedDestinations,
        transportType,
        numberOfDays: tripPlanData.numberOfDays,
        startDate: new Date(tripPlanData.startDate),
        travelStyle: tripPlanData.travelStyle,
        isPremium: tripPlanData.isPremium
      });
      
      const avgProximityScore = optimalHotels.reduce((sum, hotel) => 
        sum + hotel.location.proximityScore, 0) / optimalHotels.length;

      const newTripPlan: TripPlan = {
        ...tripPlanData,
        id: newTripPlanId,
        createdAt: new Date().toISOString(),
        transportType,
        selectedHotels: optimalHotels,
        itinerary,
        hotelProximityScore: avgProximityScore
      };

      setTripPlans(prev => [...prev, newTripPlan]);
      await saveBookingTripPlan(newTripPlan);
      
      toast({
        title: 'Trip Plan Saved!',
        description: 'Your trip plan has been created successfully.',
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
  }, [getOptimalHotels, generateOptimalItinerary, saveBookingTripPlan, toast]);

  // Get user trip plans
  const getUserTripPlans = useCallback((userId: string) => {
    return tripPlans.filter(plan => plan.userId === userId);
  }, [tripPlans]);

  // Get trip plan by ID
  const getTripPlanById = useCallback((id: string) => {
    return tripPlans.find(plan => plan.id === id);
  }, [tripPlans]);

  // Cancel trip plan
  const cancelTripPlan = useCallback(async (tripPlanId: string) => {
    setLoading(true);
    try {
      setTripPlans(prev => prev.filter(plan => plan.id !== tripPlanId));
      toast({
        title: 'Trip Cancelled',
        description: 'Your trip has been cancelled.',
      });
    } catch (err) {
      setError('Failed to cancel trip');
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel trip',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get transport amenities
  const getTransportAmenities = useCallback((type: string, isOvernight: boolean) => {
    const base = {
      'bus': ['AC', 'Seats'],
      'train': ['Dining', 'Seats'],
      'flight': ['Service', 'Meals'],
      'car': ['Privacy', 'Flexibility']
    }[type as 'bus' | 'train' | 'flight' | 'car'] || [];
    return isOvernight ? [...base, 'Overnight option'] : base;
  }, []);

  // Calculate trip costs
  const calculateTripCost = useCallback((options: {
    destinationIds: string[];
    guideIds: string[];
    hotelType: 'budget' | 'standard' | 'luxury';
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    numberOfPeople: number;
  }) => {
    const selectedDestinations = options.destinationIds
      .map(id => destinations.find(d => d.id === id))
      .filter(Boolean) as Destination[];
    const destinationsCost = selectedDestinations.reduce((sum, dest) => sum + (dest.price || 0), 0) * options.numberOfPeople;
    
    const hotelCostPerDay = hotels
      .filter(h => options.destinationIds.includes(h.destinationId) && h.type === options.hotelType)
      .reduce((sum, h) => sum + h.pricePerPerson, 0) / options.destinationIds.length;
    const hotelsCost = hotelCostPerDay * options.numberOfPeople * options.numberOfDays;
    
    const transportCost = transports
      .filter(t => t.type === options.transportType)
      .reduce((sum, t) => sum + t.pricePerPerson, 0) * options.numberOfPeople;
    
    const guidesCost = guides
      .filter(g => options.guideIds.includes(g.id))
      .reduce((sum, g) => sum + g.pricePerDay, 0) * options.numberOfDays;
    
    return {
      destinationsCost,
      hotelsCost,
      transportCost,
      guidesCost,
      totalCost: destinationsCost + hotelsCost + transportCost + guidesCost
    };
  }, [destinations]);

  // Check trip feasibility
  const checkTripFeasibility = useCallback((options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
  }) => {
    const distanceMatrix = getDistanceMatrix(options.destinationIds);
    const totalDistance = distanceMatrix.reduce((sum, segment) => sum + segment.distanceKm, 0);
    const travelHours = distanceMatrix.reduce((sum, segment) => 
      sum + segment.travelTimesByTransport[options.transportType], 0);
    
    const daysNeeded = Math.ceil(travelHours / 8) + options.destinationIds.length;
    
    return {
      feasible: options.numberOfDays >= daysNeeded,
      daysNeeded,
      daysShort: options.numberOfDays < daysNeeded ? daysNeeded - options.numberOfDays : undefined,
      breakdown: distanceMatrix.map(segment => ({
        fromId: segment.fromId,
        toId: segment.toId,
        fromName: segment.fromName,
        toName: segment.toName,
        distanceKm: segment.distanceKm,
        travelHours: segment.travelTimesByTransport[options.transportType]
      })),
      totalDistance,
      totalTravelHours: travelHours
    };
  }, [getDistanceMatrix]);

  // Get suggested transport
  const getSuggestedTransport = useCallback((
    destinationIds: string[], 
    numberOfDays: number,
    isPremium?: boolean
  ) => {
    const distanceMatrix = getDistanceMatrix(destinationIds);
    const totalDistance = distanceMatrix.reduce((sum, segment) => sum + segment.distanceKm, 0);
    const totalTravelHours = {
      bus: distanceMatrix.reduce((sum, segment) => sum + segment.travelTimesByTransport.bus, 0),
      train: distanceMatrix.reduce((sum, segment) => sum + segment.travelTimesByTransport.train, 0),
      flight: distanceMatrix.reduce((sum, segment) => sum + segment.travelTimesByTransport.flight, 0),
      car: distanceMatrix.reduce((sum, segment) => sum + segment.travelTimesByTransport.car, 0)
    };
    
    let recommendedType: 'bus' | 'train' | 'flight' | 'car' = 'car';
    let reasoning = '';
    
    if (totalDistance > 1000) {
      recommendedType = 'flight';
      reasoning = 'Best for long distances over 1000km';
    } else if (totalDistance > 300) {
      recommendedType = 'train';
      reasoning = 'Comfortable for medium distances';
    } else if (numberOfDays > 7) {
      recommendedType = 'car';
      reasoning = 'Flexibility for longer trips';
    } else {
      recommendedType = 'bus';
      reasoning = 'Economical for short trips';
    }
    
    const sightseeingTime = (numberOfDays * 8) - totalTravelHours[recommendedType];
    
    return {
      recommendedType,
      alternativeType: recommendedType === 'flight' ? 'train' : 'car',
      reasoning,
      totalDistanceKm: totalDistance,
      totalTravelTimeHours: totalTravelHours[recommendedType],
      timeForSightseeing: sightseeingTime,
      isRealistic: sightseeingTime > 0,
      premiumAdvantages: isPremium ? [
        'Priority boarding',
        'Extra luggage allowance',
        'Flexible cancellation'
      ] : undefined
    };
  }, [getDistanceMatrix]);

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
        getGuidesByDestination: (destId) => guides.filter(g => g.destinationId === destId),
        calculateTripCost,
        saveTripPlan,
        getUserTripPlans,
        getTripPlanById,
        cancelTripPlan,
        checkTripFeasibility,
        generateOptimalItinerary,
        calculateDistanceBetweenDestinations,
        getDistanceMatrix,
        getSuggestedTransport,
        getTransportAmenities,
        getOptimalHotels,
        getNearbyHotels,
        calculateHotelProximity
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
