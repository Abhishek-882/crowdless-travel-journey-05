// src/types/index.ts
export interface Destination {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  rating: number;
  imageUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  attractions?: string[];
  photography?: boolean;
}

export interface HotelType {
  id: string;
  name: string;
  destinationId: string;
  type: 'budget' | 'standard' | 'luxury';
  pricePerNight: number;
  rating: number;
  imageUrl: string;
}

export interface TransportType {
  id: string;
  type: 'bus' | 'train' | 'flight' | 'car';
  pricePerPerson: number;
}

export interface GuideType {
  id: string;
  name: string;
  destinationId: string;
  pricePerDay: number;
  languages: string[];
  imageUrl: string;
}

export interface Booking {
  id: string;
  userId: string;
  destinationId: string;
  checkIn: string;
  timeSlot: string;
  visitors: number;
  totalAmount: number;
  ticketType: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface TripPlan {
  id: string;
  userId: string;
  selectedDestinations: string[];
  startDate: string;
  endDate: string;
  numberOfDays: number;
  numberOfPeople: number;
  hotelType: 'budget' | 'standard' | 'luxury';
  selectedTransport?: string;
  transportType: 'bus' | 'train' | 'flight' | 'car';
  guideIds: string[];
  totalCost: number;
  status: 'planning' | 'confirmed' | 'cancelled';
  createdAt: string;
  isPremium?: boolean;
  sleepTransport?: boolean;
  travelStyle?: 'base-hotel' | 'mobile';
  photos?: string[];
  itinerary?: TripItineraryDay[];
}

export interface TripItineraryDay {
  day: number;
  date: Date;
  destinationId: string;
  destinationName: string;
  activities: string[];
  isTransitDay: boolean;
  departureTime?: string;
  arrivalTime?: string;
  transportDetails?: {
    vehicle: string;
    duration: string;
    amenities: string[];
  };
  freshUpStops?: {
    time: string;
    location: string;
  }[];
  detailedSchedule?: {
    time: string;
    activity: string;
    location?: string;
    notes?: string;
  }[];
  hotels?: string[];
}

// Update or add the AuthContextType with withdrawPremium method
export type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>) => Promise<void>;
  logout: () => void;
  completeProfile: (profileData: User['profileData']) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  cancelPremium: () => Promise<void>;
  withdrawPremium: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Add withdrawal-related fields to User type if they don't exist:
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  bookings: string[];
  profileComplete: boolean;
  isPremium?: boolean;
  premiumPurchaseDate?: string;
  refundPercentage?: number;
  withdrawalDate?: string;
  profileData?: {
    address?: string;
    phone?: string;
    dob?: string;
    preferredDestinations?: string[];
    travelFrequency?: string;
  };
}
