
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { useDestinations } from '../context/DestinationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '../utils/helpers';

const MyBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserBookings, getUserTripPlans, cancelBooking } = useBookings();
  const { getDestinationById } = useDestinations();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("bookings");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get bookings for the current user
  const userBookings = currentUser ? getUserBookings(currentUser.id) : [];
  // Get trip plans for the current user
  const userTripPlans = currentUser ? getUserTripPlans(currentUser.id) : [];

  useEffect(() => {
    // Ensure the data is loaded
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, [currentUser]);

  // Handle booking cancellation
  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const hasNoBookings = userBookings.length === 0 && userTripPlans.length === 0;

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your booked destinations</p>
        </div>

        {hasNoBookings ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">You have no bookings yet</h2>
            <p className="text-gray-500 mb-6">Explore destinations and book your next adventure!</p>
            <Button onClick={() => navigate('/trip-planner')}>Plan Your Trip</Button>
          </div>
        ) : (
          <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="bookings">Single Destinations</TabsTrigger>
              <TabsTrigger value="trips">Multi-Destination Trips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings">
              {userBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You have no single destination bookings.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/trip-planner')}>
                    Plan a Trip
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBookings.map((booking) => {
                    const destination = getDestinationById(booking.destinationId);
                    return (
                      <Card key={booking.id} className="overflow-hidden">
                        {destination && (
                          <>
                            <div
                              className="h-40 bg-cover bg-center"
                              style={{ backgroundImage: `url(${destination.image})` }}
                            />
                            <CardHeader className="pb-2">
                              <CardTitle>{destination.name}</CardTitle>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{destination.city}, {destination.state}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm">
                                  {format(new Date(booking.checkIn), 'PPP')} at {booking.timeSlot}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm">{booking.visitors} visitors</span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-medium">{formatPrice(booking.totalAmount)}</span>
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
                  <p className="text-gray-500">You have no multi-destination trips.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/trip-planner')}>
                    Plan a Trip
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userTripPlans.map((trip) => {
                    const primaryDestination = getDestinationById(trip.selectedDestinations[0]);
                    return (
                      <Card key={trip.id} className="overflow-hidden">
                        {primaryDestination && (
                          <>
                            <div
                              className="h-40 bg-cover bg-center"
                              style={{ backgroundImage: `url(${primaryDestination.image})` }}
                            />
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle>Multi-Destination Trip</CardTitle>
                                <Badge>{trip.selectedDestinations.length} destinations</Badge>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>Starting: {primaryDestination.city}, {primaryDestination.state}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm">
                                  {format(new Date(trip.startDate), 'PPP')} to {format(new Date(trip.endDate), 'PPP')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm">{trip.numberOfPeople} travelers</span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-medium">{formatPrice(trip.totalCost)}</span>
                                <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'}>
                                  {trip.status}
                                </Badge>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full"
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
      </div>
    </Layout>
  );
};

export default MyBookings;
