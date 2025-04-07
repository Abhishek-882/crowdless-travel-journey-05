
type TransportDetails = {
  speed: number;
  costPerKm: number;
  overnightOption: boolean;
  bestFor: string;
};

/**
 * Calculates detailed information about the selected transport type
 */
export const calculateTravelDetails = (
  distance: number, 
  transportType: 'bus' | 'train' | 'flight' | 'car'
): TransportDetails => {
  const transportDetails: Record<string, TransportDetails> = {
    train: {
      speed: 60,
      costPerKm: 1.5,
      overnightOption: true,
      bestFor: 'Long distances (>500km)'
    },
    car: {
      speed: 50,
      costPerKm: 12,
      overnightOption: false,
      bestFor: 'Groups, remote areas'
    },
    flight: {
      speed: 500,
      costPerKm: 6,
      overnightOption: false,
      bestFor: 'Ultra-long distances'
    },
    bus: {
      speed: 45,
      costPerKm: 0.8,
      overnightOption: true,
      bestFor: 'Budget travelers'
    }
  };

  return transportDetails[transportType] || transportDetails.car;
};

/**
 * Calculates the travel time based on distance and transport type
 */
export const calculateTravelTime = (
  distance: number, 
  transportType: 'bus' | 'train' | 'flight' | 'car'
): number => {
  const transportDetails = calculateTravelDetails(distance, transportType);
  
  // Basic calculation
  let travelHours = distance / transportDetails.speed;
  
  // Add 10% buffer time for realistic estimates
  travelHours = travelHours * 1.1;
  
  // For flights, add 3 hours for airport procedures
  if (transportType === 'flight') {
    travelHours += 3;
  }
  
  return Math.round(travelHours * 10) / 10; // Round to 1 decimal place
};

/**
 * Checks if a hotel is needed for a specific travel time and arrival hour
 */
export const isHotelNeeded = (
  travelHours: number, 
  departureHour: number
): { needed: boolean; reason: string } => {
  const arrivalHour = (departureHour + Math.floor(travelHours)) % 24;
  
  if (arrivalHour >= 22 || arrivalHour < 6) {
    return {
      needed: true,
      reason: 'Late night arrival (after 10 PM)'
    };
  }
  
  if (travelHours > 10) {
    return {
      needed: true,
      reason: 'Long journey (over 10 hours)'
    };
  }
  
  return {
    needed: false,
    reason: 'Day travel with reasonable arrival time'
  };
};

/**
 * Estimates the total trip cost including hotels and transport
 */
export const estimateTripCost = (
  options: {
    distanceKm: number;
    transportType: 'bus' | 'train' | 'flight' | 'car';
    hotelType: 'budget' | 'standard' | 'luxury';
    numberOfNights: number;
    numberOfPeople: number;
  }
): { transportCost: number; hotelCost: number; totalCost: number } => {
  const { distanceKm, transportType, hotelType, numberOfNights, numberOfPeople } = options;
  const transportDetails = calculateTravelDetails(distanceKm, transportType);
  
  // Calculate transport cost
  const transportCost = distanceKm * transportDetails.costPerKm * numberOfPeople;
  
  // Calculate hotel cost based on type
  const perNightCost = hotelType === 'budget' ? 500 :
                       hotelType === 'standard' ? 1000 : 2000;
  const hotelCost = perNightCost * numberOfNights * numberOfPeople;
  
  return {
    transportCost,
    hotelCost,
    totalCost: transportCost + hotelCost
  };
};

/**
 * Calculates the minimum number of days required for a trip
 */
