
export type User = {
  id: string;
  email: string;
  password: string; // Note: In a real app, this would be hashed and not stored in the front end
  fullName: string;
  bookings: string[]; // IDs of bookings
  profileComplete: boolean;
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
};

export type CrowdLevel = 'low' | 'medium' | 'high';

export type CrowdData = {
  [time: string]: number; // Map of time to crowd percentage (0-100)
};

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
};

export type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'bookings' | 'profileComplete'>) => Promise<void>;
  logout: () => void;
  completeProfile: (profileData: User['profileData']) => Promise<void>;
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

export type BookingContextType = {
  bookings: Booking[];
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getBookingById: (bookingId: string) => Booking | undefined;
  getUserBookings: (userId: string) => Booking[];
  loading: boolean;
  error: string | null;
};
