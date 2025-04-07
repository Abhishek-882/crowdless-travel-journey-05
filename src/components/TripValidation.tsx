
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock, CalendarDays, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
          <div className="mb-3 mt-2 text-sm bg-white/70 p-2 rounded">
            <h4 className="font-medium mb-1">Trip breakdown</h4>
            <div className="space-y-1">
              {breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{item.destinationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{item.daysNeeded} day{item.daysNeeded > 1 ? 's' : ''}</span>
                    {item.travelDaysToNext > 0 && (
                      <span className="text-xs">+ {item.travelDaysToNext} day{item.travelDaysToNext > 1 ? 's' : ''} travel</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {totalDistance && totalTravelHours && transportType && (
              <div className="mt-2 text-xs">
                <div>Total distance: {Math.round(totalDistance)} km</div>
                <div>Travel time: {Math.round(totalTravelHours * 10) / 10} hours by {transportType}</div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            onClick={onAdjustDays} 
            variant="default"
          >
            Adjust Trip Length
          </Button>
          <Button 
            size="sm" 
            onClick={onContinue} 
            variant="outline"
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
