
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock, CalendarDays, MapPin, Info, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Alert className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <Check className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-700 text-lg font-medium">Trip plan looks great!</AlertTitle>
        <AlertDescription className="text-green-600">
          Your destinations can be comfortably visited within your selected timeframe using {transportType} transport.
          {isPremium && " As a premium member, you'll get optimized routing and crowd avoidance."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-1" />
          <div>
            <CardTitle className="text-amber-700 text-lg">Trip Needs Adjustments</CardTitle>
            <p className="text-amber-600 mt-1">
              Your selected destinations require at least <strong>{daysNeeded}</strong> days to visit by {transportType}
              {daysShort && daysShort > 0 && <span> ({daysShort} more {daysShort === 1 ? 'day' : 'days'} needed)</span>}.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {breakdown && breakdown.length > 0 && (
          <Card className="mb-4 mt-2 border-amber-100 bg-white/90 shadow-sm">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm font-medium text-amber-800 flex items-center">
                <Info className="h-4 w-4 mr-1.5" /> Destination Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3 px-3">
              <div className="space-y-2">
                {breakdown.map((item, index) => {
                  const isLastItem = index === breakdown.length - 1;
                  return (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between bg-amber-50/70 p-2.5 rounded-md border border-amber-100">
                        <div className="flex items-center gap-1.5">
                          <div className="bg-amber-100 rounded-full h-6 w-6 flex items-center justify-center text-amber-700 text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium text-amber-900">{item.destinationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">
                            {item.daysNeeded} day{item.daysNeeded > 1 ? 's' : ''} visit
                          </Badge>
                        </div>
                      </div>
                      
                      {!isLastItem && item.travelHoursToNext > 0 && (
                        <div className="flex items-center justify-center my-2 text-xs text-amber-600">
                          <div className="flex flex-col items-center">
                            <ArrowRight className="h-4 w-4 mb-1" />
                            <div className="flex gap-1 items-center">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(item.travelHoursToNext * 10) / 10}h travel ({transportType})</span>
                            </div>
                            {item.travelDaysToNext > 0 && (
                              <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                {item.travelDaysToNext} day{item.travelDaysToNext > 1 ? 's' : ''} travel
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {totalDistance && totalTravelHours && transportType && (
                <div className="mt-4 p-3 bg-amber-50/80 rounded-md border border-amber-100 text-amber-800 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Total distance:</span>
                    </span> 
                    <span className="font-medium">{Math.round(totalDistance)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Travel time:</span>
                    </span> 
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
              className="border-amber-500 text-amber-700 hover:bg-amber-100 ml-auto"
            >
              Get Premium for Smart Routing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripValidation;
