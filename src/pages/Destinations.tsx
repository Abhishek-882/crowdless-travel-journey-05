
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useDestinations } from '../context/DestinationContext';
import DestinationCard from '../components/DestinationCard';
import SearchFilters from '../components/SearchFilters';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Destinations: React.FC = () => {
  const { filteredDestinations, loading, clearFilters } = useDestinations();
  const [visibleCount, setVisibleCount] = useState(9); // Number of destinations to show initially
  
  const loadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Destinations</h1>
          <p className="text-gray-600">
            Discover amazing places with real-time crowd information
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters - Left Sidebar on Desktop */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Search & Filters</h2>
              <SearchFilters />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {filteredDestinations.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No destinations found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters to see more results
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <p className="text-muted-foreground">
                        Found {filteredDestinations.length} destinations
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDestinations
                        .slice(0, visibleCount)
                        .map((destination) => (
                          <DestinationCard
                            key={destination.id}
                            destination={destination}
                          />
                        ))}
                    </div>
                    
                    {visibleCount < filteredDestinations.length && (
                      <div className="mt-8 text-center">
                        <Button onClick={loadMore} variant="outline">
                          Load More
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Destinations;
