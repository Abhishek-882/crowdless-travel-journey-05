
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Destination, DestinationContextType, CrowdData, CrowdLevel, DestinationFilters } from '../types';
import { destinations } from '../data/destinations';
import { useAuth } from './AuthContext';
import { getCurrentCrowdLevel, getBestTimeToVisit } from '../utils/helpers';

// Create the destination context
const DestinationContext = createContext<DestinationContextType>({
  destinations: [],
  loading: true,
  error: null,
  getDestinationById: () => undefined,
  getCurrentCrowdLevel,
  getBestTimeToVisit
});

// Provider component
export const DestinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<DestinationFilters>({
    crowdLevel: null,
    state: null,
    minPrice: 0,
    maxPrice: 5000
  });
  const { currentUser } = useAuth();

  // Simulate fetching destinations
  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Destinations are already imported from data/destinations
        setLoading(false);
      } catch (err) {
        setError('Failed to load destinations');
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Filter destinations based on search query and filters
  const filteredDestinations = React.useMemo(() => {
    return destinations.filter(destination => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = destination.name.toLowerCase().includes(query);
        const cityMatch = destination.city ? destination.city.toLowerCase().includes(query) : false;
        const stateMatch = destination.state ? destination.state.toLowerCase().includes(query) : false;
        
        if (!(nameMatch || cityMatch || stateMatch)) {
          return false;
        }
      }
      
      // Crowd level filter
      if (filters.crowdLevel) {
        const crowdLevel = getCurrentCrowdLevel(destination.crowdData);
        if (crowdLevel !== filters.crowdLevel) {
          return false;
        }
      }
      
      // State filter
      if (filters.state) {
        if (destination.state !== filters.state) {
          return false;
        }
      }
      
      // Price filter
      if (filters.minPrice > 0 || filters.maxPrice < 5000) {
        const price = typeof destination.price === 'number' ? destination.price : 0;
        if (price < filters.minPrice || price > filters.maxPrice) {
          return false;
        }
      }
      
      return true;
    });
  }, [searchQuery, filters]);

  // Get destination by ID
  const getDestinationById = (id: string): Destination | undefined => {
    return destinations.find(destination => destination.id === id);
  };

  // Check if a user has booking for a destination
  const hasBooking = (destinationId: string): boolean => {
    if (!currentUser || !currentUser.bookings) return false;
    
    return currentUser.bookings.some(bookingId => {
      const booking = localStorage.getItem(`booking_${bookingId}`);
      if (booking) {
        const parsedBooking = JSON.parse(booking);
        return parsedBooking.destinationId === destinationId;
      }
      return false;
    });
  };

  // Check if a destination is accessible to the user
  const canAccessDestination = (destinationId: string): boolean => {
    return currentUser?.isPremium || hasBooking(destinationId);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      crowdLevel: null,
      state: null,
      minPrice: 0,
      maxPrice: 5000
    });
    setSearchQuery('');
  };

  // Function to set filters that accepts partial updates
  const handleSetFilters = (updatedFilters: Partial<DestinationFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updatedFilters
    }));
  };

  return (
    <DestinationContext.Provider
      value={{
        destinations,
        loading,
        error,
        getDestinationById,
        getCurrentCrowdLevel,
        getBestTimeToVisit,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters: handleSetFilters,
        clearFilters,
        filteredDestinations
      }}
    >
      {children}
    </DestinationContext.Provider>
  );
};

// Custom hook to use the destination context
export const useDestinations = () => {
  const context = useContext(DestinationContext);
  if (context === undefined) {
    throw new Error('useDestinations must be used within a DestinationProvider');
  }
  return context;
};
