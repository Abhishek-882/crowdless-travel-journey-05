import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookings } from "../context/BookingContext";
import { useTripPlanning } from "../context/TripPlanningContext";
import { useAuth } from "../context/AuthContext";
import { useDestinations } from "../context/DestinationContext";
import Layout from "../components/Layout";
import TripItinerary from "../components/TripItinerary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gallery, GalleryImage } from "@/components/ui/gallery";
import { format } from "date-fns";
import { MapPin, Calendar, Users, CreditCard, Route, Hotel, Bus, Car, Train, Plane, Info, Clock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getBookingById, getUserTripPlans, cancelBooking } = useBookings();
  const { getTripPlanById, cancelTripPlan, getDistanceMatrix } = useTripPlanning();
  const { destinations, getDestinationById } = useDestinations();
  const { toast } = useToast();
  const [booking, setBooking] = useState(null);
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distances, setDistances] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        if (id?.startsWith("booking_")) {
          const bookingData = getBookingById(id);
          if (bookingData) {
            setBooking(bookingData);
          } else {
            toast({
              title: "Booking not found",
              description: "We couldn't find this booking",
              variant: "destructive",
            });
            navigate("/bookings");
          }
        } else if (id?.startsWith("trip_")) {
          const tripPlanData = getTripPlanById(id);
          if (tripPlanData) {
            setTripPlan(tripPlanData);
            
            if (tripPlanData.selectedDestinations?.length > 1) {
              const matrix = getDistanceMatrix(tripPlanData.selectedDestinations);
              setDistances(matrix);
              
              let totalDist = 0;
              const visited = new Set();
              
              for (let i = 0; i < tripPlanData.selectedDestinations.length - 1; i++) {
                const fromId = tripPlanData.selectedDestinations[i];
                const toId = tripPlanData.selectedDestinations[i + 1];
                const route = matrix.find(r => r.fromId === fromId && r.toId === toId);
                
                if (route && !visited.has(`${fromId}-${toId}`)) {
                  totalDist += route.distanceKm;
                  visited.add(`${fromId}-${toId}`);
                }
              }
              
              setTotalDistance(totalDist);
            }
          } else {
            toast({
              title: "Trip plan not found",
              description: "We couldn't find this trip plan",
              variant: "destructive",
            });
            navigate("/bookings");
          }
        } else {
          navigate("/bookings");
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser, navigate]);

  const handleCancel = async () => {
    try {
      if (booking) {
        await cancelBooking(booking.id);
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been cancelled successfully",
        });
      } else if (tripPlan) {
        await cancelTripPlan(tripPlan.id);
        toast({
          title: "Trip Plan Cancelled",
          description: "Your trip plan has been cancelled successfully",
        });
      }
      navigate("/bookings");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const getTravelIcon = (type) => {
    switch (type) {
      case "bus":
        return <Bus className="h-5 w-5" />;
      case "train":
        return <Train className="h-5 w-5" />;
      case "flight":
        return <Plane className="h-5 w-5" />;
      case "car":
        return <Car className="h-5 w-5" />;
      default:
        return <Route className="h-5 w-5" />;
    }
  };

  const renderDestinationDetails = () => {
    if (!tripPlan) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> 
            Destinations & Distances
          </CardTitle>
          <CardDescription>
            Total trip distance: {Math.round(totalDistance)} km
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tripPlan.selectedDestinations.map((destId, index) => {
              const destination = getDestinationById(destId);
              if (!destination) return null;

              let distanceInfo = null;
              if (index < tripPlan.selectedDestinations.length - 1) {
                const nextDestId = tripPlan.selectedDestinations[index + 1];
                const distanceData = distances.find(
                  d => d.fromId === destId && d.toId === nextDestId
                );
                
                if (distanceData) {
                  const travelTime = distanceData.travelTimesByTransport[tripPlan.transportType] || 0;
                  distanceInfo = (
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Route className="h-4 w-4" />
                        {Math.round(distanceData.distanceKm)} km to next destination
                        {" • "}
                        <Clock className="h-4 w-4 ml-1" />
                        {Math.round(travelTime)} hours travel time
                      </span>
                    </div>
                  );
                }
              }

              return (
                <div key={destId} className="relative pl-6 pb-4">
                  {index < tripPlan.selectedDestinations.length - 1 && (
                    <div className="absolute left-2 top-4 w-0.5 h-full bg-muted"></div>
                  )}
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{destination.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {destination.city}, {destination.state}
                    </p>
                    {distanceInfo}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPhotoGallery = () => {
    if (!tripPlan || !tripPlan.photos || tripPlan.photos.length === 0) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trip Photos</CardTitle>
          <CardDescription>Photos from your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Gallery className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tripPlan.photos.map((photo, index) => (
              <GalleryImage key={index} src={photo} alt={`Trip photo ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
            ))}
          </Gallery>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-10">
          <h1 className="text-2xl font-bold mb-6">Loading booking details...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {tripPlan ? "Trip Plan Details" : "Booking Details"}
              </h1>
              <Button
                variant="outline"
                onClick={() => navigate("/bookings")}
              >
                Back to Bookings
              </Button>
            </div>

            {booking && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {getDestinationById(booking.destinationId)?.name || "Destination"}
                  </CardTitle>
                  <CardDescription>
                    {getDestinationById(booking.destinationId)?.city}, {getDestinationById(booking.destinationId)?.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Check-in: {format(new Date(booking.checkIn), "PPP")} at {booking.timeSlot}
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
                  <Badge variant={booking.status === "confirmed" ? "success" : "destructive"}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </CardContent>
                {booking.status === "confirmed" && (
                  <CardFooter>
                    <Button variant="destructive" onClick={handleCancel}>
                      Cancel Booking
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}

            {tripPlan && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {tripPlan.selectedDestinations.length} Destination{tripPlan.selectedDestinations.length > 1 ? "s" : ""} Trip
                        </CardTitle>
                        <CardDescription>
                          {tripPlan.numberOfDays} days • {tripPlan.numberOfPeople} travelers
                        </CardDescription>
                      </div>
                      <Badge variant={tripPlan.status === "confirmed" ? "success" : "destructive"}>
                        {tripPlan.status.charAt(0).toUpperCase() + tripPlan.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>
                        {format(new Date(tripPlan.startDate), "PPP")} - {format(new Date(tripPlan.endDate), "PPP")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getTravelIcon(tripPlan.transportType)}
                      <span>
                        Travel by {tripPlan.transportType.charAt(0).toUpperCase() + tripPlan.transportType.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Hotel className="h-5 w-5 text-muted-foreground" />
                      <span>
                        {tripPlan.travelStyle === "base-hotel" 
                          ? "Base hotel stay" 
                          : "Multiple hotel stays"}
                        {tripPlan.sleepTransport && " • Some nights in transport"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span>
                        Total Cost: ₹{tripPlan.totalCost.toLocaleString()}
                      </span>
                    </div>
                    
                    {tripPlan.isPremium && (
                      <div className="mt-2">
                        <Badge variant="premium">Premium Trip</Badge>
                      </div>
                    )}
                  </CardContent>
                  {tripPlan.status === "confirmed" && (
                    <CardFooter>
                      <Button variant="destructive" onClick={handleCancel}>
                        Cancel Trip
                      </Button>
                    </CardFooter>
                  )}
                </Card>

                {renderDestinationDetails()}
                {renderPhotoGallery()}

                {tripPlan.itinerary && tripPlan.itinerary.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Itinerary</CardTitle>
                      <CardDescription>
                        Day-by-day plan for your journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TripItinerary 
                        itinerary={tripPlan.itinerary} 
                        transportType={tripPlan.transportType || 'car'}
                        isPremium={!!tripPlan.isPremium}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
          
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you need assistance with your booking, please contact our customer support.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">support@travelbooking.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="text-sm">+91 9876543210</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingDetails;
