import { TransportType, HotelType } from '../types';

export const getTransportAmenities = (type: string, isOvernight: boolean): string[] => {
  const base = {
    'bus': ['AC', 'Seats'],
    'train': ['Dining', 'Seats'],
    'flight': ['Service', 'Meals'],
    'car': ['Privacy', 'Flexibility']
  }[type as 'bus' | 'train' | 'flight' | 'car'] || [];
  
  return isOvernight ? [...base, 'Overnight option'] : base;
};

export interface HotelLocation {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  distanceFromCenter: number;
  proximityScore: number;
  nearbyAttractions?: {
    name: string;
    distance: number;
  }[];
}

export interface ExtendedHotelType extends HotelType {
  location?: HotelLocation;
  checkInTime?: string;
  checkOutTime?: string;
  contact?: string;
}

// This is a utility function to help render hotel information uniformly
export const renderHotelInfo = (hotel: ExtendedHotelType | string) => {
  // If hotel is a string (hotel ID), try to find the hotel object
  if (typeof hotel === 'string') {
    // Here you would typically fetch the hotel from a context or API
    // For now, we'll return a placeholder
    return {
      name: 'Hotel information unavailable',
      pricePerPerson: 0,
      rating: 0,
      type: 'standard' as const,
      amenities: [],
      location: {
        distanceFromCenter: 0,
        address: '',
        coordinates: { lat: 0, lng: 0 },
        proximityScore: 0
      },
      checkInTime: '14:00',
      checkOutTime: '12:00'
    };
  }
  
  return hotel;
};
