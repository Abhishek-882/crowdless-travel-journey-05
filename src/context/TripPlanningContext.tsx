
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
  
  // Transport speeds in km/h
  const transportSpeeds = {
    'bus': 45,
    'train': 60,
    'flight': 500,
    'car': 50
  };
  
  let day = 1;
  let currentDestIndex = 0;

  // Visit each destination once without repeating
  while (day <= options.numberOfDays && currentDestIndex < selectedDestinations.length) {
    const destination = selectedDestinations[currentDestIndex];
    
    // Add regular exploration days
    itinerary.push({
      day,
      date: new Date(currentDate),
      destinationId: destination.id,
      destinationName: destination.name,
      activities: [`Explore ${destination.name}`],
      isTransitDay: false,
      detailedSchedule: [
        { time: '08:00', activity: 'Breakfast', location: `Hotel in ${destination.name}` },
        { time: '09:30', activity: `Explore ${destination.name}`, location: destination.name },
        { time: '12:30', activity: 'Lunch', location: `Restaurant in ${destination.name}` },
        { time: '14:00', activity: `Visit ${destination.attractions?.[0] || 'local attractions'}`, location: destination.name },
        { time: '18:00', activity: 'Dinner', location: `Restaurant in ${destination.name}` }
      ]
    });
    
    day++;
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Add transit day if not the last destination and we still have days left
    if (currentDestIndex < selectedDestinations.length - 1 && day <= options.numberOfDays) {
      const nextDest = selectedDestinations[currentDestIndex + 1];
      const distanceKm = calculateDistance(destination, nextDest);
      const travelHours = distanceKm / transportSpeeds[options.transportType];
      
      itinerary.push({
        day,
        date: new Date(currentDate),
        destinationId: nextDest.id,
        destinationName: nextDest.name,
        activities: [`Travel from ${destination.name} to ${nextDest.name} (${Math.round(distanceKm)} km, ~${Math.round(travelHours)} hours)`],
        isTransitDay: true,
        transportDetails: {
          fromDestination: destination.name,
          toDestination: nextDest.name,
          distance: Math.round(distanceKm),
          duration: `${Math.round(travelHours)} hours`,
          departureTime: '09:00',
          arrivalTime: `${9 + Math.round(travelHours)}:00`
        }
      });
      
      day++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Move to the next destination
    currentDestIndex++;
  }
  
  // If we have more days but ran out of destinations, add extra days to the last destination
  const lastDestination = selectedDestinations[selectedDestinations.length - 1];
  while (day <= options.numberOfDays && lastDestination) {
    itinerary.push({
      day,
      date: new Date(currentDate),
      destinationId: lastDestination.id,
      destinationName: lastDestination.name,
      activities: [`Additional day exploring ${lastDestination.name}`],
      isTransitDay: false,
      detailedSchedule: [
        { time: '08:00', activity: 'Breakfast', location: `Hotel in ${lastDestination.name}` },
        { time: '09:30', activity: `Continue exploring ${lastDestination.name}`, location: lastDestination.name },
        { time: '12:30', activity: 'Lunch', location: `Restaurant in ${lastDestination.name}` },
        { time: '14:00', activity: `Visit alternative attractions in ${lastDestination.name}`, location: lastDestination.name },
        { time: '18:00', activity: 'Dinner', location: `Restaurant in ${lastDestination.name}` }
      ]
    });
    
    day++;
    currentDate.setDate(currentDate.getDate() + 1);
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
  transportTypes: string[];
} => {
  switch (transportType) {
    case 'bus':
      return {
        speed: 45,
        costPerKm: 1.5,
        bestFor: 'Budget travel, regional exploration',
        overnightOption: true,
        transportTypes: ['Volvo AC', 'Semi-sleeper', 'Sleeper', 'Local']
      };
    case 'train':
      return {
        speed: 60,
        costPerKm: 2,
        bestFor: 'Comfort, scenic views, no traffic',
        overnightOption: true,
        transportTypes: ['AC First Class', 'AC 2-Tier', 'AC 3-Tier', 'Sleeper Class', 'General']
      };
    case 'flight':
      return {
        speed: 500,
        costPerKm: 6,
        bestFor: 'Long distances, saving time',
        overnightOption: false,
        transportTypes: ['Economy', 'Premium Economy', 'Business Class', 'First Class']
      };
    case 'car':
      return {
        speed: 50,
        costPerKm: 3,
        bestFor: 'Flexibility, impromptu stops, rural areas',
        overnightOption: false,
        transportTypes: ['Hatchback', 'Sedan', 'SUV', 'Luxury']
      };
    default:
      return {
        speed: 50,
        costPerKm: 3,
        bestFor: 'Flexible travel',
        overnightOption: false,
        transportTypes: ['Standard']
      };
  }
};
