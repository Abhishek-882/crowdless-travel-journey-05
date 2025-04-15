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
        // Validate parsed data
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
          bus: Math.round(distance / 50 * 1.2), // 50 km/h with 20% buffer
          train: Math.round(distance / 80 * 1.1), // 80 km/h with 10% buffer
          flight: Math.round(distance / 500 * 1.5), // 500 km/h with airport time
          car: Math.round(distance / 60 * 1.3) // 60 km/h with traffic
        }
      });
    }
    return matrix;
  }, [destinations, calculateDistanceBetweenDestinations]);

  // Save trip plan with validation
  const saveTripPlan = useCallback(async (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!tripPlanData.selectedDestinations?.length) {
        throw new Error('At least one destination is required');
      }

      const newTripPlanId = `trip_${uuidv4()}`;
      const transportType = tripPlanData.transportType || 'car';
      
      // Calculate optimal hotels
      const optimalHotels = getOptimalHotels(tripPlanData.selectedDestinations);
      
      // Generate itinerary
      const itinerary = generateOptimalItinerary({
        destinationIds: tripPlanData.selectedDestinations,
        transportType,
        numberOfDays: tripPlanData.numberOfDays,
        startDate: new Date(tripPlanData.startDate),
        travelStyle: tripPlanData.travelStyle,
        isPremium: tripPlanData.isPremium
      });
      
      // Calculate average hotel proximity score
      const avgProximityScore = optimalHotels.reduce((sum, hotel) => 
        sum + hotel.location.proximityScore, 0) / optimalHotels.length;

      const newTripPlan: TripPlan = {
        ...tripPlanData,
        id: newTripPlanId,
        createdAt: new Date().toISOString(),
        transportType,
        selectedHotels: optimalHotels,
        itinerary,
        hotelProximityScore: avgProximityScore,
        baseHotel: optimalHotels.find(h => 
          tripPlanData.travelStyle === 'base-hotel' && 
          h.location.proximityScore === Math.max(...optimalHotels.map(h => h.location.proximityScore))
        )?.name
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
  }, [getOptimalHotels, saveBookingTripPlan, toast]);

  // Other context methods (getUserTripPlans, getTripPlanById, etc.) would go here...

  // Get user trip plans
  const getUserTripPlans = (userId: string) => {
    return tripPlans.filter(plan => plan.userId === userId);
  };

  // Get trip plan by ID
  const getTripPlanById = (id: string) => {
    return tripPlans.find(plan => plan.id === id);
  };

  // Cancel trip plan
  const cancelTripPlan = async (tripPlanId: string) => {
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
  };

  // Get hotels by destination with proximity data
  const getHotelsByDestination = (destinationId: string): HotelType[] => {
    const destination = destinations.find(d => d.id === destinationId);
    return hotels
      .filter(hotel => hotel.destinationId === destinationId)
      .map(hotel => destination ? calculateHotelProximity(hotel, destination) : hotel);
  };

  // Get nearby hotels sorted by distance
  const getNearbyHotels = (destinationId: string, limit = 3) => {
    return getHotelsByDestination(destinationId)
      .sort((a, b) => a.location.distanceFromCenter - b.location.distanceFromCenter)
      .slice(0, limit);
  };

  // Get transport amenities
  const getTransportAmenities = (type: string, isOvernight: boolean) => {
    const base = {
      'bus': ['AC', 'Seats'],
      'train': ['Dining', 'Seats'],
      'flight': ['Service', 'Meals'],
      'car': ['Privacy', 'Flexibility']
    }[type as 'bus' | 'train' | 'flight' | 'car'] || [];
    return isOvernight ? [...base, 'Overnight option'] : base;
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
      getHotelsByDestination, // Only reference it once here
      getGuidesByDestination: (destId) => guides.filter(g => g.destinationId === destId),
      calculateTripCost: () => ({ 
        totalCost: 0, 
        hotelsCost: 0, 
        transportCost: 0, 
        guidesCost: 0 
      }),
      saveTripPlan,
      getUserTripPlans: (userId) => tripPlans.filter(p => p.userId === userId),
      getTripPlanById: (id) => tripPlans.find(p => p.id === id),
      cancelTripPlan: async () => {},
      checkTripFeasibility: () => ({ 
        feasible: true, 
        daysNeeded: 1, 
        breakdown: [] 
      }),
      generateOptimalItinerary,
      calculateDistanceBetweenDestinations,
      getDistanceMatrix,
      getSuggestedTransport: () => ({
        recommendedType: 'car',
        reasoning: '',
        totalDistanceKm: 0,
        totalTravelTimeHours: 0,
        timeForSightseeing: 0,
        isRealistic: true
      }),
      getTransportAmenities: (type, isOvernight) => {
        const base = {
          'bus': ['AC', 'Seats'],
          'train': ['Dining', 'Seats'],
          'flight': ['Service', 'Meals'],
          'car': ['Privacy', 'Flexibility']
        }[type as 'bus' | 'train' | 'flight' | 'car'] || [];
        return isOvernight ? [...base, 'Overnight option'] : base;
      },
      getOptimalHotels,
      getNearbyHotels: (destinationId, limit = 3) => 
        getHotelsByDestination(destinationId)
          .sort((a, b) => a.location.distanceFromCenter - b.location.distanceFromCenter)
          .slice(0, limit),
      calculateHotelProximity
    }}
  >
    {children}
  </TripPlanningContext.Provider>
);
