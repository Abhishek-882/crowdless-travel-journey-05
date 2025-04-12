import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { useDestinations } from '../context/DestinationContext';
import { useTripPlanning } from '../context/TripPlanningContext';
import { findLastIndex } from '../utils/arrayUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Landmark, 
  ArrowRight, 
  Camera, 
  Image, 
  Hotel, 
  Sun, 
  Moon,
  Map,
  Bus,
  Train,
  Car,
  Plane,
  Bed,
  Coffee,
  Utensils
} from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '../utils/helpers';
import TripItinerary from '../components/TripItinerary';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TripPlan } from '../types';

const MyBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserBookings, getUserTripPlans, cancelBooking } = useBookings();
  const { getDestinationById } = useDestinations();
  const { generateOptimalItinerary } = useTripPlanning();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("bookings");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [showPhotoGallery, setShowPhotoGallery] = useState<boolean>(false);
  const [selectedTripPhotos, setSelectedTripPhotos] = useState<string[]>([]);

  // Get bookings for the current user
  const userBookings = currentUser ? getUserBookings(currentUser.id) : [];
  // Get trip plans for the current user
  const userTripPlans = currentUser ? getUserTripPlans(currentUser.id) : [];

  useEffect(() => {
    // Ensure the data is loaded
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, [currentUser]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Handle booking cancellation
  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  // Show photo gallery for a trip
  const handleShowPhotos = (trip: TripPlan) => {
    // If the trip has photos, show them
    // Otherwise, show some default photos based on the destinations
    const destinationImages = trip.selectedDestinations.map(id => {
      const destination = getDestinationById(id);
      return destination?.image;
    }).filter(Boolean) as string[];
    
    setSelectedTripPhotos(trip.photos || 
      destinationImages.length > 0 ? 
      destinationImages :
      [
        'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
        'https://images.unsplash.com/photo-1472396961693-142e6e269027',
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21',
        'https://images.unsplash.com/photo-1466442929976-97f336a657be'
      ]
    );
    setShowPhotoGallery(true);
  };

  const hasNoBookings = userBookings.length === 0 && userTripPlans.length === 0;

  // Find the currently selected trip
  const selectedTrip = selectedTripId 
    ? userTripPlans.find(trip => trip.id === selectedTripId)
    : null;

  // Generate itinerary for the selected trip
  const tripItinerary = selectedTrip ? 
    (selectedTrip.itinerary || generateOptimalItinerary({
      destinationIds: selectedTrip.selectedDestinations,
      transportType: selectedTrip.transportType,
      numberOfDays: selectedTrip.numberOfDays,
      startDate: new Date(selectedTrip.startDate),
      travelStyle: selectedTrip.travelStyle
    })) : [];

  // Get the transport icon based on type
  const getTransportIcon = (type: 'bus' | 'train' | 'flight' | 'car') => {
    switch (type) {
      case 'bus': return <Bus className="h-4 w-4 mr-1" />;
      case 'train': return <Train className="h-4 w-4 mr-1" />;
      case 'flight': return <Plane className="h-4 w-4 mr-1" />;
      case 'car': return <Car className="h-4 w-4 mr-1" />;
      default: return <Map className="h-4 w-4 mr-1" />;
    }
  };

  // Determine if the user has premium features
  const hasPremium = currentUser?.isPremium || false;

  // Format travel style display
  const formatTravelStyle = (trip: TripPlan) => {
    if (trip.travelStyle === 'base-hotel') {
      return (
        <div className="flex items-center">
          <Hotel className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
          <span className="text-sm">Base hotel style: {trip.baseHotel || findCentralDestination(trip)}</span>
        </div>
      );
    } else if (trip.sleepTransport) {
      return (
        <div className="flex items-center">
          <Bed className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
          <span className="text-sm">Overnight transport included</span>
        </div>
      );
    }
    return null;
  };

  // Find the central/base destination for a trip
  const findCentralDestination = (trip: TripPlan) => {
    if (trip.baseHotel) return trip.baseHotel;
    
    const destinations = trip.selectedDestinations.map(id => getDestinationById(id)).filter(Boolean);
    if (destinations.length <= 0) return "Unknown location";
    
    return destinations[0]?.name || "Main destination";
  };

  // Determine itinerary highlight (first and last days)
  const getItineraryHighlight = (trip: TripPlan) => {
    if (!trip.itinerary || trip.itinerary.length === 0) return null;
    
    const firstDay = trip.itinerary[0];
    const lastIndex = findLastIndex(trip.itinerary, (day) => !day.isTransitDay);
    const lastDay = lastIndex !== -1 ? trip.itinerary[lastIndex] : trip.itinerary[trip.itinerary.length - 1];
    
    return (
      <div className={`space-y-1 text-xs ${isDarkMode ? 'text-gray-300' : ''}`}>
        <div className="flex">
          <span className={`font-medium mr-2 ${isDarkMode ? 'text-gray-200' : ''}`}>Start:</span>
          <span>{firstDay.destinationName}</span>
        </div>
        <div className="flex">
          <span className={`font-medium mr-2 ${isDarkMode ? 'text-gray-200' : ''}`}>End:</span>
          <span>{lastDay.destinationName}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p>Loading your bookings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'dark bg-gray-900 text-white' : ''}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your booked destinations</p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {hasNoBookings ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">You have no bookings yet</h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Explore destinations and book your next adventure!</p>
            <Button onClick={() => navigate('/trip-planner')}>Plan Your Trip</Button>
          </div>
        ) : (
          <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`mb-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
              <TabsTrigger value="bookings">Single Destinations</TabsTrigger>
              <TabsTrigger value="trips">Multi-Destination Trips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings">
              {userBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>You have no single destination bookings.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/trip-planner')}>
                    Plan a Trip
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBookings.map((booking) => {
                    const destination = getDestinationById(booking.destinationId);
                    return (
                      <Card key={booking.id} className={`overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                        {destination && (
                          <>
                            <div
                              className="h-40 bg-cover bg-center"
                              style={{ backgroundImage: `url(${destination.image})` }}
                            />
                            <CardHeader className="pb-2">
                              <CardTitle className={isDarkMode ? 'text-white' : ''}>{destination.name}</CardTitle>
                              <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{destination.city}, {destination.state}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center">
                                <Calendar className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                                <span className="text-sm">
                                  {format(new Date(booking.checkIn), 'PPP')} at {booking.timeSlot}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Users className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                                <span className="text-sm">{booking.visitors} visitors</span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{formatPrice(booking.totalAmount)}</span>
                                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                  {booking.status}
                                </Badge>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/destinations/${destination.id}`)}
                                className={isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : ''}
                              >
                                View Details
                              </Button>
                              {booking.status === 'confirmed' && (
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleCancel(booking.id)}
                                >
                                  Cancel Booking
                                </Button>
                              )}
                            </CardFooter>
                          </>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trips">
              {userTripPlans.length === 0 ? (
                <div className="text-center py-8">
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>You have no multi-destination trips.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/trip-planner')}>
                    Plan a Trip
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userTripPlans.map((trip) => {
                    const destinations = trip.selectedDestinations.map(id => 
                      getDestinationById(id)
                    ).filter(Boolean);
                    
                    return (
                      <Card key={trip.id} className={`overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                        {destinations.length > 0 && (
                          <>
                            <div
                              className="h-40 bg-cover bg-center"
                              style={{ backgroundImage: `url(${destinations[0]?.image})` }}
                            />
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className={isDarkMode ? 'text-white' : ''}>Multi-Destination Trip</CardTitle>
                                <Badge>{trip.selectedDestinations.length} destinations</Badge>
                              </div>
                              
                              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1 mt-2`}>
                                <div className="font-medium">Route:</div>
                                <div className="flex flex-wrap items-center gap-1">
                                  {destinations.map((dest, index) => (
                                    <React.Fragment key={dest?.id}>
                                      <span className="inline-flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {dest?.name}
                                      </span>
                                      {index < destinations.length - 1 && (
                                        <ArrowRight className="h-3 w-3 mx-1" />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-3">
                              <div className="flex items-center">
                                <Calendar className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                                <span className="text-sm">
                                  {format(new Date(trip.startDate), 'PPP')} to {format(new Date(trip.endDate), 'PPP')}
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Users className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                                <span className="text-sm">{trip.numberOfPeople} travelers</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                                <span className="text-sm">{trip.numberOfDays} days</span>
                              </div>
                              
                              <div className="flex items-center">
                                {getTransportIcon(trip.transportType)}
                                <span className="text-sm capitalize">{trip.transportType} travel</span>
                              </div>
                              
                              {formatTravelStyle(trip)}
                              
                              {trip.selectedHotels && trip.selectedHotels.length > 0 && (
                                <div className="flex items-center">
                                  <Landmark className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                                  <span className="text-sm">{trip.selectedHotels.length} hotels booked</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{formatPrice(trip.totalCost)}</span>
                                <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'}>
                                  {trip.status}
                                </Badge>
                              </div>
                              
                              {trip.itinerary && (
                                <div className={`border-t mt-3 pt-3 ${isDarkMode ? 'border-gray-700' : ''}`}>
                                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : ''}`}>Trip Summary:</p>
                                  {getItineraryHighlight(trip)}
                                  
                                  <div className="mt-2">
                                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Highlights:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {trip.itinerary.some(day => day.isTransitDay) && (
                                        <Badge variant="outline" className={`text-[10px] h-5 ${isDarkMode ? 'bg-blue-900/30 text-blue-200 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                          Transit included
                                        </Badge>
                                      )}
                                      {trip.sleepTransport && (
                                        <Badge variant="outline" className={`text-[10px] h-5 ${isDarkMode ? 'bg-purple-900/30 text-purple-200 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                          Overnight travel
                                        </Badge>
                                      )}
                                      {trip.isPremium && (
                                        <Badge variant="outline" className={`text-[10px] h-5 ${isDarkMode ? 'bg-amber-900/30 text-amber-200 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                          Premium perks
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                            
                            <CardFooter className="pt-0 flex flex-wrap justify-between gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setSelectedTripId(trip.id)}
                                  >
                                    View Full Itinerary
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
                                  <DialogHeader>
                                    <DialogTitle className={isDarkMode ? 'text-white' : ''}>Your Complete Trip Itinerary</DialogTitle>
                                    <DialogDescription className={isDarkMode ? 'text-gray-300' : ''}>
                                      {format(new Date(trip.startDate), 'PPP')} to {format(new Date(trip.endDate), 'PPP')}
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline" className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-slate-50'}>
                                          {trip.numberOfDays} days
                                        </Badge>
                                        <Badge variant="outline" className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-slate-50'}>
                                          {trip.selectedDestinations.length} destinations
                                        </Badge>
                                        <Badge variant="outline" className={`capitalize flex items-center ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-slate-50'}`}>
                                          {getTransportIcon(trip.transportType)}
                                          {trip.transportType} travel
                                        </Badge>
                                        {trip.isPremium && (
                                          <Badge variant="outline" className={`bg-amber-500/20 text-amber-600 border-amber-200 ${isDarkMode ? 'text-amber-300 border-amber-900' : ''}`}>
                                            Premium
                                          </Badge>
                                        )}
                                      </div>
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    <TripItinerary 
                                      itinerary={tripItinerary} 
                                      transportType={trip.transportType} 
                                      isPremium={trip.isPremium} 
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={`flex-1 ${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}
                                onClick={() => handleShowPhotos(trip)}
                              >
                                <Camera className="mr-1 h-4 w-4" /> Photo Gallery
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={`flex-1 ${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}
                                onClick={() => navigate('/trip-planner')}
                              >
                                Plan Another Trip
                              </Button>
                            </CardFooter>
                          </>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Photo Gallery Modal */}
        <Dialog open={showPhotoGallery} onOpenChange={setShowPhotoGallery}>
          <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
            <DialogHeader>
              <DialogTitle className={isDarkMode ? 'text-white' : ''}>Trip Photo Gallery</DialogTitle>
              <DialogDescription className={isDarkMode ? 'text-gray-300' : ''}>
                Memories from your journey
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {selectedTripPhotos.map((photo, index) => (
                <div key={index} className="overflow-hidden rounded-lg h-48 relative group">
                  <img 
                    src={photo} 
                    alt={`Trip photo ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20">
                      <Image className="h-4 w-4 mr-1" /> View Full Size
                    </Button>
                  </div>
                </div>
              ))}
              {selectedTripPhotos.length === 0 && (
                <div className={`col-span-full text-center py-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  <p>No photos available for this trip.</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {hasPremium ? 
                  'As a premium user, you can upload unlimited photos to your trip memories.' : 
                  'Upgrade to premium to upload unlimited photos and create beautiful memories.'}
              </p>
              {!hasPremium && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/premium')}>
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MyBookings;
