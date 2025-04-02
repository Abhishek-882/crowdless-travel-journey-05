
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { useDestinations } from '../context/DestinationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '../utils/helpers';
import { 
  Loader2, Calendar, MapPin, Users, Clock, AlertTriangle, 
  CheckCircle, XCircle, Info 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '../types';

const MyBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserBookings, cancelBooking, loading } = useBookings();
  const { getDestinationById } = useDestinations();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      const userBookings = getUserBookings(currentUser.id);
      setBookings(userBookings);
    }
  }, [currentUser, getUserBookings]);

  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && new Date(booking.checkIn) >= new Date()
  );
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.checkIn) < new Date() || booking.status === 'cancelled'
  );

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been successfully cancelled.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string, checkInDate: Date) => {
    const now = new Date();
    
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    
    if (checkInDate < now) {
      return <Badge variant="outline">Completed</Badge>;
    }
    
    return <Badge variant="success">Confirmed</Badge>;
  };

  const renderBookingCard = (booking: Booking) => {
    const destination = getDestinationById(booking.destinationId);
    if (!destination) return null;
    
    const checkInDate = parseISO(booking.checkIn);
    const isPast = new Date() > checkInDate;
    const isCancelled = booking.status === 'cancelled';
    
    return (
      <Card key={booking.id} className={`mb-6 ${isCancelled ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{destination.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {destination.city}, {destination.state}
              </CardDescription>
            </div>
            {getStatusBadge(booking.status, checkInDate)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {format(checkInDate, 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-medium flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {booking.timeSlot}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Guests</p>
              <p className="font-medium flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                {booking.visitors} {booking.visitors === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="font-medium">
                {formatPrice(booking.totalAmount)}
              </p>
            </div>
          </div>
          
          {isCancelled && (
            <div className="flex items-center mt-4 p-2 bg-red-50 text-red-700 rounded-md">
              <Info className="h-4 w-4 mr-2" />
              <p className="text-sm">This booking has been cancelled.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          {!isPast && !isCancelled ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!!cancellingId}
                onClick={() => handleCancelBooking(booking.id)}
              >
                {cancellingId === booking.id ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-3.5 w-3.5" />
                    Cancel Booking
                  </>
                )}
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate(`/destinations/${destination.id}`)}
              >
                View Details
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => navigate(`/destinations/${destination.id}`)}
            >
              View Destination
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading your bookings...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingBookings.length > 0 && (
                <span className="ml-2 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {upcomingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">Past & Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingBookings.length > 0 ? (
              <div>
                {upcomingBookings.map(booking => renderBookingCard(booking))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No upcoming bookings</h3>
                <p className="text-gray-500 mb-6">You don't have any upcoming bookings yet.</p>
                <Button onClick={() => navigate('/destinations')}>
                  Explore Destinations
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastBookings.length > 0 ? (
              <div>
                {pastBookings.map(booking => renderBookingCard(booking))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No past bookings</h3>
                <p className="text-gray-500">Your booking history will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyBookings;
