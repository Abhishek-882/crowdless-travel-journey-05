
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
