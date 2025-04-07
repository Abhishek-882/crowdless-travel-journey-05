
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
 * Get suggested transport based on distance and days
 */
export const getSuggestedTransport = (
  destinations: Destination[],
  destinationIds: string[], 
  numberOfDays: number,
  isPremium: boolean = false
) => {
  if (destinationIds.length <= 1) {
    return {
      recommendedType: 'car' as const,
      reasoning: 'Single destination selected, any transport is suitable.',
      totalDistanceKm: 0,
      totalTravelTimeHours: 0,
      timeForSightseeing: numberOfDays * 8,
      isRealistic: true
    };
  }
  
  const selectedDestinations = destinationIds.map(id => 
    destinations.find(d => d.id === id)
  ).filter(Boolean) as Destination[];
  
  if (selectedDestinations.length <= 1) {
    return {
      recommendedType: 'car' as const,
      reasoning: 'Single destination selected, any transport is suitable.',
      totalDistanceKm: 0,
      totalTravelTimeHours: 0,
      timeForSightseeing: numberOfDays * 8,
      isRealistic: true
    };
  }
  
  // Calculate distance between destinations
  let totalDistanceKm = 0;
  for (let i = 0; i < selectedDestinations.length - 1; i++) {
    const from = selectedDestinations[i];
    const to = selectedDestinations[i + 1];
    
    // Calculate distance using coordinates
    const R = 6371; // Earth's radius in km
    const dLat = (to.coordinates.lat - from.coordinates.lat) * Math.PI / 180;
    const dLon = (to.coordinates.lng - from.coordinates.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.coordinates.lat * Math.PI / 180) * Math.cos(to.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    totalDistanceKm += distance;
  }
  
  // Calculate travel times for different modes
  const transportSpeeds = {
    'bus': 45,
    'train': 60,
    'flight': 500,
    'car': 50
  };
  
  const travelTimes: Record<string, number> = {
    'bus': 0,
    'train': 0,
    'flight': 0,
    'car': 0
  };
  
  for (const [type, speed] of Object.entries(transportSpeeds)) {
    let timeHours = totalDistanceKm / speed;
    
    // Add boarding time for flights
    if (type === 'flight') {
      timeHours += (selectedDestinations.length - 1) * 1.5;
    }
    
    travelTimes[type] = timeHours;
  }
  
  const totalTripHours = numberOfDays * 8;
  const timeForSightseeing: Record<string, number> = {
    'bus': totalTripHours - travelTimes.bus,
    'train': totalTripHours - travelTimes.train,
    'flight': totalTripHours - travelTimes.flight,
    'car': totalTripHours - travelTimes.car
  };
  
  const transportTypes = ['bus', 'train', 'flight', 'car'] as const;
  const viableTransports = transportTypes.filter(type => timeForSightseeing[type] > 0);
  
  if (viableTransports.length === 0) {
    const leastBadOption = transportTypes.reduce((best, current) => 
      timeForSightseeing[current] > timeForSightseeing[best] ? current : best
    );
    
    return {
      recommendedType: leastBadOption,
      reasoning: `Trip is too ambitious for the time available. Consider adding more days or reducing destinations.`,
      totalDistanceKm,
      totalTravelTimeHours: travelTimes[leastBadOption],
      timeForSightseeing: timeForSightseeing[leastBadOption],
      isRealistic: false,
      premiumAdvantages: isPremium ? [
        'Premium route optimization could save up to 15% travel time',
        'Access to premium lounges at transit points',
        'Priority boarding on trains and flights'
      ] : undefined
    };
  }
  
  let recommendedType: 'bus' | 'train' | 'flight' | 'car';
  let alternativeType: 'bus' | 'train' | 'flight' | 'car' | undefined;
  let reasoning = '';
  
  if (totalDistanceKm > 1500) {
    recommendedType = 'flight';
    alternativeType = 'train';
    reasoning = 'Long distances between destinations make flights the most time-efficient option.';
  } else if (totalDistanceKm > 800) {
    recommendedType = 'train';
    alternativeType = 'flight';
    reasoning = 'Moderate to long distances are well-suited for train travel, with flights as an alternative for saving time.';
  } else if (totalDistanceKm > 300) {
    recommendedType = 'train';
    alternativeType = 'car';
    reasoning = 'Medium distances are ideal for train travel, offering a balance of comfort and sightseeing.';
  } else {
    recommendedType = 'car';
    alternativeType = 'bus';
    reasoning = 'Shorter distances are perfect for road travel, offering flexibility to stop at points of interest.';
  }
  
  if (!viableTransports.includes(recommendedType)) {
    recommendedType = viableTransports[0];
    reasoning = 'Original recommendation adjusted due to time constraints.';
  }
  
  const premiumAdvantages = isPremium ? [
    'Real-time traffic and crowd avoidance routes',
    'VIP access at stations/airports saves up to 45 minutes per transit',
    'Discounted business class upgrades available',
    'Flexible rescheduling without fees'
  ] : undefined;
  
  return {
    recommendedType,
    alternativeType,
    reasoning,
    totalDistanceKm,
    totalTravelTimeHours: travelTimes[recommendedType],
    timeForSightseeing: timeForSightseeing[recommendedType],
    isRealistic: timeForSightseeing[recommendedType] > 0,
    premiumAdvantages
  };
};