export const calculateRequiredDays = (
  options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    tourismHoursPerDestination?: number; // How many hours to spend at each destination
    travelStartHour?: number; // When travel typically starts (e.g., 8 AM)
    maxTravelHoursPerDay?: number; // Maximum travel hours per day if not overnight
  },
  getDistanceBetweenDestinations: (fromId: string, toId: string) => number
): {
  minDaysRequired: number;
  travelDays: number;
  tourismDays: number;
  totalDistanceKm: number;
  totalTravelHours: number;
  isOvernight: boolean[];
  breakdownByDestination: {
    destinationId: string;
    daysNeeded: number;
    travelHoursToNext: number;
    travelDaysToNext: number;
  }[];
} => {
  const { 
    destinationIds, 
    transportType, 
    tourismHoursPerDestination = 8, // Default: spend 8 hours (1 day) at each destination
    travelStartHour = 8, // Default: start travel at 8 AM
    maxTravelHoursPerDay = 10 // Default: maximum 10 hours of travel per day
  } = options;
  
  // If less than 2 destinations, return 1 day per destination
  if (destinationIds.length <= 1) {
    return {
      minDaysRequired: destinationIds.length,
      travelDays: 0,
      tourismDays: destinationIds.length,
      totalDistanceKm: 0,
      totalTravelHours: 0,
      isOvernight: [],
      breakdownByDestination: destinationIds.map(id => ({
        destinationId: id,
        daysNeeded: 1,
        travelHoursToNext: 0,
        travelDaysToNext: 0
      }))
    };
  }
  
  let totalTravelHours = 0;
  let totalDistanceKm = 0;
  const isOvernight: boolean[] = [];
  const breakdown: {
    destinationId: string;
    daysNeeded: number;
    travelHoursToNext: number;
    travelDaysToNext: number;
  }[] = [];
  
  // Calculate travel times between each destination
  for (let i = 0; i < destinationIds.length - 1; i++) {
    const fromId = destinationIds[i];
    const toId = destinationIds[i + 1];
    
    // Get distance between these destinations
    const distanceKm = getDistanceBetweenDestinations(fromId, toId);
    totalDistanceKm += distanceKm;
    
    // Calculate travel time for this segment
    const travelHours = calculateTravelTime(distanceKm, transportType);
    totalTravelHours += travelHours;
    
    // Check if overnight travel is possible for this transport type
    const transportDetails = calculateTravelDetails(distanceKm, transportType);
    
    // Check if hotel is needed based on arrival time
    const hotelCheck = isHotelNeeded(travelHours, travelStartHour);
    const needsOvernight = hotelCheck.needed && transportDetails.overnightOption;
    isOvernight.push(needsOvernight);
    
    // Calculate travel days for this segment
    let travelDaysForSegment = 0;
    
    if (needsOvernight) {
      // If overnight travel is possible, it takes 1 day regardless of duration
      travelDaysForSegment = 1;
    } else {
      // If not overnight, calculate based on max travel hours per day
      travelDaysForSegment = Math.ceil(travelHours / maxTravelHoursPerDay);
    }
    
    // Add to breakdown
    breakdown.push({
      destinationId: fromId,
      daysNeeded: Math.ceil(tourismHoursPerDestination / 8), // Convert tourism hours to days
      travelHoursToNext: travelHours,
      travelDaysToNext: travelDaysForSegment
    });
    
    // If we're at the last destination, add it to breakdown with no travel to next
    if (i === destinationIds.length - 2) {
      breakdown.push({
        destinationId: toId,
        daysNeeded: Math.ceil(tourismHoursPerDestination / 8),
        travelHoursToNext: 0,
        travelDaysToNext: 0
      });
    }
  }
  
  // Calculate tourism days (1 day per destination)
  const tourismDays = destinationIds.length;
  
  // Calculate travel days (accounting for overnight options)
  const travelDays = breakdown.reduce((sum, item) => sum + item.travelDaysToNext, 0);
  
  // Total days needed = tourism days + travel days
  const minDaysRequired = tourismDays + travelDays;
  
  return {
    minDaysRequired,
    travelDays,
    tourismDays,
    totalDistanceKm,
    totalTravelHours,
    isOvernight,
    breakdownByDestination: breakdown
  };
};
