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

const TripPlanningContext = createContext<TripPlanningContextType | undefined>(undefined);

export const TripPlanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveTripPlan: saveBookingTripPlan } = useBookings();
  const { destinations } = useDestinations();

  // Initialize trip plans
  useEffect(() => {
    try {
      const storedTripPlans = localStorage.getItem('tripPlans');
      if (storedTripPlans) {
        setTripPlans(JSON.parse(storedTripPlans));
      }
    } catch (err) {
      console.error('Error initializing trip plans:', err);
      setError('Failed to load trip plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save trip plans to localStorage
  useEffect(() => {
    if (tripPlans.length > 0 || !loading) {
      localStorage.setItem('tripPlans', JSON.stringify(tripPlans));
    }
  }, [tripPlans]);

  // Get hotels by destination
  const getHotelsByDestination = (destinationId: string): HotelType[] => {
    return hotels.filter(hotel => hotel.destinationId === destinationId);
  };

  // Calculate distance between destinations
  const calculateDistanceBetweenDestinations = (from: Destination, to: Destination): number => {
    if (!from.coordinates || !to.coordinates) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = (to.coordinates.lat - from.coordinates.lat) * Math.PI / 180;
    const dLon = (to.coordinates.lng - from.coordinates.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.coordinates.lat * Math.PI / 180) * 
      Math.cos(to.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate optimal itinerary with premium features
  const generateOptimalItinerary = (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    startDate: Date;
    isPremium?: boolean;
  }): TripItineraryDay[] => {
    const selectedDestinations = options.destinationIds
      .map(id => destinations.find(dest => dest.id === id))
      .filter(Boolean) as Destination[];
    
    if (!selectedDestinations.length) return [];
    
    const itinerary: TripItineraryDay[] = [];
    let currentDate = new Date(options.startDate);
    
    // Generate random crowd data for premium insights
    const generateRandomCrowd = () => Math.floor(Math.random() * 76) + 10;
    const generateRandomTime = () => {
      const hours = Math.floor(Math.random() * 12) + 6;
      const minutes = [0, 30][Math.floor(Math.random() * 2)];
      return `${hours}:${minutes === 0 ? '00' : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
    };
    
    // Create itinerary days
    for (let i = 0; i < options.numberOfDays; i++) {
      const destIndex = i % selectedDestinations.length;
      const destination = selectedDestinations[destIndex];
      
      const randomTime1 = generateRandomTime();
      const randomTime2 = generateRandomTime();
      const randomCrowd1 = generateRandomCrowd();
      const randomCrowd2 = generateRandomCrowd();
      
      const detailedSchedule = [
        { time: '08:00', activity: 'Breakfast', location: `Hotel in ${destination.name}` },
        { 
          time: '09:30', 
          activity: `Explore ${destination.name}`, 
          location: destination.name,
          notes: options.isPremium ? `Best time: ${randomTime1} (${randomCrowd1}% crowd)` : undefined
        },
        { time: '12:30', activity: 'Lunch', location: `Restaurant in ${destination.name}` },
        { 
          time: '14:00', 
          activity: `Visit ${destination.attractions?.[0] || 'local attractions'}`, 
          location: destination.name,
          notes: options.isPremium ? `Best time: ${randomTime2} (${randomCrowd2}% crowd)` : undefined
        },
        { time: '18:00', activity: 'Dinner', location: `Restaurant in ${destination.name}` }
      ];
      
      itinerary.push({
        day: i + 1,
        date: new Date(currentDate),
        destinationId: destination.id,
        destinationName: destination.name,
        activities: [
          `Explore ${destination.name}`,
          `Visit ${destination.attractions?.[0] || 'local attractions'}`
        ],
        isTransitDay: false,
        detailedSchedule,
        premiumTips: options.isPremium ? [
          `Best photo spot: ${destination.name} viewpoint`,
          `Local secret: Try ${destination.name}'s specialty dish`
        ] : undefined,
        hotels: [`Hotel in ${destination.name}`]
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return itinerary;
  };

  // Save trip plan
  const saveTripPlan = async (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
      const newTripPlanId = `trip_${uuidv4()}`;
      const transportType = tripPlanData.transportType || 'car';

      const newTripPlan: TripPlan = {
        ...tripPlanData,
        id: newTripPlanId,
        createdAt: new Date().toISOString(),
        transportType,
      };

      setTripPlans(prev => [...prev, newTripPlan]);
      await saveBookingTripPlan(newTripPlan);
      
      toast({
        title: 'Trip Plan Saved!',
        description: 'Your trip plan has been created.',
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

  // Other context methods (getUserTripPlans, getTripPlanById, etc.) would go here...

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
        calculateTripCost: () => ({ totalCost: 0, hotelsCost: 0, transportCost: 0, guidesCost: 0 }),
        saveTripPlan,
        getUserTripPlans: (userId) => tripPlans.filter(p => p.userId === userId),
        getTripPlanById: (id) => tripPlans.find(p => p.id === id),
        cancelTripPlan: async () => {},
        checkTripFeasibility: () => ({ feasible: true, daysNeeded: 1, breakdown: [] }),
        generateOptimalItinerary,
        calculateDistanceBetweenDestinations,
        getDistanceMatrix: () => [],
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
          }[type];
          return isOvernight ? [...base, 'Overnight option'] : base;
        }
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
