
import { Destination } from '../types';

/**
 * Calculate the minimum number of days needed for a trip
 */
export const calculateRequiredDays = (
  options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    tourismHoursPerDestination: number;
    travelStartHour: number;
    maxTravelHoursPerDay: number;
  },
  getDistanceBetweenIds: (fromId: string, toId: string) => number
) => {
  // Safety check for empty destinations
  if (!options.destinationIds.length) {
    return {
      minDaysRequired: 0,
      totalDistanceKm: 0,
      totalTravelHours: 0,
      breakdownByDestination: []
    };
  }

  // For single destination
  if (options.destinationIds.length === 1) {
    return {
      minDaysRequired: 1,
      totalDistanceKm: 0,
      totalTravelHours: 0,
      breakdownByDestination: [{
        destinationId: options.destinationIds[0],
        daysNeeded: 1,
        travelHoursToNext: 0,
        travelDaysToNext: 0
      }]
    };
  }

  const transportSpeeds = {
    'bus': 45,
    'train': 60,
    'flight': 500,
    'car': 50
  };

  const speed = transportSpeeds[options.transportType];
  let totalDistanceKm = 0;
  let totalTravelHours = 0;
  const breakdownByDestination = [];

  // Calculate time needed for each destination
  for (let i = 0; i < options.destinationIds.length; i++) {
    const currentDestId = options.destinationIds[i];
    const daysForTourism = Math.ceil(options.tourismHoursPerDestination / 8); // Assuming 8 hours of tourism per day
    
    let travelHoursToNext = 0;
    let travelDaysToNext = 0;
    
    if (i < options.destinationIds.length - 1) {
      const nextDestId = options.destinationIds[i + 1];
      const distanceToNext = getDistanceBetweenIds(currentDestId, nextDestId);
      
      travelHoursToNext = distanceToNext / speed;
      totalDistanceKm += distanceToNext;
      totalTravelHours += travelHoursToNext;
      
      // Add 1.5 hours for any flight (boarding, security, etc.)
      if (options.transportType === 'flight') {
        travelHoursToNext += 1.5;
        totalTravelHours += 1.5;
      }
      
      // Calculate days needed for travel
      travelDaysToNext = Math.ceil(travelHoursToNext / options.maxTravelHoursPerDay);
    }
    
    breakdownByDestination.push({
      destinationId: currentDestId,
      daysNeeded: daysForTourism,
      travelHoursToNext,
      travelDaysToNext
    });
  }
  
  // Calculate total minimum days required
  const minDaysRequired = breakdownByDestination.reduce(
    (total, item) => total + item.daysNeeded + item.travelDaysToNext, 
    0
  );
  
  return {
    minDaysRequired,
    totalDistanceKm,
    totalTravelHours,
    breakdownByDestination
  };
};

/**
 * Calculate travel itinerary with optimal planning
 */
export const generateOptimalItinerary = (
  options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    startDate: Date;
  },
  destinations: Destination[],
  calculateDistance: (from: Destination, to: Destination) => number
) => {
  const selectedDestinations = options.destinationIds.map(id => 
    destinations.find(dest => dest.id === id)
  ).filter(Boolean) as Destination[];
  
  if (!selectedDestinations.length) return [];
  
  const itinerary = [];
  let currentDate = new Date(options.startDate);
  let currentDestIndex = 0;
  
  // Transport speeds in km/h
  const transportSpeeds = {
    'bus': 45,
    'train': 60,
    'flight': 500,
    'car': 50
  };
  
  for (let day = 1; day <= options.numberOfDays; day++) {
    if (currentDestIndex < selectedDestinations.length) {
      const destination = selectedDestinations[currentDestIndex];
      
      // Add a day for exploring the destination
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
        const distanceKm = calculateDistance(destination, nextDest);
        const travelHours = distanceKm / transportSpeeds[options.transportType];
        
        // If travel takes more than 4 hours, add a travel day
        if (travelHours > 4) {
          currentDate.setDate(currentDate.getDate() + 1);
          day++;
          
          if (day <= options.numberOfDays) {
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
        // Last destination - add another activity day if we have days left
        if (day < options.numberOfDays) {
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
