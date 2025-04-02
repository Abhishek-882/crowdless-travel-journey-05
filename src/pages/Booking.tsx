
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useDestinations } from '../context/DestinationContext';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '../utils/helpers';
import { Loader2, Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDestinationById, getBestTimeToVisit, getCurrentCrowdLevel } = useDestinations();
  const { currentUser } = useAuth();
  const { addBooking, loading } = useBookings();
  const navigate = useNavigate();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [visitors, setVisitors] = useState<number>(1);
  const [ticketType, setTicketType] = useState<string>('standard');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const destination = id ? getDestinationById(id) : null;

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', 
    '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const ticketPrices = {
    standard: destination?.price || 0,
    premium: (destination?.price || 0) * 1.5,
    guided: (destination?.price || 0) * 2
  };
  
  // Get the best time to visit and current crowd level
  const bestTimeToVisit = destination ? getBestTimeToVisit(destination.crowdData) : '';
  const crowdLevel = destination ? getCurrentCrowdLevel(destination.crowdData) : 'low';

  useEffect(() => {
    if (!destination) return;
    
    const basePrice = ticketPrices[ticketType as keyof typeof ticketPrices];
    const visitorPrice = basePrice * visitors;
    
    // Add weekend surcharge if applicable
    const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
    const weekendMultiplier = isWeekend ? 1.2 : 1;
    
    setTotalPrice(Math.round(visitorPrice * weekendMultiplier));
  }, [destination, visitors, ticketType, date]);

  if (!destination) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading destination information...</p>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !currentUser) return;
    
    try {
      setIsProcessing(true);
      
      const bookingData = {
        destinationId: destination.id,
        userId: currentUser.id,
        checkIn: date.toISOString(),
        timeSlot,
        visitors,
        ticketType,
        totalAmount: totalPrice,
        status: 'confirmed' as const
      };
      
      await addBooking(bookingData);
      navigate('/bookings');
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Your Visit</h1>
          <p className="text-gray-600">Complete your booking for {destination.name}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Booking form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  Fill in the details to book your visit to {destination.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Visit Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Time Slot</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger id="timeSlot">
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visitors">Number of Visitors</Label>
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setVisitors(v => Math.max(1, v - 1))}
                      >
                        -
                      </Button>
                      <Input 
                        id="visitors" 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={visitors} 
                        onChange={e => setVisitors(parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setVisitors(v => Math.min(10, v + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketType">Ticket Type</Label>
                    <Select value={ticketType} onValueChange={setTicketType}>
                      <SelectTrigger id="ticketType">
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="standard">Standard ({formatPrice(ticketPrices.standard)})</SelectItem>
                        <SelectItem value="premium">Premium ({formatPrice(ticketPrices.premium)})</SelectItem>
                        <SelectItem value="guided">Guided Tour ({formatPrice(ticketPrices.guided)})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="font-medium">{destination.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{date ? format(date, 'PP') : '-'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{timeSlot || '-'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Visitors:</span>
                  <span className="font-medium">{visitors}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ticket Type:</span>
                  <span className="font-medium capitalize">{ticketType}</span>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  disabled={!date || !timeSlot || isProcessing || loading}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Best time to visit */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Best Time to Visit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">Lowest crowds at: <span className="font-medium">{bestTimeToVisit}</span></p>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">Current crowd level: <span className="font-medium capitalize">{crowdLevel}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Booking;
