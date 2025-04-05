
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, MapPin, Clock, Car, Bus, Plane, Train, Calendar, Hotel, AlertTriangle } from 'lucide-react';
import { useTripPlanning } from '../context/TripPlanningContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { calculateTravelDetails } from '../utils/travelCalculator';

interface TripDistanceCalculatorProps {
  destinationIds: string[];
  numberOfDays: number;
  startDate?: Date;
  selectedTransportType?: 'bus' | 'train' | 'flight' | 'car';
  onSuggestTransport?: (transportType: 'bus' | 'train' | 'flight' | 'car') => void;
}

const TripDistanceCalculator: React.FC<TripDistanceCalculatorProps> = ({ 
  destinationIds, 
  numberOfDays,
  startDate,
  selectedTransportType,
  onSuggestTransport 
}) => {
  const { getDistanceMatrix, getSuggestedTransport, getHotelsByDestination, generateOptimalItinerary } = useTripPlanning();
  const { currentUser } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  
  // Get distances between all destinations
  const distanceMatrix = getDistanceMatrix(destinationIds);
  
  // Get suggested transport options based on destinations and trip duration
  const transportRecommendation = getSuggestedTransport(
    destinationIds, 
    numberOfDays, 
    currentUser?.isPremium
  );

  // Generate an optimal itinerary if we have a start date
  const itinerary = startDate ? 
    generateOptimalItinerary({
      destinationIds,
      transportType: selectedTransportType || transportRecommendation.recommendedType,
      numberOfDays,
      startDate
    }) : [];

  const totalTravelTime = transportRecommendation.totalTravelTimeHours;
  const totalDistance = transportRecommendation.totalDistanceKm;
  
  // Calculate the percentage of the trip dedicated to travel
  const travelTimePercentage = (totalTravelTime / (numberOfDays * 24)) * 100;
  const isTravelHeavy = travelTimePercentage > 20; // If more than 20% of the trip is spent traveling

  // Get travel details for the selected transportation type
  const travelDetails = calculateTravelDetails(
    totalDistance, 
    selectedTransportType || transportRecommendation.recommendedType
  );
  
  useEffect(() => {
    // If transport recommendation is available and callback exists, suggest the transport
    if (transportRecommendation && onSuggestTransport && !selectedTransportType) {
      onSuggestTransport(transportRecommendation.recommendedType);
    }
  }, [transportRecommendation, onSuggestTransport, selectedTransportType]);

  const TransportIcon = selectedTransportType === 'bus' 
    ? Bus 
    : selectedTransportType === 'train' 
      ? Train 
      : selectedTransportType === 'flight' 
        ? Plane 
        : Car;

  return (
    <Card className="border-dashed border-gray-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium mb-1">Trip Distance Analysis</h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>Total distance: {Math.round(totalDistance)} km</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Travel time: ~{Math.round(totalTravelTime)} hours</span>
            </div>
            {destinationIds.length > 1 && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Hotel className="h-3.5 w-3.5 mr-1" />
                <span>Hotels needed: {destinationIds.length} different locations</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            {transportRecommendation.recommendedType && (
              <div className="mb-2">
                <Label className="text-sm font-normal text-gray-500">Recommended:</Label>
                <div className="flex items-center justify-end">
                  {selectedTransportType ? (
                    <Badge className="capitalize">
                      <TransportIcon className="h-3 w-3 mr-1" />
                      {selectedTransportType}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      {transportRecommendation.recommendedType === 'bus' && <Bus className="h-3 w-3 mr-1" />}
                      {transportRecommendation.recommendedType === 'train' && <Train className="h-3 w-3 mr-1" />}
                      {transportRecommendation.recommendedType === 'flight' && <Plane className="h-3 w-3 mr-1" />}
                      {transportRecommendation.recommendedType === 'car' && <Car className="h-3 w-3 mr-1" />}
                      {transportRecommendation.recommendedType}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {onSuggestTransport && transportRecommendation.recommendedType && !selectedTransportType && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onSuggestTransport(transportRecommendation.recommendedType)}
              >
                Select {transportRecommendation.recommendedType}
              </Button>
            )}
          </div>
        </div>
        
        {currentUser?.isPremium && transportRecommendation.premiumAdvantages && (
          <div className="mt-3">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
              Premium Insights
            </Badge>
            <ul className="mt-1 text-sm text-gray-600 space-y-1">
              {transportRecommendation.premiumAdvantages.map((advantage, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isTravelHeavy && (
          <Alert className="mt-3 bg-amber-50">
            <Info className="h-4 w-4" />
            <AlertTitle>Travel-Heavy Trip</AlertTitle>
            <AlertDescription>
              {Math.round(travelTimePercentage)}% of your trip may be spent traveling.
              Consider {numberOfDays < 5 ? 'adding more days' : 'reducing destinations'}.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2 mt-2">
          <Button 
            variant="link" 
            className="h-auto p-0 text-sm" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide details' : 'Show travel details'}
          </Button>
          
          {itinerary.length > 0 && (
            <Button 
              variant="link" 
              className="h-auto p-0 text-sm" 
              onClick={() => setShowItinerary(!showItinerary)}
            >
              {showItinerary ? 'Hide itinerary' : 'Show day-by-day plan'}
            </Button>
          )}
        </div>
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t">
            <h4 className="text-sm font-medium mb-2">Distance Between Destinations</h4>
            {distanceMatrix.length === 0 ? (
              <p className="text-sm text-gray-500">No destinations selected.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {distanceMatrix.map((distance, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {distance.fromName} → {distance.toName}
                    </span>
                    <span className="font-medium">
                      {Math.round(distance.distanceKm)} km
                      <span className="text-gray-500 ml-2">
                        (~{Math.round(distance.travelTimesByTransport[transportRecommendation.recommendedType])}h)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selectedTransportType && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Transport Details</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div className="flex justify-between mb-2">
                    <span>Average Speed:</span>
                    <span className="font-medium">{travelDetails.speed} km/h</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Cost per km:</span>
                    <span className="font-medium">₹{travelDetails.costPerKm}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Best for:</span>
                    <span className="font-medium">{travelDetails.bestFor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overnight option:</span>
                    <span className="font-medium">{travelDetails.overnightOption ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showItinerary && itinerary.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <h4 className="text-sm font-medium mb-2">Day-by-Day Plan with Hotels</h4>
            <div className="space-y-3 text-sm">
              {itinerary.map((day) => {
                const formattedDate = format(day.date, 'MMM d');
                return (
                  <div key={day.day} className="border-l-2 pl-3 py-1 border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      <span className="font-medium">Day {day.day} - {formattedDate}</span>
                      {day.isTransitDay && (
                        <Badge variant="outline" className="ml-2 text-xs">Transit Day</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-gray-600 pl-6">
                      <div className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{day.destinationName}</span>
                      </div>
                      {day.activities.map((activity, i) => (
                        <div key={i} className="flex items-start mt-1">
                          <span className="mr-1">•</span>
                          <span className="text-xs">{activity}</span>
                        </div>
                      ))}
                      {!day.isTransitDay && (
                        <div className="flex items-center mt-1 text-xs">
                          <Hotel className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>Stay at hotel in {day.destinationName}</span>
                        </div>
                      )}
                      {day.isTransitDay && selectedTransportType && (
                        <div className="flex items-center mt-1 text-xs">
                          <TransportIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>
                            {selectedTransportType === 'train' ? 'Travel by train' : 
                             selectedTransportType === 'flight' ? 'Travel by flight' :
                             selectedTransportType === 'bus' ? 'Travel by bus' : 
                             'Travel by car'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {isTravelHeavy && (
              <div className="mt-3">
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertTitle className="text-red-700">Transport Scheduling Alert</AlertTitle>
                  <AlertDescription className="text-xs">
                    <strong>Note:</strong> This itinerary has significant travel time. 
                    {selectedTransportType === 'train' && ' Consider overnight trains to save daylight hours.'}
                    {selectedTransportType === 'bus' && ' Consider overnight buses to save daylight hours.'}
                    {selectedTransportType === 'car' && ' Consider breaking the journey with overnight stays midway.'}
                    {selectedTransportType === 'flight' && ' Consider early morning or evening flights to maximize time at destinations.'}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="mt-4 bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Hotel & Transport Key Notes</h4>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Each destination requires a separate hotel booking.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Standard hotel check-in is at 2PM, check-out at 12PM.</span>
                </li>
                {selectedTransportType === 'train' || selectedTransportType === 'bus' ? (
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Overnight {selectedTransportType} options available for long routes.</span>
                  </li>
                ) : null}
                {itinerary.some(day => day.isTransitDay) && (
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Late arrivals (after 10PM) may require special hotel arrangements.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripDistanceCalculator;
