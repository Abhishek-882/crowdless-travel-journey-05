
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock, CalendarDays, MapPin, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TripBreakdownItem {
  destinationId: string;
  destinationName: string;
  daysNeeded: number;
  travelHoursToNext: number;
  travelDaysToNext: number;
}

interface TripValidationProps {
  feasible: boolean;
  daysNeeded?: number;
  daysShort?: number;
  breakdown?: TripBreakdownItem[];
  transportType?: 'bus' | 'train' | 'flight' | 'car';
  totalDistance?: number;
  totalTravelHours?: number;
  onAdjustDays: () => void;
  onContinue: () => void;
  isPremium?: boolean;
}

const TripValidation: React.FC<TripValidationProps> = ({ 
  feasible, 
  daysNeeded, 
  daysShort, 
  breakdown,
  transportType,
  totalDistance,
  totalTravelHours,
  onAdjustDays, 
  onContinue,
  isPremium
}) => {
  const navigate = useNavigate();

  if (feasible) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <Clock className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Trip plan is feasible!</AlertTitle>
        <AlertDescription className="text-green-600">
          Your destinations can be comfortably visited within your selected timeframe.
          {isPremium && " As a premium member, you'll get optimized routing and crowd avoidance."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700">Trip needs more days</AlertTitle>
      <AlertDescription className="text-amber-600">
        <p className="mb-2">
          Your selected destinations require at least <strong>{daysNeeded}</strong> days to visit comfortably 
          ({daysShort && <span>{daysShort} more {daysShort === 1 ? 'day' : 'days'} needed</span>}).
        </p>
        
        {breakdown && breakdown.length > 0 && (
          <Card className="mb-3 mt-2 border-amber-100 bg-white/90 shadow-sm">
            <CardContent className="pt-4 pb-2">
              <h4 className="font-medium mb-2 text-amber-800 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" /> Trip breakdown
              </h4>
              <div className="space-y-1.5">
                {breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-amber-50/50 p-1.5 rounded-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-amber-600" />
                      <span className="font-medium text-amber-900">{item.destinationName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">
                        {item.daysNeeded} day{item.daysNeeded > 1 ? 's' : ''} visit
                      </Badge>
                      {item.travelDaysToNext > 0 && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {item.travelDaysToNext} day{item.travelDaysToNext > 1 ? 's' : ''} travel
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {totalDistance && totalTravelHours && transportType && (
                <div className="mt-3 p-2 text-xs bg-amber-50/60 rounded-sm border border-amber-100 text-amber-800">
                  <div className="flex items-center justify-between mb-1">
                    <span>Total distance:</span> 
                    <span className="font-medium">{Math.round(totalDistance)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Travel time:</span> 
                    <span className="font-medium">{Math.round(totalTravelHours * 10) / 10} hours by {transportType}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            onClick={onAdjustDays} 
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Adjust Trip Length
          </Button>
          <Button 
            size="sm" 
            onClick={onContinue} 
            variant="outline"
            className="border-amber-600 text-amber-700 hover:bg-amber-50"
          >
            Continue Anyway
          </Button>
          {!isPremium && (
            <Button 
              size="sm" 
              onClick={() => navigate('/premium')} 
              variant="outline" 
              className="border-amber-500 text-amber-700 hover:bg-amber-100"
            >
              Get Premium for Smart Routing
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default TripValidation;
