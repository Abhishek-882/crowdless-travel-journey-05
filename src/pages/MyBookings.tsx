import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';
import { useDestinations } from '../context/DestinationContext';
import { useAuth } from '../context/AuthContext';
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, CreditCard, Info } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'trips'>('bookings');
  const { getUserBookings, getUserTripPlans, cancelBooking } = useBookings();
  const { getDestinationById } = useDestinations();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [tripPlans, setTripPlans] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Fetch user-specific bookings and trip plans
    const fetchUserBookings = async () => {
      const userBookings = getUserBookings(currentUser.id);
      setBookings(userBookings);
    };

    const fetchUserTripPlans = async () => {
      const userTripPlans = getUserTripPlans(currentUser.id);
      setTripPlans(userTripPlans);
    };

    fetchUserBookings();
    fetchUserTripPlans();
  }, [currentUser, navigate, getUserBookings, getUserTripPlans]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      // Refresh bookings after cancellation
      const updatedBookings = getUserBookings(currentUser.id);
      setBookings(updatedBookings);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const filteredBookings = bookings;
  const filteredTripPlans = tripPlans;
  
  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList>
            <TabsTrigger value="bookings" onClick={() => setActiveTab('bookings')}>Bookings</TabsTrigger>
            <TabsTrigger value="trips" onClick={() => setActiveTab('trips')}>Trip Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings" className="mt-4">
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const destination = getDestinationById(booking.destinationId);
                  return (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {destination?.name || "Destination"}
                        </CardTitle>
                        <CardDescription>
                          {destination?.city}, {destination?.state}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span>
                            {format(new Date(booking.checkIn), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span>{booking.visitors} visitors</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <span>
                            Total: ₹{booking.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-muted-foreground" />
                          <span>Ticket Type: {booking.ticketType}</span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="bg-muted/30 flex justify-between">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                          View Details
                        </Button>
                        
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">No bookings found.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trips" className="mt-4">
            {filteredTripPlans.length > 0 ? (
              <div className="space-y-4">
                {filteredTripPlans.map((trip) => {
                  // Get the first destination for display
                  const firstDestination = trip.selectedDestinations.length > 0
                    ? getDestinationById(trip.selectedDestinations[0])
                    : null;
                  
                  return (
                    <Card key={trip.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {firstDestination?.name || "Trip"}
                        </CardTitle>
                        <CardDescription>
                          {trip.numberOfDays} days, {trip.numberOfPeople} travelers
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span>
                            {format(new Date(trip.startDate), "PPP")} - {format(new Date(trip.endDate), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <span>
                            Total Cost: ₹{trip.totalCost.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="bg-muted/30 flex justify-between">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/bookings/${trip.id}`)}
                        >
                          View Details
                        </Button>
                        
                        {trip.status === 'confirmed' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(trip.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">No trip plans found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyBookings;
