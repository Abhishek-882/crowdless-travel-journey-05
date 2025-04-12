
export type User = {
  id: string;
  email: string;
  password: string; // Note: In a real app, this would be hashed and not stored in the front end
  fullName: string;
  bookings: string[]; // IDs of bookings
  profileComplete: boolean;
  isPremium?: boolean;
  premiumPurchaseDate?: string; // Added for premium cancellation window
  refundPercentage?: number; // Added for premium withdrawal
  withdrawalDate?: string; // Added for tracking when premium was withdrawn
  profileData?: {
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    emergencyContact: string;
    preferences?: {
      notifications: boolean;
      newsletter: boolean;
    }
  };
};

export type Booking = {
  id: string;
  destinationId: string;
  userId: string;
  checkIn: string;
  timeSlot: string;
  visitors: number;
  ticketType: string;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  createdAt: string;
  tripPlanId?: string; // Reference to a trip plan if this booking is related to a trip
};

export type CrowdLevel = 'low' | 'medium' | 'high';

export type CrowdData = {
  [time: string]: number; // Map of time to crowd percentage (0-100)
};

export type HotelType = {
  id: string;
  name: string;
  destinationId: string;
  pricePerPerson: number;
  rating: number;
  type: 'budget' | 'standard' | 'luxury';
  amenities: string[];
  image: string;
};

export type TransportType = {
  id: string;
  name: string;
  type: 'bus' | 'train' | 'flight' | 'car';
  pricePerPerson: number;
  travelTime: number; // in hours
  amenities: string[];
};

export type GuideType = {
  id: string;
  name: string;
  destinationId: string;
  pricePerDay: number;
  languages: string[];
  experience: number; // in years
  rating: number;
  image?: string;
};

export interface TripPlan {
  id: string;
  userId: string;
  selectedDestinations: string[];
  selectedGuides: string[];
  selectedHotels: string[];
  selectedTransport: string;
  transportType: 'bus' | 'train' | 'flight' | 'car'; // Changed from optional to required
  isPremium: boolean; // Changed from optional to required
  startDate: string;
  endDate: string;
  numberOfDays: number;
  numberOfPeople: number;
  budget: number;
  totalCost: number;
  destinationsCost: number;
  hotelsCost: number;
  transportCost: number;
  guidesCost: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  itinerary?: TripItineraryDay[];
  photos?: string[]; // Added for trip photo gallery
  baseHotel?: string; // Added to support base hotel concept
  sleepTransport?: boolean; // Added to indicate if sleeping in transport
  travelStyle?: 'base-hotel' | 'mobile'; // Added to indicate travel style
  premiumPurchaseDate?: string; // Added to track when premium was purchased
}

export interface TripItineraryDay {
  day: number;
  date: Date;
  destinationId: string;
  destinationName: string;
  activities: string[];
  isTransitDay: boolean;
  hotels?: string[]; // Added for hotel information
  freshUpStops?: { time: string, location: string }[]; // Added for transport fresh-up stops
  departureTime?: string; // Added for departure time
  arrivalTime?: string; // Added for arrival time
  transportDetails?: {
    vehicle: string;
    duration: string;
    amenities: string[];
  }; // Added for detailed transport information
  detailedSchedule?: {
    time: string;
    activity: string;
    location?: string;
    notes?: string;
  }[]; // Added for hourly detailed schedule
  sleepTransport?: boolean; // Added for sleep in transport indication
}

export type Destination = {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  image: string;
  crowdData: CrowdData;
  price: number;
  rating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  bestTimeToVisit?: string;
  attractions?: string[];
  photography?: string;
  openingHours?: string;
};

export type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>) => Promise<void>;
  logout: () => void;
  completeProfile: (profileData: User['profileData']) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  cancelPremium: () => Promise<void>; // Added for premium cancellation
  withdrawPremium: () => Promise<void>; // Added for premium withdrawal with partial refund
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type DestinationContextType = {
  destinations: Destination[];
  filteredDestinations: Destination[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    crowdLevel: CrowdLevel | null;
    minPrice: number | null;
    maxPrice: number | null;
    state: string | null;
  };
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<DestinationContextType['filters']>) => void;
  getCurrentCrowdLevel: (crowdData: CrowdData) => CrowdLevel;
  getBestTimeToVisit: (crowdData: CrowdData) => string;
  clearFilters: () => void;
  getDestinationById: (id: string) => Destination | undefined;
};

export interface BookingContextType {
  bookings: Booking[];
  tripPlans: TripPlan[];
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getBookingById: (bookingId: string) => Booking | undefined;
  getUserBookings: (userId: string) => Booking[];
  getUserTripPlans: (userId: string) => TripPlan[];
  saveTripPlan: (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>) => Promise<string>;
  loading: boolean;
  error: string | null;
};

export type TripPlanningContextType = {
  hotels: HotelType[];
  transports: TransportType[];
  guides: GuideType[];
  tripPlans: TripPlan[];
  loading: boolean;
  error: string | null;
  getHotelsByDestination: (destinationId: string) => HotelType[];
  getGuidesByDestination: (destinationId: string) => GuideType[];
  calculateTripCost: (options: {
    destinationIds: string[];
    guideIds: string[];
    hotelType: 'budget' | 'standard' | 'luxury';
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    numberOfPeople: number;
  }) => {
    destinationsCost: number;
    hotelsCost: number;
    transportCost: number;
    guidesCost: number;
    totalCost: number;
  };
  saveTripPlan: (tripPlanData: Omit<TripPlan, 'id' | 'createdAt'>) => Promise<string>;
  getUserTripPlans: (userId: string) => TripPlan[];
  getTripPlanById: (tripPlanId: string) => TripPlan | undefined;
  cancelTripPlan: (tripPlanId: string) => Promise<void>;
  checkTripFeasibility: (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
  }) => {
    feasible: boolean;
    daysNeeded: number;
    daysShort?: number;
    breakdown?: {
      destinationId: string;
      destinationName: string;
      daysNeeded: number;
      travelHoursToNext: number;
      travelDaysToNext: number;
    }[];
    totalDistance?: number;
    totalTravelHours?: number;
  };
  generateOptimalItinerary: (options: {
    destinationIds: string[];
    transportType: 'bus' | 'train' | 'flight' | 'car';
    numberOfDays: number;
    startDate: Date;
    travelStyle?: 'base-hotel' | 'mobile';
  }) => TripItineraryDay[];
  getDistanceMatrix: (destinationIds: string[]) => {
    fromId: string;
    toId: string;
    fromName: string;
    toName: string;
    distanceKm: number;
    travelTimesByTransport: {
      [key: string]: number; // transport type -> hours
    };
  }[];
  getSuggestedTransport: (
    destinationIds: string[], 
    numberOfDays: number, 
    isPremium?: boolean
  ) => {
    recommendedType: 'bus' | 'train' | 'flight' | 'car';
    alternativeType?: 'bus' | 'train' | 'flight' | 'car';
    reasoning: string;
    totalDistanceKm: number;
    totalTravelTimeHours: number;
    timeForSightseeing: number;
    isRealistic: boolean;
    premiumAdvantages?: string[];
  };
  calculateDistanceBetweenDestinations: (from: Destination, to: Destination) => number;
};
