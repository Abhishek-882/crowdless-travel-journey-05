
import React from 'react';
import { useTripPlanning } from '../context/TripPlanningContext';
import { useAuth } from '../context/AuthContext';
import { useDestinations } from '../context/DestinationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Info, MapPin, Clock, AlertTriangle } from 'lucide-react';

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
  const { currentUser } = useAuth();
  const { getDistanceMatrix, getSuggestedTransport } = useTripPlanning();
  const { destinations } = useDestinations();
  const isPremium = currentUser?.isPremium || false;
  
  // Skip processing if fewer than 2 destinations
  if (destinationIds.length < 2) {
    return (
      <Alert variant="default" className="mt-4">
        <Info className="h-4 w-4" />
        <AlertTitle>No distances to calculate</AlertTitle>
        <AlertDescription>
          Select at least two destinations to see distance information.
        </AlertDescription>
      </Alert>
    );
  }
  
  const distanceMatrix = getDistanceMatrix(destinationIds);
  const transportSuggestion = getSuggestedTransport(destinationIds, numberOfDays, isPremium);
  
  // Only show unique destination pairs (avoid showing both A->B and B->A)
  const uniquePairs = distanceMatrix.filter((item, index, self) => {
    return index === self.findIndex(t => 
      (t.fromId === item.fromId && t.toId === item.toId) || 
      (t.fromId === item.toId && t.toId === item.fromId)
    );
  });
  
  const handleSelectTransport = (type: 'bus' | 'train' | 'flight' | 'car') => {
    if (onSuggestTransport) {
      onSuggestTransport(type);
    }
  };
  
  const formatTime = (hours: number) => {
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);
    
    if (fullHours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${fullHours}h`;
    } else {
      return `${fullHours}h ${minutes}m`;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Distance Analysis</span>
            {isPremium && <Badge variant="premium">Premium Features</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Destination Distance Matrix */}
          <div>
            <h3 className="text-lg font-medium mb-2">Distances Between Destinations</h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Distance</TableHead>
                    {selectedTransportType ? (
                      <TableHead>Travel Time ({selectedTransportType})</TableHead>
                    ) : (
                      <TableHead>Travel Times</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniquePairs.map((pair, index) => (
                    <TableRow key={index}>
                      <TableCell className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span>
                          {pair.fromName} → {pair.toName}
                        </span>
                      </TableCell>
                      <TableCell>{Math.round(pair.distanceKm)} km</TableCell>
                      {selectedTransportType ? (
                        <TableCell className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatTime(pair.travelTimesByTransport[selectedTransportType])}
                        </TableCell>
                      ) : (
                        <TableCell>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>🚌 Bus: {formatTime(pair.travelTimesByTransport.bus)}</div>
                            <div>🚆 Train: {formatTime(pair.travelTimesByTransport.train)}</div>
                            <div>✈️ Flight: {formatTime(pair.travelTimesByTransport.flight)}</div>
                            <div>🚗 Car: {formatTime(pair.travelTimesByTransport.car)}</div>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <Separator />
          
          {/* Transport Recommendation */}
          <div>
            <h3 className="text-lg font-medium mb-2">Transport Recommendation</h3>
            
            {!transportSuggestion.isRealistic && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Time Constraint Alert</AlertTitle>
                <AlertDescription>
                  Your trip may be too ambitious for {numberOfDays} days. 
                  Consider adding more days or removing destinations.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer transition-all ${selectedTransportType === transportSuggestion.recommendedType ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    onClick={() => handleSelectTransport(transportSuggestion.recommendedType)}>
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Recommended Transport</h4>
                    <Badge variant="outline" className="capitalize">{transportSuggestion.recommendedType}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{transportSuggestion.reasoning}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Distance:</span>
                      <span>{Math.round(transportSuggestion.totalDistanceKm)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Travel Time:</span>
                      <span>{formatTime(transportSuggestion.totalTravelTimeHours)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time for Sightseeing:</span>
                      <span>{formatTime(transportSuggestion.timeForSightseeing)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {transportSuggestion.alternativeType && (
                <Card className={`cursor-pointer transition-all ${selectedTransportType === transportSuggestion.alternativeType ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => transportSuggestion.alternativeType && handleSelectTransport(transportSuggestion.alternativeType)}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Alternative Option</h4>
                      <Badge variant="outline" className="capitalize">{transportSuggestion.alternativeType}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Another viable option that may offer different benefits.</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Premium Advantages */}
            {isPremium && transportSuggestion.premiumAdvantages && (
              <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-medium text-purple-700 mb-2">
                  <span className="mr-2">✨</span>
                  Premium Travel Benefits
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-purple-700">
                  {transportSuggestion.premiumAdvantages.map((advantage, index) => (
                    <li key={index}>{advantage}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Premium Upsell */}
            {!isPremium && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-2">
                  <span className="mr-2">⭐</span>
                  Upgrade to Premium
                </h4>
                <p className="text-sm text-blue-700 mb-2">
                  Get access to optimized routes, real-time crowd data, and VIP travel perks.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                  <li>Save up to 15% travel time with optimized routing</li>
                  <li>Get real-time traffic and crowd avoidance suggestions</li>
                  <li>Access premium lounges at transit points</li>
                  <li>Enjoy priority boarding on trains and flights</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripDistanceCalculator;
