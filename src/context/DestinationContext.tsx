import React, { createContext, useContext, useEffect, useState } from 'react';
import { Destination, DestinationContextType, CrowdData, CrowdLevel } from '../types';
import { useToast } from '@/hooks/use-toast';
import { indiaDestinations } from '../data/destinations';
import { useAuth } from './AuthContext';

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export const DestinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFiltersState] = useState<DestinationContextType['filters']>({
    crowdLevel: null,
    minPrice: null,
    maxPrice: null,
    state: null,
  });
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Initialize destinations
  useEffect(() => {
    const initDestinations = async () => {
      try {
        const storedDestinations = localStorage.getItem('destinations');
        
        if (storedDestinations) {
          setDestinations(JSON.parse(storedDestinations));
        } else {
          setDestinations(indiaDestinations);
          localStorage.setItem('destinations', JSON.stringify(indiaDestinations));
        }
      } catch (err) {
        console.error('Error initializing destinations:', err);
        setError('Failed to load destinations');
        toast({
          title: 'Error',
          description: 'Failed to load destinations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initDestinations();
  }, []);

  // Apply filters and search
  useEffect(() => {
    try {
      let result = [...destinations];
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter((dest) => 
          dest.name.toLowerCase().includes(query) || 
          dest.city.toLowerCase().includes(query) || 
          dest.state.toLowerCase().includes(query)
        );
      }
      
      if (filters.crowdLevel) {
        result = result.filter((dest) => 
          getCurrentCrowdLevel(dest.crowdData) === filters.crowdLevel
        );
      }
      
      if (filters.minPrice !== null) {
        result = result.filter((dest) => dest.price >= (filters.minPrice || 0));
      }
      
      if (filters.maxPrice !== null) {
        result = result.filter((dest) => dest.price <= (filters.maxPrice || Infinity));
      }
      
      if (filters.state) {
        result = result.filter((dest) => 
          dest.state.toLowerCase() === filters.state!.toLowerCase()
        );
      }
      
      setFilteredDestinations(result);
    } catch (err) {
      console.error('Error applying filters:', err);
      toast({
        title: 'Error',
        description: 'Failed to apply filters',
        variant: 'destructive',
      });
    }
  }, [destinations, searchQuery, filters]);

  // Get enhanced crowd data with premium features
  const getEnhancedCrowdData = (destinationId: string, crowdData: CrowdData) => {
    const hasBooking = currentUser?.bookings?.some(b => b.destinationIds.includes(destinationId));
    
    if (!currentUser?.isPremium && !hasBooking) {
      // Return limited data for free users
      const limitedData: CrowdData = {};
      Object.keys(crowdData).forEach(key => {
        limitedData[key] = Math.round(crowdData[key] / 10) * 10;
      });
      return limitedData;
    }

    // For premium users or those with bookings
    return {
      ...crowdData,
      premiumInsights: hasBooking ? getBookingInsights(destinationId) : null
    };
  };

  // Get booking insights for premium users
  const getBookingInsights = (destinationId: string) => {
    const destination = destinations.find(d => d.id === destinationId);
    if (!destination) return null;

    return {
      bestPhotoSpots: [
        "Northwest corner at sunrise",
        "Main courtyard in late afternoon"
      ],
      secretEntrances: [
        "South gate - 40% less crowded in mornings"
      ],
      localTips: [
        `Visit ${destination.name}'s east side for authentic local food`
      ]
    };
  };

  // Determine current crowd level
  const getCurrentCrowdLevel = (crowdData: CrowdData): CrowdLevel => {
    try {
      // For non-premium users, show simplified crowd level
      if (!currentUser?.isPremium) {
        const values = Object.values(crowdData);
        const avgCrowd = values.reduce((a, b) => a + b, 0) / values.length;
        
        if (avgCrowd <= 40) return 'low';
        if (avgCrowd <= 70) return 'medium';
        return 'high';
      }
      
      // For premium users, show real-time data
      const currentHour = new Date().getHours();
      const timeKey = `${currentHour.toString().padStart(2, '0')}:00`;
      
      const times = Object.keys(crowdData);
      let closestTime = times[0];
      let smallestDiff = 24;
      
      for (const time of times) {
        const [hours] = time.split(':').map(Number);
        const diff = Math.abs(hours - currentHour);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestTime = time;
        }
      }
      
      const crowdPercentage = crowdData[closestTime];
      
      if (crowdPercentage <= 40) return 'low';
      if (crowdPercentage <= 70) return 'medium';
      return 'high';
    } catch (err) {
      console.error('Error calculating crowd level:', err);
      return 'medium';
    }
  };

  // Get best time to visit
  const getBestTimeToVisit = (crowdData: CrowdData): string => {
    try {
      let bestTime = '';
      let lowestCrowd = 100;
      
      for (const [time, level] of Object.entries(crowdData)) {
        if (level < lowestCrowd) {
          lowestCrowd = level;
          bestTime = time;
        }
      }
      
      const [hour] = bestTime.split(':');
      const hourNum = parseInt(hour, 10);
      return hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`;
    } catch (err) {
      console.error('Error finding best time:', err);
      return 'Early morning';
    }
  };

  // Other context methods
  const setFilters = (newFilters: Partial<DestinationContextType['filters']>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState({
      crowdLevel: null,
      minPrice: null,
      maxPrice: null,
      state: null,
    });
    setSearchQuery('');
  };

  const getDestinationById = (id: string) => {
    return destinations.find((dest) => dest.id === id);
  };

  return (
    <DestinationContext.Provider
      value={{
        destinations,
        filteredDestinations,
        loading,
        error,
        searchQuery,
        filters,
        setSearchQuery,
        setFilters,
        getCurrentCrowdLevel,
        getBestTimeToVisit,
        clearFilters,
        getDestinationById,
        getEnhancedCrowdData
      }}
    >
      {children}
    </DestinationContext.Provider>
  );
};

export const useDestinations = () => {
  const context = useContext(DestinationContext);
  if (context === undefined) {
    throw new Error('useDestinations must be used within a DestinationProvider');
  }
  return context;
};
