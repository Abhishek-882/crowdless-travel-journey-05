import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useDestinations } from '../context/DestinationContext';
import { useAuth } from '../context/AuthContext';
import { Destination } from '../types';
import { formatPrice, getCrowdLevelClass } from '../utils/helpers';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Users,
  Info,
  ArrowLeft,
  Loader2,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import CrowdChart from '../components/CrowdChart';

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDestinationById, getCurrentCrowdLevel, getBestTimeToVisit } = useDestinations();
  const { isAuthenticated, currentUser } = useAuth();
  const { toast } = useToast();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const isPremium = currentUser?.isPremium || false;

  useEffect(() => {
    if (id) {
      const fetchedDestination = getDestinationById(id);
      if (fetchedDestination) {
        setDestination(fetchedDestination);
      } else {
        toast({
          title: 'Error',
          description: 'Destination not found',
          variant: 'destructive',
        });
        navigate('/destinations');
      }
    }
    setLoading(false);
  }, [id, getDestinationById, navigate, toast]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to book this destination',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: `/destinations/${id}` } });
      return;
    }
    
    if (currentUser && !currentUser.profileComplete) {
      toast({
        title: 'Profile Incomplete',
        description: 'Please complete your profile before booking',
        variant: 'destructive',
      });
      navigate('/profile-completion', { state: { from: `/destinations/${id}` } });
      return;
    }
    
    navigate(`/booking/${id}`);
  };

  const handleUpgradeToPremium = () => {
    navigate('/premium');
  };

  if (loading) {
    return null;
  }

  if (!destination) {
    return null;
  }

  const crowdLevel = getCurrentCrowdLevel(destination.crowdData);
  const bestTimeToVisit = getBestTimeToVisit(destination.crowdData);

  const randomCrowdPercentage = Math.floor(Math.random() * 100);

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="relative rounded-lg overflow-hidden mb-8">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-64 sm:h-96 object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 sm:p-8 text-white w-full">
              <h1 className="text-3xl sm:text-4xl font-bold">{destination.name}</h1>
              <div className="flex items-center mt-2">
                <MapPin className="h-5 w-5 mr-1" />
                <span>
                  {destination.city}, {destination.state}
                </span>
              </div>
            </div>
          </div>
          
          <Badge
            className="absolute top-4 right-4 flex items-center gap-1.5"
            variant="outline"
          >
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            <span>{destination.rating} rating</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="crowd">
                  Crowd Levels
                  {!isPremium && <Lock className="ml-1 h-3 w-3" />}
                </TabsTrigger>
                <TabsTrigger value="attractions">Attractions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <h2 className="text-2xl font-semibold mb-4">About this destination</h2>
                <p className="text-gray-700 mb-6">{destination.description}</p>
                
                <Separator className="my-6" />
                
                <h3 className="text-xl font-semibold mb-4">Key Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{destination.city}, {destination.state}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Best time to visit</p>
                        <p className="font-medium">{bestTimeToVisit}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        crowdLevel === 'low' ? 'bg-green-100' : 
                        crowdLevel === 'medium' ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <Users className={`h-5 w-5 ${getCrowdLevelClass(crowdLevel)}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current crowd level</p>
                        <div className="flex items-center">
                          <p className={`font-medium ${getCrowdLevelClass(crowdLevel)}`}>
                            {crowdLevel === 'low' ? 'Low' : 
                            crowdLevel === 'medium' ? 'Moderate' : 'High'}
                          </p>
                          {isPremium && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full flex items-center">
                              <span className="mr-1">{randomCrowdPercentage}%</span>
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended stay</p>
                        <p className="font-medium">2-3 days</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="crowd" className="mt-6">
                {isPremium ? (
                  <div>
                    <div className="bg-white p-6 rounded-lg border mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Hourly Crowd Prediction</h3>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" /> 
                          Premium Data
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-6">
                        This chart shows predicted crowd levels throughout the day. Plan your visit during less crowded hours for a better experience.
                      </p>
                      
                      <CrowdChart crowdData={destination.crowdData} />
                      
                      <div className="mt-6 flex items-start gap-2 bg-blue-50 p-4 rounded-lg">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">AI Crowd Prediction</p>
                          <p className="text-sm text-blue-700">
                            Our algorithm predicts 12% less crowd next Tuesday compared to today. Consider planning your visit then for a better experience.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-4">Alternative Less-Crowded Times</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border rounded-md p-4">
                          <p className="font-medium">Early Morning</p>
                          <p className="text-sm text-green-600 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            25% crowd level
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <p className="font-medium">Weekdays</p>
                          <p className="text-sm text-green-600 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            35% crowd level
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <p className="font-medium">Late Evenings</p>
                          <p className="text-sm text-amber-600 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            45% crowd level
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Unlock detailed crowd analytics, hour-by-hour predictions, and find the perfect time to visit with minimal crowds.
                    </p>
                    <Button onClick={handleUpgradeToPremium}>
                      <Star className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="attractions" className="mt-6">
                <h2 className="text-2xl font-semibold mb-4">Nearby Attractions</h2>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold">
                            {i === 1 ? "Local Marketplace" : 
                             i === 2 ? "Historic Monument" : "Scenic Viewpoint"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {i === 1 ? "Experience local culture and shopping" : 
                             i === 2 ? "Learn about the rich history" : "Perfect for photography"}
                          </p>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">
                              {i === 1 ? "0.5 km" : i === 2 ? "1.2 km" : "3 km"} from main location
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Book Your Trip</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-2xl font-bold">{formatPrice(destination.price)}</span>
                  <span className="text-muted-foreground ml-1">per person</span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-medium">Current Crowd Status</p>
                    <div className={`flex items-center mt-1 ${getCrowdLevelClass(crowdLevel)}`}>
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {crowdLevel === 'low' ? 'Low Crowd' : 
                         crowdLevel === 'medium' ? 'Moderate Crowd' : 'High Crowd'}
                      </span>
                      {isPremium && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                          {randomCrowdPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Best Time to Visit</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-primary mr-1" />
                      <span>{bestTimeToVisit}</span>
                    </div>
                  </div>
                  
                  {isPremium && (
                    <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Premium Insight</p>
                          <p className="text-xs text-amber-700">
                            Tomorrow will have 23% fewer crowds than today. Consider booking for tomorrow instead!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Button onClick={handleBookNow} className="w-full">
                    Book Now
                  </Button>
                  {!isPremium && (
                    <Button variant="outline" onClick={handleUpgradeToPremium} className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Unlock Premium Features
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Free cancellation up to 24 hours before scheduled date
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DestinationDetail;
