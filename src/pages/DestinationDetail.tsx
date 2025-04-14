import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDestinations } from '../context/DestinationContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CrowdChart from '../components/CrowdChart';
import { Camera, MapPin, Calendar, Clock, Star } from 'lucide-react';

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { destinations, getDestinationById } = useDestinations();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [similarDestinations, setSimilarDestinations] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const foundDestination = getDestinationById(id);
      setDestination(foundDestination);

      if (foundDestination) {
        const similar = destinations
          .filter(d => 
            d.id !== id && 
            (d.city === foundDestination.city || 
             d.state === foundDestination.state)
          )
          .slice(0, 3);
        setSimilarDestinations(similar);
      }
    }
  }, [id, destinations, getDestinationById]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price).replace('₹', '₹');
  };

  const handleBookNow = () => {
    navigate('/trip-planner');
  };

  if (!destination) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
          <img 
            src={destination.image} 
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{destination.name}</h1>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1 inline" />
              <span>{destination.city}, {destination.state}</span>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white/80 text-primary">
              {destination.state}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About this Destination</h2>
                  <p className="text-gray-700">{destination.description}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Key Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Best Time to Visit</p>
                        <p className="text-sm text-gray-500">{destination.bestTimeToVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Opening Hours</p>
                        <p className="text-sm text-gray-500">{destination.openingHours || '9 AM - 6 PM'}</p>
                      </div>
                    </div>
                    {destination.price.includes && destination.price.includes.length > 0 && (
                      <div className="flex items-start">
                        <Camera className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Entry Includes</p>
                          <p className="text-sm text-gray-500">{destination.price.includes.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Crowd Chart */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Crowd Levels</h3>
                  <CrowdChart crowdData={destination.crowdData} />
                </div>
              </TabsContent>
              
              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <img 
                      key={index}
                      src={destination.image} 
                      alt={`${destination.name} photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600">Reviews coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Booking & Related */}
          <div className="space-y-8">
            {/* Booking Card */}
            <Card>
              <CardContent className="p-6">
                {destination.price.adult === 0 ? (
                  <div className="mb-4">
                    <p className="text-lg font-bold">Entry Fee</p>
                    <p className="text-3xl font-bold text-green-600">Free</p>
                    <p className="text-sm text-gray-500">for all visitors</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-lg font-bold">Entry Fees</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xl font-bold text-primary">{formatPrice(destination.price.adult)}</p>
                        <p className="text-sm text-gray-500">per adult</p>
                      </div>
                      {destination.price.child > 0 && (
                        <div>
                          <p className="text-lg">{formatPrice(destination.price.child)}</p>
                          <p className="text-sm text-gray-500">per child</p>
                        </div>
                      )}
                      {destination.price.foreigner && destination.price.foreigner > 0 && (
                        <div>
                          <p className="text-lg">{formatPrice(destination.price.foreigner)}</p>
                          <p className="text-sm text-gray-500">per foreigner</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <Button 
                  onClick={handleBookNow} 
                  className="w-full mb-4"
                >
                  Plan Your Trip
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  No payment required to start planning
                </p>
              </CardContent>
            </Card>
            
            {/* Similar Destinations */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Similar Destinations</h3>
              <div className="space-y-4">
                {similarDestinations.map((similar) => (
                  <Link key={similar.id} to={`/destinations/${similar.id}`}>
                    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <img 
                        src={similar.image} 
                        alt={similar.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{similar.name}</p>
                        <p className="text-sm text-gray-500">{similar.city}, {similar.state}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Premium Upsell */}
            {!currentUser?.isPremium && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Get exclusive insights, crowd forecasts and special perks.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-500 text-amber-700 hover:bg-amber-100"
                    onClick={() => navigate('/premium')}
                  >
                    See Premium Benefits
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DestinationDetail;
