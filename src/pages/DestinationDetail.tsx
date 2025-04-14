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
import { Camera, MapPin, Calendar, Clock, Star, IndianRupee } from 'lucide-react';

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { destinations, getDestinationById } = useDestinations();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [similarDestinations, setSimilarDestinations] = useState<Destination[]>([]);

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
    }).format(price);
  };

  const handleBookNow = () => {
    navigate('/trip-planner', { state: { destinationId: id } });
  };

  if (!destination) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading destination...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden shadow-md">
          <img 
            src={destination.image} 
            alt={destination.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">
              {destination.name}
            </h1>
            <div className="flex items-center text-sm drop-shadow-md">
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
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-4">About {destination.name}</h2>
                  <p className="text-gray-700">{destination.description}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Visitor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Best Time to Visit</p>
                        <p className="text-sm text-gray-600">{destination.bestTimeToVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Opening Hours</p>
                        <p className="text-sm text-gray-600">{destination.openingHours || '9 AM - 6 PM'}</p>
                      </div>
                    </div>
                    {destination.price.includes && destination.price.includes.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Entry Includes</p>
                          <p className="text-sm text-gray-600">{destination.price.includes.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Crowd Chart */}
                <div className="bg-white p-4 rounded-lg border">
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
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  ))}
                </div>
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600">Reviews coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Booking & Related */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Plan Your Visit</h2>
                
                {destination.price.adult === 0 ? (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-lg font-bold text-green-800">Free Entry</p>
                    <p className="text-sm text-green-600">Open to all visitors</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Indian Adult</p>
                          <p className="text-sm text-gray-500">(12+ years)</p>
                        </div>
                        <p className="text-lg font-bold">{formatPrice(destination.price.adult)}</p>
                      </div>
                    </div>
                    
                    {destination.price.child > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Indian Child</p>
                            <p className="text-sm text-gray-500">(5-12 years)</p>
                          </div>
                          <p className="text-lg font-bold">{formatPrice(destination.price.child)}</p>
                        </div>
                      </div>
                    )}
                    
                    {destination.price.foreigner && destination.price.foreigner > 0 && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Foreign Visitor</p>
                            <p className="text-sm text-gray-500">(All ages)</p>
                          </div>
                          <p className="text-lg font-bold">{formatPrice(destination.price.foreigner)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleBookNow} 
                  className="w-full h-12 text-lg"
                >
                  Start Planning
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  <IndianRupee className="inline w-3 h-3 mr-1" />
                  No payment required to plan your trip
                </p>
              </CardContent>
            </Card>
            
            {/* Similar Destinations */}
            {similarDestinations.length > 0 && (
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Similar Destinations</h3>
                <div className="space-y-3">
                  {similarDestinations.map((similar) => (
                    <Link 
                      key={similar.id} 
                      to={`/destinations/${similar.id}`}
                      className="block hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 p-2">
                        <img 
                          src={similar.image} 
                          alt={similar.name} 
                          className="w-12 h-12 object-cover rounded-md"
                          loading="lazy"
                        />
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{similar.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {similar.city}, {similar.state}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Premium Upsell */}
            {!currentUser?.isPremium && (
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
                    <h3 className="text-lg font-semibold text-amber-900">Upgrade to Premium</h3>
                  </div>
                  <ul className="text-sm text-amber-800 space-y-2 mb-4 pl-2">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-600 fill-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Exclusive crowd forecasts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-600 fill-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Personalized itinerary planning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-600 fill-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-400 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
                    onClick={() => navigate('/premium')}
                  >
                    Explore Premium Features
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
