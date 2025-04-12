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

      const transportType = tripPlanData.transportType || 
        (tripPlanData.selectedTransport ? 
          transports.find(t => t.id === tripPlanData.selectedTransport)?.type || 'car' : 'car');

      const newTripPlan: TripPlan = {
        ...tripPlanData,
        id: newTripPlanId,
        createdAt: new Date().toISOString(),
        transportType: transportType as 'bus' | 'train' | 'flight' | 'car',
      };

      setTripPlans((prev) => [...prev, newTripPlan]);

      await saveBookingTripPlan(newTripPlan);
      
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
    travelStyle?: 'base-hotel' | 'mobile';
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
    
    const transportSpeeds = {
      'bus': 45,
      'train': 60,
      'flight': 500,
      'car': 50
    };
    
    const travelStyle = options.travelStyle || 'mobile';
    let baseHotelDestination: Destination | null = null;
    
    if (travelStyle === 'base-hotel' && selectedDestinations.length > 1) {
      let minTotalDistance = Infinity;
      let centralDestIndex = 0;
      
      for (let i = 0; i < selectedDestinations.length; i++) {
        let totalDist = 0;
        for (let j = 0; j < selectedDestinations.length; j++) {
          if (i !== j) {
            totalDist += calculateDistanceBetweenDestinations(
              selectedDestinations[i], 
              selectedDestinations[j]
            );
          }
        }
        if (totalDist < minTotalDistance) {
          minTotalDistance = totalDist;
          centralDestIndex = i;
        }
      }
      
      baseHotelDestination = selectedDestinations[centralDestIndex];
    }
    
    const needsOvernightTransport = selectedDestinations.some((dest, i) => {
      if (i < selectedDestinations.length - 1) {
        const nextDest = selectedDestinations[i + 1];
        const distanceKm = calculateDistanceBetweenDestinations(dest, nextDest);
        const travelTime = distanceKm / transportSpeeds[options.transportType];
        return travelTime > 8;
      }
      return false;
    });
    
    if (travelStyle === 'base-hotel' && baseHotelDestination) {
      const sortedDestinations = [...selectedDestinations].sort((a, b) => {
        if (a.id === baseHotelDestination!.id) return -1;
        if (b.id === baseHotelDestination!.id) return 1;
        
        const distA = calculateDistanceBetweenDestinations(baseHotelDestination!, a);
        const distB = calculateDistanceBetweenDestinations(baseHotelDestination!, b);
        
        return distA - distB;
      });
      
      for (let day = 1; day <= options.numberOfDays; day++) {
        const destIndex = (day - 1) % sortedDestinations.length;
        const destination = sortedDestinations[destIndex];
        
        if (destination.id === baseHotelDestination.id) {
          const detailedSchedule = generateDetailedSchedule(destination, 'full-day');
          
          itinerary.push({
            day,
            date: new Date(currentDate),
            destinationId: destination.id,
            destinationName: destination.name,
            activities: detailedSchedule.map(item => item.activity),
            isTransitDay: false,
            detailedSchedule,
            hotels: [baseHotelDestination.name]
          });
        } 
        else {
          const distanceToDestination = calculateDistanceBetweenDestinations(baseHotelDestination, destination);
          const travelTime = distanceToDestination / transportSpeeds[options.transportType];
          
          const departureTime = '07:00';
          const arrivalTime = formatTime(7 + travelTime);
          const returnDepartureTime = formatTime(18 - travelTime);
          const returnArrivalTime = '19:00';
          
          const detailedSchedule = [
            { time: departureTime, activity: `Depart from ${baseHotelDestination.name} to ${destination.name}`, notes: `${Math.round(distanceToDestination)}km - ${formatDuration(travelTime)}` },
            ...generateDetailedSchedule(destination, hoursAtDestination < 4 ? 'quick-visit' : 'half-day'),
            { time: returnDepartureTime, activity: `Return to ${baseHotelDestination.name}`, notes: `${Math.round(distanceToDestination)}km - ${formatDuration(travelTime)}` }
          ];
          
          itinerary.push({
            day,
            date: new Date(currentDate),
            destinationId: destination.id,
            destinationName: destination.name,
            activities: [`Day trip to ${destination.name}`, `Return to ${baseHotelDestination.name} in evening`],
            isTransitDay: false,
            departureTime,
            arrivalTime,
            detailedSchedule,
            hotels: [baseHotelDestination.name],
            transportDetails: {
              vehicle: options.transportType,
              duration: formatDuration(travelTime),
              amenities: getTransportAmenities(options.transportType)
            }
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } 
    else {
      let currentDestIndex = 0;
      
      for (let day = 1; day <= options.numberOfDays; day++) {
        if (currentDestIndex < selectedDestinations.length) {
          const destination = selectedDestinations[currentDestIndex];
          
          const isLastDay = day === options.numberOfDays;
          const hasNextDestination = currentDestIndex < selectedDestinations.length - 1;
          
          if (hasNextDestination) {
            const nextDest = selectedDestinations[currentDestIndex + 1];
            const distanceKm = calculateDistanceBetweenDestinations(destination, nextDest);
            const travelTime = distanceKm / transportSpeeds[options.transportType];
            
            if (travelTime > 4 && !isLastDay) {
              if (travelTime > 8 && (options.transportType === 'train' || options.transportType === 'bus')) {
                let departureTime = '20:00';
                let arrivalTime = formatTime(20 + travelTime);
                
                if (parseHours(arrivalTime) >= 24) {
                  arrivalTime = formatTime(parseHours(arrivalTime) - 24);
                }
                
                const freshUpStops = [
                  { time: '22:00', location: 'Onboard refreshments' }
                ];
                
                if (travelTime > 10) {
                  freshUpStops.push({ time: '06:00', location: 'Morning refreshment stop' });
                }
                
                const transportDetails = {
                  vehicle: options.transportType,
                  duration: formatDuration(travelTime),
                  amenities: getTransportAmenities(options.transportType, true)
                };
                
                const morningSchedule = generateDetailedSchedule(destination, 'morning');
                
                const eveningSchedule = [
                  { time: '18:00', activity: 'Dinner before departure', location: `Restaurant near ${destination.name}` },
                  { time: departureTime, activity: `Board ${options.transportType} to ${nextDest.name}`, notes: `${Math.round(distanceKm)}km journey` }
                ];
                
                const detailedSchedule = [...morningSchedule, ...eveningSchedule];
                
                itinerary.push({
                  day,
                  date: new Date(currentDate),
                  destinationId: destination.id,
                  destinationName: destination.name,
                  activities: [
                    `Morning exploration in ${destination.name}`,
                    `Evening departure to ${nextDest.name}`
                  ],
                  isTransitDay: true,
                  departureTime,
                  transportDetails,
                  freshUpStops,
                  detailedSchedule,
                  sleepTransport: true
                });
                
                currentDate.setDate(currentDate.getDate() + 1);
                day++;
                currentDestIndex++;
                
                if (day <= options.numberOfDays) {
                  const arrivalSchedule = [
                    { time: arrivalTime, activity: `Arrive at ${nextDest.name}`, notes: 'After overnight journey' },
                    { time: formatTime(parseHours(arrivalTime) + 1), activity: 'Freshen up and breakfast', location: `Café near ${nextDest.name}` }
                  ];
                  
                  const afternoonSchedule = generateDetailedSchedule(nextDest, 'afternoon');
                  
                  itinerary.push({
                    day,
                    date: new Date(currentDate),
                    destinationId: nextDest.id,
                    destinationName: nextDest.name,
                    activities: [
                      `Arrive in ${nextDest.name}`,
                      `Afternoon exploration of ${nextDest.name}`
                    ],
                    isTransitDay: false,
                    arrivalTime,
                    detailedSchedule: [...arrivalSchedule, ...afternoonSchedule],
                    hotels: [`Hotel in ${nextDest.name}`]
                  });
                }
              } 
              else {
                const departureTime = '09:00';
                const arrivalTime = formatTime(9 + travelTime);
                
                const freshUpStops = travelTime > 3 ? [
                  { time: formatTime(9 + travelTime/2), location: 'Rest and refreshment stop' }
                ] : undefined;
                
                const transportDetails = {
                  vehicle: options.transportType,
                  duration: formatDuration(travelTime),
                  amenities: getTransportAmenities(options.transportType)
                };
                
                const detailedSchedule = [
                  { time: '07:00', activity: 'Breakfast and check-out', location: `Hotel in ${destination.name}` },
                  { time: departureTime, activity: `Depart for ${nextDest.name}`, notes: `${Math.round(distanceKm)}km journey` }
                ];
                
                if (freshUpStops) {
                  detailedSchedule.push({
                    time: freshUpStops[0].time, 
                    activity: 'Rest stop', 
                    location: freshUpStops[0].location
                  });
                }
                
                detailedSchedule.push(
                  { time: arrivalTime, activity: `Arrive at ${nextDest.name}` },
                  { time: formatTime(parseHours(arrivalTime) + 1), activity: 'Check-in and settle in', location: `Hotel in ${nextDest.name}` }
                );
                
                if (parseHours(arrivalTime) <= 15) {
                  detailedSchedule.push(
                    { time: formatTime(parseHours(arrivalTime) + 2), activity: `Brief orientation walk around ${nextDest.name}` }
                  );
                }
                
                itinerary.push({
                  day,
                  date: new Date(currentDate),
                  destinationId: nextDest.id,
                  destinationName: nextDest.name,
                  activities: [`Travel from ${destination.name} to ${nextDest.name} (${Math.round(distanceKm)} km, ~${Math.round(travelTime)} hours)`],
                  isTransitDay: true,
                  departureTime,
                  arrivalTime,
                  transportDetails,
                  freshUpStops,
                  detailedSchedule,
                  hotels: [`Hotel in ${nextDest.name}`]
                });
                
                currentDestIndex++;
              }
            } 
            else if (!isLastDay) {
              const morningSchedule = generateDetailedSchedule(destination, 'morning');
              
              const departureTime = '14:00';
              const arrivalTime = formatTime(14 + travelTime);
              
              const afternoonSchedule = [
                { time: '13:00', activity: 'Check-out and lunch', location: `Restaurant in ${destination.name}` },
                { time: departureTime, activity: `Depart for ${nextDest.name}`, notes: `${Math.round(distanceKm)}km journey` },
                { time: arrivalTime, activity: `Arrive at ${nextDest.name}` },
                { time: formatTime(parseHours(arrivalTime) + 0.5), activity: 'Check-in to accommodation', location: `Hotel in ${nextDest.name}` }
              ];
              
              const eveningActivities = parseHours(arrivalTime) <= 18 
                ? generateDetailedSchedule(nextDest, 'evening-short') 
                : [];
              
              const detailedSchedule = [...morningSchedule, ...afternoonSchedule, ...eveningActivities];
              
              itinerary.push({
                day,
                date: new Date(currentDate),
                destinationId: destination.id,
                destinationName: `${destination.name} → ${nextDest.name}`,
                activities: [
                  `Morning in ${destination.name}`,
                  `Afternoon travel to ${nextDest.name} (${Math.round(distanceKm)} km, ~${Math.round(travelTime)} hours)`
                ],
                isTransitDay: true,
                departureTime,
                arrivalTime,
                transportDetails: {
                  vehicle: options.transportType,
                  duration: formatDuration(travelTime),
                  amenities: getTransportAmenities(options.transportType)
                },
                detailedSchedule,
                hotels: [`Hotel in ${nextDest.name}`]
              });
              
              currentDestIndex++;
            } 
            else {
              const detailedSchedule = generateDetailedSchedule(destination, 'full-day');
              
              itinerary.push({
                day,
                date: new Date(currentDate),
                destinationId: destination.id,
                destinationName: destination.name,
                activities: detailedSchedule.map(item => item.activity).slice(0, 3),
                isTransitDay: false,
                detailedSchedule,
                hotels: [`Hotel in ${destination.name}`]
              });
            }
          } 
          else {
            const detailedSchedule = generateDetailedSchedule(destination, 'full-day');
            
            itinerary.push({
              day,
              date: new Date(currentDate),
              destinationId: destination.id,
              destinationName: destination.name,
              activities: detailedSchedule.map(item => item.activity).slice(0, 3),
              isTransitDay: false,
              detailedSchedule,
              hotels: [`Hotel in ${destination.name}`]
            });
            
            if (currentDestIndex === selectedDestinations.length - 1 && day < options.numberOfDays) {
              currentDestIndex = selectedDestinations.length - 1;
            } else {
              currentDestIndex++;
            }
          }
        } 
        else {
          const destIndex = day % selectedDestinations.length;
          const destination = selectedDestinations[destIndex];
          
          const detailedSchedule = generateDetailedSchedule(destination, 'full-day', true);
          
          itinerary.push({
            day,
            date: new Date(currentDate),
            destinationId: destination.id,
            destinationName: destination.name,
            activities: [
              `More time to explore ${destination.name}`,
              'Local cuisine tasting',
              'Shopping for souvenirs'
            ],
            isTransitDay: false,
            detailedSchedule,
            hotels: [`Hotel in ${destination.name}`]
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return itinerary;
  };

  const generateDetailedSchedule = (
    destination: Destination, 
    timeSlot: 'morning' | 'afternoon' | 'evening-short' | 'half-day' | 'full-day' | 'quick-visit',
    isExtendedStay: boolean = false
  ) => {
    const schedule = [];
    const attractions = destination.attractions || [];
    
    if (isExtendedStay) {
      schedule.push({ time: '09:00', activity: 'Breakfast at a local café', location: `Café in ${destination.name}` });
      schedule.push({ time: '10:30', activity: 'Visit local markets or shopping districts', location: `Market in ${destination.name}` });
      schedule.push({ time: '13:00', activity: 'Lunch with local cuisine', location: `Restaurant in ${destination.name}` });
      schedule.push({ time: '15:00', activity: 'Relaxation time or optional cultural activity', location: destination.name });
      schedule.push({ time: '18:00', activity: 'Evening stroll and dinner', location: `Restaurant in ${destination.name}` });
      return schedule;
    }
    
    if (timeSlot === 'morning' || timeSlot === 'half-day' || timeSlot === 'full-day') {
      schedule.push({ time: '08:00', activity: 'Breakfast', location: `Hotel in ${destination.name}` });
      
      if (attractions.length > 0) {
        schedule.push({ 
          time: '09:30', 
          activity: `Visit ${attractions[0]}`, 
          location: destination.name,
          notes: destination.photography ? 'Great for photography' : undefined
        });
      } else {
        schedule.push({ time: '09:30', activity: `Explore ${destination.name}`, location: destination.name });
      }
      
      if (attractions.length > 1) {
        schedule.push({ time: '11:30', activity: `Visit ${attractions[1]}`, location: destination.name });
      }
    }
    
    if (timeSlot === 'half-day' || timeSlot === 'full-day' || timeSlot === 'afternoon') {
      schedule.push({ time: '13:00', activity: 'Lunch break', location: `Restaurant in ${destination.name}` });
      
      if (attractions.length > 2) {
        schedule.push({ time: '14:30', activity: `Visit ${attractions[2]}`, location: destination.name });
      } else {
        schedule.push({ time: '14:30', activity: 'Local sightseeing', location: destination.name });
      }
      
      if (timeSlot === 'afternoon') {
        if (attractions.length > 3) {
          schedule.push({ time: '16:30', activity: `Visit ${attractions[3]}`, location: destination.name });
        } else {
          schedule.push({ time: '16:30', activity: 'Leisure time', location: destination.name });
        }
      }
    }
    
    if (timeSlot === 'full-day') {
      if (attractions.length > 3) {
        schedule.push({ time: '16:00', activity: `Visit ${attractions[3]}`, location: destination.name });
      }
      
      schedule.push({ time: '18:00', activity: 'Evening exploration and dinner', location: `Restaurant in ${destination.name}` });
      schedule.push({ time: '20:00', activity: 'Experience local nightlife or cultural show', location: destination.name });
    }
    
    if (timeSlot === 'evening-short') {
      schedule.push({ time: '18:30', activity: 'Evening walk and dinner', location: `Restaurant in ${destination.name}` });
    }
    
    if (timeSlot === 'quick-visit') {
      schedule.push({ time: '10:00', activity: `Quick tour of ${destination.name}`, location: destination.name });
      
      if (attractions.length > 0) {
        schedule.push({ time: '11:30', activity: `Brief visit to ${attractions[0]}`, location: destination.name });
      }
      
      schedule.push({ time: '13:00', activity: 'Lunch', location: `Restaurant in ${destination.name}` });
    }
    
    return schedule;
  };

  const getTransportAmenities = (transportType: string, isOvernight: boolean = false) => {
    const baseAmenities = {
      'bus': ['Air conditioning', 'Comfortable seats'],
      'train': ['Dining car', 'Spacious seating'],
      'flight': ['In-flight service', 'Express travel'],
      'car': ['Privacy', 'Flexibility']
    };
    
    const overnightExtras = {
      'bus': ['Reclining seats', 'Rest stops', 'Onboard toilet'],
      'train': ['Sleeper berths', 'Charging points', 'Refreshments'],
      'flight': ['Blankets', 'Meals'],
      'car': ['Stop at highway motels']
    };
    
    const type = transportType as keyof typeof baseAmenities;
    
    if (isOvernight) {
      return [...baseAmenities[type], ...overnightExtras[type]];
    }
    
    return baseAmenities[type];
  };

  const formatTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    let formattedHours = wholeHours;
    if (formattedHours >= 24) {
      formattedHours -= 24;
    }
    
    let period = formattedHours >= 12 ? 'PM' : 'AM';
    let displayHours = formattedHours % 12;
    if (displayHours === 0) displayHours = 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const parseHours = (timeString: string): number => {
    const [timePart, period] = timeString.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let totalHours = hours;
    if (period === 'PM' && hours !== 12) totalHours += 12;
    if (period === 'AM' && hours === 12) totalHours = 0;
    
    return totalHours + (minutes / 60);
  };

  const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
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
