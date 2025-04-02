
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { MapPin, Filter, Users, Clock } from 'lucide-react';
import { useDestinations } from '../context/DestinationContext';
import DestinationCard from '../components/DestinationCard';

const Index: React.FC = () => {
  const { filteredDestinations, loading } = useDestinations();
  
  // Get featured destinations (low crowd levels first, then highly rated)
  const featuredDestinations = React.useMemo(() => {
    if (!filteredDestinations.length) return [];
    
    return [...filteredDestinations]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [filteredDestinations]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-pattern py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Discover 
              <span className="text-primary"> Crowd-Free </span> 
              Travel Destinations
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find and book less crowded destinations with real-time crowd prediction for a peaceful travel experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="px-8"
              >
                <Link to="/destinations">Explore Destinations</Link>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                size="lg"
                className="px-8"
              >
                <Link to="/about">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Destinations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover these amazing places with real-time crowd information
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading destinations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild>
              <Link to="/destinations">View All Destinations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How CrowdLess Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your ultimate tool for avoiding crowds during your travels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Crowd Data</h3>
              <p className="text-gray-600">
                Our platform provides up-to-date information on crowd levels at popular destinations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Best Time Suggestions</h3>
              <p className="text-gray-600">
                We recommend the ideal times to visit each location to avoid the busiest periods.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Filtering</h3>
              <p className="text-gray-600">
                Easily filter destinations based on crowd levels, location, and your preferences.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready for a Crowd-Free Experience?</h2>
            <p className="text-xl opacity-90 mb-8">
              Sign up today and start planning your peaceful getaway
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              asChild
              className="px-8"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
