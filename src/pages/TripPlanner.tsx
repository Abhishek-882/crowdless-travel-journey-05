
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useDestinations } from '../context/DestinationContext';
import { useTripPlanning } from '../context/TripPlanningContext';
import TripValidation from '../components/TripValidation';
import TripDistanceCalculator from '../components/TripDistanceCalculator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, addDays, differenceInDays } from 'date-fns';
import { CalendarIcon, Clock, Users, MapPin, Car, Bus, Train, Plane, Info, Star, Coffee, Briefcase } from 'lucide-react';
import { HotelType, TransportType, GuideType, TripItineraryDay } from '../types';
import { formatPrice } from '../utils/helpers';

const TripPlanner: React.FC = () => {
  const { currentUser } = useAuth();
  const { destinations } = useDestinations();
  const { 
    hotels, 
    guides, 
    transports, 
    getHotelsByDestination, 
    getGuidesByDestination, 
    saveTripPlan,
    checkTripFeasibility,
    generateOptimalItinerary
  } = useTripPlanning();
  
  const navigate = useNavigate();

  // Trip planning state
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 3));
  const [budgetRange, setBudgetRange] = useState<[number, number]>([5000, 50000]);
  const [tripName, setTripName] = useState<string>("");
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState<string>('destinations');
  const [transportPlan, setTransportPlan] = useState<string | null>(null);
  const [hotelPlan, setHotelPlan] = useState<string | null>(null);
  
  // Plan options
  const [transportOptions, setTransportOptions] = useState<{ 
    type: 'bus' | 'train' | 'flight' | 'car', 
    cost: number,
    transport: TransportType 
  }[]>([]);
  
  const [hotelOptions, setHotelOptions] = useState<{
    type: 'budget' | 'standard' | 'luxury',
    totalCost: number,
    perPersonCost: number,
    hotels: HotelType[]
  }[]>([]);

  // Summary
  const [tripSummary, setTripSummary] = useState<{
    destinationsCost: number;
    transportCost: number;
    hotelsCost: number;
    guidesCost: number;
    totalCost: number;
  } | null>(null);
  
  // Validation
  const [tripFeasibility, setTripFeasibility] = useState<{
    feasible: boolean;
    daysNeeded: number;
    daysShort?: number;
  }>({ feasible: true, daysNeeded: 0 });
  
  // Itinerary
  const [tripItinerary, setTripItinerary] = useState<TripItineraryDay[]>([]);
  
  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [forceValidationBypass, setForceValidationBypass] = useState(false);

  // Calculate number of days for the trip
  const numberOfDays = startDate && endDate 
    ? differenceInDays(endDate, startDate) + 1
    : 1;

  // Check trip feasibility when destinations or days change
  useEffect(() => {
    if (selectedDestinations.length > 0 && transportPlan && numberOfDays) {
      const feasibility = checkTripFeasibility({
        destinationIds: selectedDestinations,
        transportType: transportPlan as 'bus' | 'train' | 'flight' | 'car',
        numberOfDays
      });
      setTripFeasibility(feasibility);
      
      // Generate itinerary if trip is feasible or we're forcing bypass
      if (feasibility.feasible || forceValidationBypass) {
        if (startDate) {
          const itinerary = generateOptimalItinerary({
            destinationIds: selectedDestinations,
            transportType: transportPlan as 'bus' | 'train' | 'flight' | 'car',
            numberOfDays,
            startDate
          });
          setTripItinerary(itinerary);
        }
      }
    }
  }, [selectedDestinations, transportPlan, numberOfDays, startDate, forceValidationBypass]);
  
  // Get hotels for selected destinations
  const getSelectedHotels = (type: 'budget' | 'standard' | 'luxury'): HotelType[] => {
    return selectedDestinations.map(destId => {
      const destHotels = getHotelsByDestination(destId);
      return destHotels.find(hotel => hotel.type === type) || destHotels[0];
    }).filter(Boolean);
  };

  // Calculate costs for transport options
  useEffect(() => {
    if (selectedDestinations.length > 0 && numberOfPeople > 0) {
      // Group transports by type
      const transportByType = transports.reduce<Record<string, TransportType[]>>((acc, transport) => {
        if (!acc[transport.type]) acc[transport.type] = [];
        acc[transport.type].push(transport);
        return acc;
      }, {});
      
      // Create options with the cheapest transport of each type
      const options = Object.entries(transportByType).map(([type, typeTransports]) => {
        const cheapestTransport = typeTransports.sort((a, b) => a.pricePerPerson - b.pricePerPerson)[0];
        return {
          type: type as 'bus' | 'train' | 'flight' | 'car',
          cost: cheapestTransport.pricePerPerson * numberOfPeople * selectedDestinations.length,
          transport: cheapestTransport
        };
      });
      
      setTransportOptions(options.sort((a, b) => a.cost - b.cost));
    }
  }, [selectedDestinations, numberOfPeople]);

  // Calculate costs for hotel options
  useEffect(() => {
    if (selectedDestinations.length > 0 && numberOfPeople > 0 && numberOfDays > 0) {
      const hotelTypes: ('budget' | 'standard' | 'luxury')[] = ['budget', 'standard', 'luxury'];
      
      const options = hotelTypes.map(type => {
        const hotelsForType = getSelectedHotels(type);
        const totalCost = hotelsForType.reduce(
          (sum, hotel) => sum + (hotel.pricePerPerson * numberOfPeople * numberOfDays), 
          0
        );
        
        return {
          type,
          totalCost,
          perPersonCost: totalCost / numberOfPeople,
          hotels: hotelsForType
        };
      });
      
      setHotelOptions(options.sort((a, b) => a.totalCost - b.totalCost));
    }
  }, [selectedDestinations, numberOfPeople, numberOfDays]);

  // Update trip summary when plans are selected
  useEffect(() => {
    if (transportPlan && hotelPlan) {
      const selectedTransport = transportOptions.find(option => option.type === transportPlan);
      const selectedHotelOption = hotelOptions.find(option => option.type === hotelPlan);
      
      if (selectedTransport && selectedHotelOption) {
        // Calculate guides cost
        const guidesCost = selectedGuides.reduce((total, guideId) => {
          const guide = guides.find(g => g.id === guideId);
          return total + (guide ? guide.pricePerDay * numberOfDays : 0);
        }, 0);
        
        setTripSummary({
          destinationsCost: selectedDestinations.length * 0, // Placeholder, could be entry fees later
          transportCost: selectedTransport.cost,
          hotelsCost: selectedHotelOption.totalCost,
          guidesCost: guidesCost,
          totalCost: selectedTransport.cost + selectedHotelOption.totalCost + guidesCost
        });
      }
    }
  }, [transportPlan, hotelPlan, selectedGuides, numberOfDays]);

  // Handle destination selection/deselection
  const toggleDestination = (destinationId: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destinationId)
        ? prev.filter(id => id !== destinationId)
        : [...prev, destinationId]
    );
  };

  // Handle guide selection/deselection
  const toggleGuide = (guideId: string) => {
    setSelectedGuides(prev => 
      prev.includes(guideId)
        ? prev.filter(id => id !== guideId)
        : [...prev, guideId]
    );
  };

  // Handle transport suggestion
  const handleTransportSuggestion = (transportType: 'bus' | 'train' | 'flight' | 'car') => {
    setTransportPlan(transportType);
  };

  // Move to next step
  const goToNextStep = () => {
    switch(currentStep) {
      case 'destinations':
        // Only proceed if feasible or user has chosen to bypass
        if (tripFeasibility.feasible || forceValidationBypass || !transportPlan) {
          setCurrentStep('transport');
        }
        break;
      case 'transport':
        // Check feasibility after transport selection
        if (tripFeasibility.feasible || forceValidationBypass) {
          setCurrentStep('hotels');
        }
        break;
      case 'hotels':
        setCurrentStep('summary');
        break;
      default:
        break;
    }
  };

  // Move to previous step
  const goToPreviousStep = () => {
    switch(currentStep) {
      case 'transport':
        setCurrentStep('destinations');
        break;
      case 'hotels':
        setCurrentStep('transport');
        break;
      case 'summary':
        setCurrentStep('hotels');
        break;
      default:
        break;
    }
  };

  // Handle final booking - update to include itinerary
  const handleBookTrip = async () => {
    if (!currentUser || !startDate || !endDate || !transportPlan || !hotelPlan || !tripSummary) return;

    setIsLoading(true);
    try {
      // Get hotel IDs for the selected type
      const selectedHotels = getSelectedHotels(hotelPlan as 'budget' | 'standard' | 'luxury')
        .map(hotel => hotel.id);

      // Create trip plan data
      const tripPlanData = {
        userId: currentUser.id,
        selectedDestinations: selectedDestinations,
        selectedGuides: selectedGuides,
        selectedHotels: selectedHotels,
        selectedTransport: transportPlan,
        transportType: transportPlan as 'bus' | 'train' | 'flight' | 'car',
        isPremium: !!currentUser.isPremium,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        numberOfDays: numberOfDays,
        numberOfPeople: numberOfPeople,
        budget: budgetRange[1],
        totalCost: tripSummary.totalCost,
        destinationsCost: tripSummary.destinationsCost,
        hotelsCost: tripSummary.hotelsCost,
        transportCost: tripSummary.transportCost,
        guidesCost: tripSummary.guidesCost,
        status: 'confirmed' as const,
        itinerary: tripItinerary
      };

      // Save the trip plan
      const tripPlanId = await saveTripPlan(tripPlanData);
      navigate('/bookings');
    } catch (error) {
      console.error('Failed to book trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we can proceed to next step
  const canProceedFromDestinations = selectedDestinations.length > 0 && startDate && endDate;
  const canProceedFromTransport = transportPlan !== null;
  const canProceedFromHotels = hotelPlan !== null;

  // Determine if the selected destinations have guides
  const availableGuides = selectedDestinations.flatMap(destId => 
    getGuidesByDestination(destId)
  );

  // Increase trip duration to match feasibility requirements
  const adjustTripDuration = () => {
    if (endDate && tripFeasibility.daysNeeded) {
      const newEndDate = addDays(startDate || new Date(), tripFeasibility.daysNeeded - 1);
      setEndDate(newEndDate);
    }
  };

  // Force continue despite validation warning
  const bypassValidation = () => {
    setForceValidationBypass(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Plan Your Trip</h1>
          <p className="text-gray-600">Create a customized trip across multiple destinations</p>
        </div>
        
        <div className="flex flex-col gap-8">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8 max-w-3xl mx-auto w-full">
            {['Destinations', 'Transport', 'Hotels', 'Summary'].map((step, index) => (
              <div 
                key={step} 
                className={`flex flex-col items-center ${
                  currentStep === step.toLowerCase() ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === step.toLowerCase() 
                    ? 'bg-primary text-white' 
                    : ['destinations', 'transport', 'hotels', 'summary'].indexOf(currentStep) >= index
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>

          {/* Destinations Step */}
          {currentStep === 'destinations' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Destinations</CardTitle>
                  <CardDescription>Select the places you want to visit on your trip</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trip Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="tripName">Trip Name</Label>
                      <Input 
                        id="tripName" 
                        placeholder="Family Goa Trip"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="people">Number of People</Label>
                      <div className="flex items-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setNumberOfPeople(p => Math.max(1, p - 1))}
                          disabled={numberOfPeople <= 1}
                        >
                          -
                        </Button>
                        <Input 
                          id="people"
                          className="w-20 mx-2 text-center"
                          value={numberOfPeople} 
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 25) {
                              setNumberOfPeople(value);
                            }
                          }}
                          min={1}
                          max={25}
                          type="number"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setNumberOfPeople(p => Math.min(25, p + 1))}
                          disabled={numberOfPeople >= 25}
                        >
                          +
                        </Button>
                        <span className="ml-3 text-gray-500 text-sm">Max 25 people</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="startDate"
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'PPP') : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="endDate"
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'PPP') : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => 
                              date < new Date() || (startDate && date < startDate)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range (per person)</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="number"
                          value={budgetRange[0]}
                          onChange={(e) => {
                            const min = parseInt(e.target.value);
                            if (!isNaN(min) && min >= 0 && min < budgetRange[1]) {
                              setBudgetRange([min, budgetRange[1]]);
                            }
                          }}
                          className="w-24"
                        />
                        <span>to</span>
                        <Input
                          type="number"
                          value={budgetRange[1]}
                          onChange={(e) => {
                            const max = parseInt(e.target.value);
                            if (!isNaN(max) && max > budgetRange[0]) {
                              setBudgetRange([budgetRange[0], max]);
                            }
                          }}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Distance Calculator (only show if destinations selected) */}
                  {selectedDestinations.length > 1 && (
                    <TripDistanceCalculator 
                      destinationIds={selectedDestinations} 
                      numberOfDays={numberOfDays}
                      onSuggestTransport={handleTransportSuggestion}
                    />
                  )}
                  
                  {/* Add trip validation if destinations are selected */}
                  {selectedDestinations.length > 0 && transportPlan && (
                    <TripValidation 
                      feasible={tripFeasibility.feasible} 
                      daysNeeded={tripFeasibility.daysNeeded}
                      daysShort={tripFeasibility.daysShort}
                      onAdjustDays={adjustTripDuration}
                      onContinue={bypassValidation}
                      isPremium={currentUser?.isPremium}
                    />
                  )}
                  
                  {/* Premium feature notice */}
                  {!currentUser?.isPremium && (
                    <Alert className="mb-6">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Premium Feature</AlertTitle>
                      <AlertDescription>
                        Upgrade to premium to access crowd data for better trip planning.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Destinations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {destinations.map(destination => (
                      <Card 
                        key={destination.id} 
                        className={`overflow-hidden cursor-pointer transition-all ${
                          selectedDestinations.includes(destination.id) 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : ''
                        }`}
                        onClick={() => toggleDestination(destination.id)}
                      >
                        <div 
                          className="h-36 bg-cover bg-center"
                          style={{ backgroundImage: `url(${destination.image})` }}
                        />
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{destination.name}</h3>
                            <Badge variant="outline">{formatPrice(destination.price)}</Badge>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {destination.city}, {destination.state}
                          </div>
                          
                          {/* Show crowd data only for premium users */}
                          {currentUser?.isPremium && (
                            <div className="flex items-center text-sm">
                              <Users className="h-3 w-3 mr-1" />
                              <span>Best time: {destination.bestTimeToVisit}</span>
                            </div>
                          )}
                          
                          {selectedDestinations.includes(destination.id) && (
                            <div className="mt-3 flex justify-end">
                              <Badge variant="default">Selected</Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" disabled>
                    Back
                  </Button>
                  <Button
                    disabled={!canProceedFromDestinations}
                    onClick={goToNextStep}
                  >
                    Next: Choose Transport
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Transport Step */}
          {currentStep === 'transport' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Transport</CardTitle>
                  <CardDescription>
                    Select how you want to travel between your destinations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trip Summary at this stage */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-medium text-sm text-gray-700">Trip Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {selectedDestinations.length} destination{selectedDestinations.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{numberOfDays} days</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{numberOfPeople} people</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Distance Matrix Calculator */}
                  {selectedDestinations.length > 1 && (
                    <TripDistanceCalculator 
                      destinationIds={selectedDestinations} 
                      numberOfDays={numberOfDays}
                      selectedTransportType={transportPlan as 'bus' | 'train' | 'flight' | 'car' | undefined}
                      onSuggestTransport={handleTransportSuggestion}
                    />
                  )}
                  
                  <Separator />
                  
                  {/* Transport Options */}
                  <div className="space-y-6">
                    {transportOptions.map((option) => {
                      const IconComponent = option.type === 'bus' 
                        ? Bus 
                        : option.type === 'train' 
                          ? Train 
                          : option.type === 'flight' 
                            ? Plane 
                            : Car;
                            
                      return (
                        <div 
                          key={option.type} 
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            transportPlan === option.type 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setTransportPlan(option.type)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-full ${
                                transportPlan === option.type ? 'bg-primary/20' : 'bg-gray-100'
                              }`}>
                                <IconComponent className={`h-6 w-6 ${
                                  transportPlan === option.type ? 'text-primary' : 'text-gray-500'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold capitalize">{option.type}</h3>
                                <p className="text-sm text-gray-500">
                                  {option.transport.amenities.slice(0, 3).join(', ')}
                                  {option.transport.amenities.length > 3 ? '...' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatPrice(option.cost)}</div>
                              <div className="text-sm text-gray-500">
                                Travel time: approx. {option.transport.travelTime} hours
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={goToPreviousStep}>
                    Back
                  </Button>
                  <Button
                    disabled={!canProceedFromTransport}
                    onClick={goToNextStep}
                  >
                    Next: Choose Hotels
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Hotels Step */}
          {currentStep === 'hotels' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Hotels</CardTitle>
                  <CardDescription>Select your preferred hotel type for your stay</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trip Summary at this stage */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-medium text-sm text-gray-700">Trip Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {selectedDestinations.length} destination{selectedDestinations.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{numberOfDays} days</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{numberOfPeople} people</span>
                      </div>
                      <div className="flex items-center capitalize">
                        {transportPlan === 'bus' 
                          ? <Bus className="h-4 w-4 mr-2 text-gray-500" />
                          : transportPlan === 'train' 
                            ? <Train className="h-4 w-4 mr-2 text-gray-500" />
                            : transportPlan === 'flight' 
                              ? <Plane className="h-4 w-4 mr-2 text-gray-500" />
                              : <Car className="h-4 w-4 mr-2 text-gray-500" />
                        }
                        <span>{transportPlan}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Hotel Options */}
                  <div className="space-y-6">
                    {hotelOptions.map((option) => (
                      <div 
                        key={option.type} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          hotelPlan === option.type 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setHotelPlan(option.type)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold capitalize">
                              {option.type} Hotels
                              {option.type === 'budget' && ' (Affordable)'}
                              {option.type === 'standard' && ' (Comfortable)'}
                              {option.type === 'luxury' && ' (Premium)'}
                            </h3>
                            <div className="flex items-center">
                              {Array(option.type === 'budget' ? 3 : option.type === 'standard' ? 4 : 5)
                                .fill(0)
                                .map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                ))
                              }
                              {Array(5 - (option.type === 'budget' ? 3 : option.type === 'standard' ? 4 : 5))
                                .fill(0)
                                .map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-gray-200" />
                                ))
                              }
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {option.type === 'budget' && 'Basic amenities, clean rooms, budget-friendly option.'}
                              {option.type === 'standard' && 'Good amenities, comfortable rooms with additional facilities.'}
                              {option.type === 'luxury' && 'Premium amenities, spacious rooms with exceptional service.'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatPrice(option.totalCost)}</div>
                            <div className="text-xs text-gray-500">
                              {formatPrice(option.perPersonCost)} per person
                            </div>
                            <div className="text-xs text-gray-500">
                              For {numberOfDays} night{numberOfDays !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Tour Guides */}
                  {availableGuides.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Optional Tour Guides</h3>
                      <p className="text-sm text-gray-500">
                        Select tour guides for your destinations if desired. 
                        {currentUser?.isPremium && ' As a premium user, you get one free guide per destination.'}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableGuides.map((guide) => {
                          const isSelected = selectedGuides.includes(guide.id);
                          const destination = destinations.find(d => d.id === guide.destinationId);
                          const isFreeForPremium = currentUser?.isPremium && 
                            selectedGuides.filter(g => {
                              const selectedGuide = guides.find(sg => sg.id === g);
                              return selectedGuide && selectedGuide.destinationId === guide.destinationId;
                            }).length === 0;
                            
                          return (
                            <div 
                              key={guide.id} 
                              className={`p-3 border rounded-md cursor-pointer transition-all ${
                                isSelected ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => toggleGuide(guide.id)}
                            >
                              <div className="flex justify-between">
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">{guide.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {destination?.name}, {destination?.city}
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs">
                                    <div className="flex">
                                      {Array(Math.round(guide.rating))
                                        .fill(0)
                                        .map((_, i) => (
                                          <Star key={i} className="h-2 w-2 text-yellow-400 fill-yellow-400" />
                                        ))
                                      }
                                    </div>
                                    <span className="text-gray-500">{guide.experience} years exp.</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {guide.languages.slice(0, 3).map(lang => (
                                      <Badge key={lang} variant="outline" className="text-xs py-0 h-5">
                                        {lang}
                                      </Badge>
                                    ))}
                                    {guide.languages.length > 3 && (
                                      <Badge variant="outline" className="text-xs py-0 h-5">
                                        +{guide.languages.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-sm">
                                    {isFreeForPremium ? (
                                      <span className="text-green-600">Free</span>
                                    ) : (
                                      formatPrice(guide.pricePerDay * numberOfDays)
                                    )}
                                  </div>
                                  {!isFreeForPremium && (
                                    <div className="text-xs text-gray-500">
                                      {formatPrice(guide.pricePerDay)} per day
                                    </div>
                                  )}
                                  {isSelected && (
                                    <Badge variant="default" className="mt-1">Selected</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={goToPreviousStep}>
                    Back
                  </Button>
                  <Button
                    disabled={!canProceedFromHotels}
                    onClick={goToNextStep}
                  >
                    Next: Review Trip
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {/* Summary Step */}
          {currentStep === 'summary' && tripSummary && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Summary</CardTitle>
                  <CardDescription>Review your trip details before booking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trip Overview */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">{tripName || 'Your Trip'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-500 text-sm">Dates</span>
                        <span>
                          {startDate && endDate && `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`}
                        </span>
                        <span className="text-gray-500 text-sm mt-1">
                          {numberOfDays} day{numberOfDays !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-col bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-500 text-sm">Travelers</span>
                        <span>{numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'}</span>
                      </div>
                      <div className="flex flex-col bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-500 text-sm">Transport</span>
                        <span className="capitalize">{transportPlan}</span>
                      </div>
                      <div className="flex flex-col bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-500 text-sm">Hotel Type</span>
                        <span className="capitalize">{hotelPlan}</span>
                      </div>
                      <div className="flex flex-col bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-500 text-sm">Destinations</span>
                        <span>{selectedDestinations.length} location{selectedDestinations.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-col bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-500 text-sm">Guides</span>
                        <span>{selectedGuides.length} guide{selectedGuides.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Cost Breakdown */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Cost Breakdown</h3>
                    <div className="rounded-md border divide-y">
                      <div className="flex justify-between p-3">
                        <span>Transport</span>
                        <span>{formatPrice(tripSummary.transportCost)}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span>Accommodation ({numberOfDays} nights)</span>
                        <span>{formatPrice(tripSummary.hotelsCost)}</span>
                      </div>
                      {tripSummary.guidesCost > 0 && (
                        <div className="flex justify-between p-3">
                          <span>Guide Services</span>
                          <span>{formatPrice(tripSummary.guidesCost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between p-3 font-medium">
                        <span>Total Cost</span>
                        <span>{formatPrice(tripSummary.totalCost)}</span>
                      </div>
                      <div className="flex justify-between p-3 text-sm text-gray-500">
                        <span>Cost per person</span>
                        <span>{formatPrice(tripSummary.totalCost / numberOfPeople)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Destinations */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Selected Destinations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedDestinations.map(destId => {
                        const destination = destinations.find(d => d.id === destId);
                        if (!destination) return null;
                        
                        return (
                          <div key={destId} className="border rounded-md overflow-hidden">
                            <div 
                              className="h-24 bg-cover bg-center"
                              style={{ backgroundImage: `url(${destination.image})` }}
                            />
                            <div className="p-3">
                              <h4 className="font-medium">{destination.name}</h4>
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {destination.city}, {destination.state}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Itinerary */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Your Itinerary</h3>
                    {tripItinerary.length > 0 ? (
                      <div className="space-y-3">
                        {tripItinerary.map((day, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    Day {day.day}: {day.destinationName}
                                  </h4>
                                  <div className="text-sm text-gray-500">
                                    {format(new Date(day.date), 'MMM d, yyyy')}
                                  </div>
                                  
                                  {day.isTransitDay ? (
                                    <Badge className="mt-2" variant="secondary">
                                      Transit Day
                                    </Badge>
                                  ) : (
                                    <ul className="mt-2 text-sm space-y-1">
                                      {day.activities.map((activity, i) => (
                                        <li key={i} className="flex items-start">
                                          <span className="mr-2">•</span>
                                          <span>{activity}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                
                                {currentUser?.isPremium && !day.isTransitDay && (
                                  <div className="bg-purple-50 border border-purple-100 rounded-md p-2 text-xs text-purple-700">
                                    <div className="font-medium mb-1">Premium Insights:</div>
                                    <div className="flex items-center">
                                      <Users className="h-3 w-3 mr-1" />
                                      <span>Least crowds at 9-10 AM</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <div className="text-gray-500">Itinerary will be generated once your trip is confirmed.</div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={goToPreviousStep}>
                    Back
                  </Button>
                  <Button 
                    disabled={isLoading}
                    onClick={handleBookTrip}
                  >
                    {isLoading ? 'Booking...' : 'Book Trip'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TripPlanner;
