
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { useDestinations } from '../context/DestinationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '../utils/helpers';

const MyBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserBookings, cancelBooking } = useBookings();
  const { getDestinationById } = useDestinations();
  const navigate = useNavigate();

  // Get bookings for the current user
  const userBookings = currentUser ? getUserBookings(currentUser.id) : [];

  // Handle booking cancellation
  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your booked destinations</p>
        </div>

        {userBookings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">You have no bookings yet</h2>
            <p className="text-gray-500 mb-6">Explore destinations and book your next adventure!</p>
            <Button onClick={() => navigate('/destinations')}>Browse Destinations</Button>
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
      </div>
    </Layout>
  );
};

export default MyBookings;
