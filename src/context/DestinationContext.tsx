
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
  const isPremiumUser = !!currentUser?.isPremium;

  // Initialize destinations
  useEffect(() => {
    const initDestinations = async () => {
      try {
        // Check if we already have destinations in localStorage
        const storedDestinations = localStorage.getItem('destinations');
        
        if (storedDestinations) {
          const parsedDestinations = JSON.parse(storedDestinations) as Destination[];
          setDestinations(parsedDestinations);
          setFilteredDestinations(parsedDestinations);
        } else {
          // Use our predefined data
          setDestinations(indiaDestinations);
          setFilteredDestinations(indiaDestinations);
          
          // Store in localStorage for future use
          localStorage.setItem('destinations', JSON.stringify(indiaDestinations));
        }
      } catch (err) {
        console.error('Error initializing destinations:', err);
        setError('Failed to load destinations. Please refresh the page.');
        toast({
          title: 'Error',
          description: 'Failed to load destinations. Please refresh the page.',
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
      
      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter((dest) => 
          dest.name.toLowerCase().includes(query) || 
          dest.city.toLowerCase().includes(query) || 
          dest.state.toLowerCase().includes(query)
        );
      }
      
      // Apply crowd level filter
      if (filters.crowdLevel) {
        result = result.filter((dest) => 
          getCurrentCrowdLevel(dest.crowdData) === filters.crowdLevel
        );
      }
      
      // Apply price range filter
      if (filters.minPrice !== null) {
        result = result.filter((dest) => dest.price >= (filters.minPrice || 0));
      }
      
      if (filters.maxPrice !== null) {
        result = result.filter((dest) => dest.price <= (filters.maxPrice || Infinity));
      }
      
      // Apply state filter
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
        description: 'Failed to apply filters.',
        variant: 'destructive',
      });
    }
  }, [destinations, searchQuery, filters]);

  // Determine the current crowd level based on time
  const getCurrentCrowdLevel = (crowdData: CrowdData): CrowdLevel => {
    try {
      // For non-premium users, we show a simulated crowd level
      // that doesn't change in real-time
      if (!isPremiumUser) {
        // Return a static crowd level based on the average
        const values = Object.values(crowdData);
        const avgCrowd = values.reduce((a, b) => a + b, 0) / values.length;
        
        if (avgCrowd <= 40) return 'low';
        if (avgCrowd <= 70) return 'medium';
        return 'high';
      }
      
      // For premium users, show real-time crowd data
      const currentHour = new Date().getHours();
      const timeKey = `${currentHour.toString().padStart(2, '0')}:00`;
      
      // Find the closest time key
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
      return 'medium'; // Default fallback
    }
  };

  // Get the best time to visit (lowest crowd time)
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
      
      // Format time for display
      const [hour] = bestTime.split(':');
      const hourNum = parseInt(hour, 10);
      return hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`;
    } catch (err) {
      console.error('Error finding best time:', err);
      return 'Early morning'; // Default fallback
    }
  };

  const setFilters = (newFilters: Partial<DestinationContextType['filters']>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
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
