
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  homeLocation: {
    country: string;
    state: string;
    city: string;
  };
  profileComplete: boolean;
  profileData?: {
    address?: {
      street: string;
      landmark: string;
      pincode: string;
    };
    preferences?: string[];
    profilePicture?: string;
  };
  bookings: string[];
}

export interface CrowdData {
  [time: string]: number;
}

export interface Destination {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  image: string;
  crowdData: CrowdData;
  price: number;
  rating: number;
  distance?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  hotels?: Hotel[];
  activities?: Activity[];
  bestTimeToVisit: string;
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  rooms: {
    [type: string]: {
      available: number;
      maxGuests: number;
      price: number;
    };
  };
}

export interface Activity {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

export interface Transport {
  id: string;
  type: string;
  capacity: number;
  baseFare: number;
  perKmRate: number;
}

export interface Booking {
  id: string;
  userId: string;
  destinationId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  hotelId?: string;
  roomType?: string;
  transportType?: string;
  activities?: string[];
  totalAmount: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

export type CrowdLevel = 'low' | 'medium' | 'high';

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>) => Promise<void>;
  logout: () => void;
  completeProfile: (profileData: User['profileData']) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DestinationContextType {
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
}

export interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getBookingById: (bookingId: string) => Booking | undefined;
  getUserBookings: (userId: string) => Booking[];
  loading: boolean;
  error: string | null;
}
