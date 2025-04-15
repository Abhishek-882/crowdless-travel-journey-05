import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { 
  TripPlanningContextType, 
  HotelType, 
  TransportType, 
  GuideType, 
  TripPlan,
  Destination,
  TripItineraryDay,
  HotelLocation,
  TransportAmenities,
  BusType,
  TrainType,
  FlightType,
  CarType
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
  }, [tripPlans, loading]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate distance between destinations
  const calculateDistanceBetweenDestinations = (from: Destination, to: Destination): number => {
    if (!from.coordinates || !to.coordinates) return 0;
    return calculateDistance(
      from.coordinates.lat,
      from.coordinates.lng,
      to.coordinates.lat,
      to.coordinates.lng
    );
  };

  // Calculate hotel proximity to destination center
  const calculateHotelProximity = (hotel: HotelType, destination: Destination): HotelType => {
    if (!destination.coordinates) return hotel;
    
    const distance = calculateDistance(
      hotel.location.coordinates.lat,
      hotel.location.coordinates.lng,
      destination.coordinates.lat,
      destination.coordinates.lng
    );
    
    const proximityScore = Math.max(1, 10 - Math.floor(distance / 2)); // Score 1-10 based on distance
    
    return {
      ...hotel,
      location: {
        ...hotel.location,
        distanceFromCenter: distance,
        proximityScore
      }
    };
  };

  // Get optimal hotels that balance proximity across destinations
  const getOptimalHotels = (destinationIds: string[]): HotelType[] => {
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
  };

  // Get distance matrix between destinations
  const getDistanceMatrix = (destinationIds: string[]) => {
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
  };

  // Check trip feasibility based on distances and days
  const checkTripFeasibility = (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
  }) => {
    const distanceMatrix = getDistanceMatrix(options.destinationIds);
    const totalDistance = distanceMatrix.reduce((sum, segment) => sum + segment.distanceKm, 0);
    const travelHours = distanceMatrix.reduce((sum, segment) => 
      sum + segment.travelTimesByTransport[options.transportType], 0);
    
    const daysNeeded = Math.ceil(travelHours / 8) + options.destinationIds.length; // 8 hours per day travel max
    
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
  };

  // Generate optimal itinerary with premium features
  const generateOptimalItinerary = (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    startDate: Date;
    travelStyle?: 'base-hotel' | 'mobile';
    isPremium?: boolean;
  }): TripItineraryDay[] => {
    const selectedDestinations = options.destinationIds
      .map(id => destinations.find(dest => dest.id === id))
      .filter(Boolean) as Destination[];
    
    if (!selectedDestinations.length) return [];
    
    const distanceMatrix = getDistanceMatrix(options.destinationIds);
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
      const nextDestination = selectedDestinations[destIndex + 1];
      
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
      
      // Add transit day if needed
      if (nextDestination && i === destIndex + 1) {
        const distanceSegment = distanceMatrix[destIndex];
        const travelHours = distanceSegment.travelTimesByTransport[options.transportType];
        
        itinerary.push({
          day: i + 1,
          date: new Date(currentDate),
          destinationId: destination.id,
          destinationName: `${destination.name} to ${nextDestination.name}`,
          activities: [`Travel from ${destination.name} to ${nextDestination.name}`],
          isTransitDay: true,
          departureTime: '08:00',
          arrivalTime: `${8 + Math.floor(travelHours)}:00`,
          transportDetails: {
            vehicle: options.transportType,
            duration: `${travelHours} hours`,
            amenities: transports.find(t => t.type === options.transportType)?.amenities || []
          },
          freshUpStops: [
            { time: '12:00', location: 'Rest stop for lunch' },
            { time: '15:00', location: 'Scenic viewpoint' }
          ]
        });
        currentDate.setDate(currentDate.getDate() + 1);
        i++; // Skip next day as transit day
      }
      
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
        hotels: getOptimalHotels([destination.id])
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return itinerary;
  };

  // Get suggested transport based on trip parameters
  const getSuggestedTransport = (
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
    
    // Determine recommended transport
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
    
    // Time available for sightseeing
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
  };

  // Calculate trip costs
  const calculateTripCost = (options: {
    destinationIds: string[];
    guideIds: string[];
    hotelType: 'budget' | 'standard' | 'luxury';
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    numberOfPeople: number;
  }) => {
    // Calculate destinations cost
    const selectedDestinations = options.destinationIds
      .map(id => destinations.find(d => d.id === id))
      .filter(Boolean) as Destination[];
    const destinationsCost = selectedDestinations.reduce((sum, dest) => sum + (dest.price || 0), 0) * options.numberOfPeople;
    
    // Calculate hotels cost
    const hotelCostPerDay = hotels
      .filter(h => options.destinationIds.includes(h.destinationId) && h.type === options.hotelType)
      .reduce((sum, h) => sum + h.pricePerPerson, 0) / options.destinationIds.length;
    const hotelsCost = hotelCostPerDay * options.numberOfPeople * options.numberOfDays;
    
    // Calculate transport cost
    const transportCost = transports
      .filter(t => t.type === options.transportType)
      .reduce((sum, t) => sum + t.pricePerPerson, 0) * options.numberOfPeople;
    
    // Calculate guides cost
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
  };

  // Save trip plan
  const saveTripPlan = async (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
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
