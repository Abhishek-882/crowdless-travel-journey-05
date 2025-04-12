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
  
  // Distribute days evenly among destinations
  const numDestinations = selectedDestinations.length;
  let daysPerDestination = Math.floor(options.numberOfDays / numDestinations);
  let extraDays = options.numberOfDays % numDestinations;
  
  // Ensure at least one day per destination
  daysPerDestination = Math.max(1, daysPerDestination);
  
  // Transport speeds in km/h
  const transportSpeeds = {
    'bus': 45,
    'train': 60,
    'flight': 500,
    'car': 50
  };
  
  let day = 1;
  
  // Assign days to each destination
  for (let destIndex = 0; destIndex < selectedDestinations.length; destIndex++) {
    const destination = selectedDestinations[destIndex];
    
    // Calculate days for this destination (distribute extra days from start)
    const daysForThisDestination = daysPerDestination + (extraDays > 0 ? 1 : 0);
    if (extraDays > 0) extraDays--;
    
    // Add regular exploration days
    for (let destDay = 0; destDay < daysForThisDestination; destDay++) {
      if (day <= options.numberOfDays) {
        itinerary.push({
          day,
          date: new Date(currentDate),
          destinationId: destination.id,
          destinationName: destination.name,
          activities: [`Explore ${destination.name}`],
          isTransitDay: false
        });
        
        day++;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Add transit day if not the last destination
    if (destIndex < selectedDestinations.length - 1 && day <= options.numberOfDays) {
      const nextDest = selectedDestinations[destIndex + 1];
      const distanceKm = calculateDistance(destination, nextDest);
      const travelHours = distanceKm / transportSpeeds[options.transportType];
      
      itinerary.push({
        day,
        date: new Date(currentDate),
        destinationId: nextDest.id,
        destinationName: nextDest.name,
        activities: [`Travel from ${destination.name} to ${nextDest.name} (${Math.round(distanceKm)} km, ~${Math.round(travelHours)} hours)`],
        isTransitDay: true
      });
      
      day++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return itinerary;
};

/**
 * Calculate travel details for a specific transport type
 */
export const calculateTravelDetails = (
  totalDistance: number,
  transportType: 'bus' | 'train' | 'flight' | 'car'
): {
  speed: number;
  costPerKm: number;
  bestFor: string;
  overnightOption: boolean;
} => {
  switch (transportType) {
    case 'bus':
      return {
        speed: 45,
        costPerKm: 1.5,
        bestFor: 'Budget travel, regional exploration',
        overnightOption: true
      };
    case 'train':
      return {
        speed: 60,
        costPerKm: 2,
        bestFor: 'Comfort, scenic views, no traffic',
        overnightOption: true
      };
    case 'flight':
      return {
        speed: 500,
        costPerKm: 6,
        bestFor: 'Long distances, saving time',
        overnightOption: false
      };
    case 'car':
      return {
        speed: 50,
        costPerKm: 3,
        bestFor: 'Flexibility, impromptu stops, rural areas',
        overnightOption: false
      };
    default:
      return {
        speed: 50,
        costPerKm: 3,
        bestFor: 'Flexible travel',
        overnightOption: false
      };
  }
};
