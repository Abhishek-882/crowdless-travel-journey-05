
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, MapPin, Clock, Car, Bus, Plane, Train } from 'lucide-react';
import { useTripPlanning } from '../context/TripPlanningContext';
import { useAuth } from '../context/AuthContext';

interface TripDistanceCalculatorProps {
  destinationIds: string[];
  numberOfDays: number;
  selectedTransportType?: 'bus' | 'train' | 'flight' | 'car';
  onSuggestTransport?: (transportType: 'bus' | 'train' | 'flight' | 'car') => void;
}

const TripDistanceCalculator: React.FC<TripDistanceCalculatorProps> = ({ 
  destinationIds, 
  numberOfDays,
  selectedTransportType,
  onSuggestTransport 
}) => {
  const { getDistanceMatrix, getSuggestedTransport } = useTripPlanning();
  const { currentUser } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  
  // Get distances between all destinations
  const distanceMatrix = getDistanceMatrix(destinationIds);
  
  // Get suggested transport options based on destinations and trip duration
  const transportRecommendation = getSuggestedTransport(
    destinationIds, 
    numberOfDays, 
    currentUser?.isPremium
  );

  const totalTravelTime = transportRecommendation.totalTravelTimeHours;
  const totalDistance = transportRecommendation.totalDistanceKm;
  
  // Calculate the percentage of the trip dedicated to travel
  const travelTimePercentage = (totalTravelTime / (numberOfDays * 24)) * 100;
  const isTravelHeavy = travelTimePercentage > 20; // If more than 20% of the trip is spent traveling
  
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
        
        <Button 
          variant="link" 
          className="mt-2 h-auto p-0 text-sm" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide details' : 'Show travel details'}
        </Button>
        
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripDistanceCalculator;
