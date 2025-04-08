
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock, CalendarDays, MapPin, Info, Check, ArrowRight, Timer, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { calculateTravelDetails } from '../utils/travelCalculator';

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
  transportType = 'car',
  totalDistance,
  totalTravelHours,
  onAdjustDays, 
  onContinue,
  isPremium
}) => {
  const navigate = useNavigate();
  
  // Get travel details based on transport type
  const travelDetails = transportType ? calculateTravelDetails(totalDistance || 0, transportType) : null;

  // Calculate percentage of trip spent traveling
  const travelPercentage = daysNeeded && totalTravelHours 
    ? Math.round((totalTravelHours / (daysNeeded * 24)) * 100) 
    : 0;

  // Calculate accommodations needed
  const uniqueDestinations = breakdown ? 
    [...new Set(breakdown.map(item => item.destinationName))].length : 0;

  if (feasible) {
    return (
      <Alert className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <Check className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-700 text-lg font-medium">Trip plan looks great!</AlertTitle>
        <AlertDescription className="text-green-600">
          <div className="mt-2">
            <p>Your destinations can be comfortably visited within your selected timeframe using {transportType} transport.</p>
            
            {totalDistance && totalTravelHours && (
              <div className="mt-4 p-3 bg-white/70 rounded-md border border-green-100">
                <div className="text-sm font-medium text-green-800 mb-2">Trip Distance Analysis</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5 text-green-600" />
                    <span>Total distance:</span>
                  </div>
                  <div className="font-medium text-green-800">
                    {Math.round(totalDistance)} km
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 text-green-600" />
                    <span>Travel time:</span>
                  </div>
                  <div className="font-medium text-green-800">
                    ~{Math.round(totalTravelHours)} hours
                  </div>
                  
                  {uniqueDestinations > 0 && (
                    <>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1.5 text-green-600" />
                        <span>Hotels needed:</span>
                      </div>
                      <div className="font-medium text-green-800">
                        {uniqueDestinations} different locations
                      </div>
                    </>
                  )}
                  
                  {travelPercentage > 0 && (
                    <>
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 mr-1.5 text-green-600" />
                        <span>Travel percentage:</span>
                      </div>
                      <div className="font-medium text-green-800">
                        {travelPercentage}% of your trip
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />
                    <span>Recommended:</span>
                  </div>
                  <div className="font-medium text-green-800 capitalize">
                    {transportType}
                  </div>
                </div>
                
                {breakdown && breakdown.length > 1 && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-xs text-green-700">
                      <button 
                        className="flex items-center font-medium hover:text-green-800 transition-colors"
                        onClick={() => document.getElementById('distanceDetails')?.classList.toggle('hidden')}
                      >
                        <span>Distance Between Destinations</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </button>
                      <span>Hide details</span>
                    </div>
                    
                    <div id="distanceDetails" className="mt-2 space-y-2 text-xs">
                      {breakdown.map((item, index) => {
                        if (index < breakdown.length - 1) {
                          const nextItem = breakdown[index + 1];
                          if (item.destinationName !== nextItem.destinationName) {
                            return (
                              <div key={index} className="p-2 bg-green-50 rounded-sm flex justify-between">
                                <div className="flex items-center">
                                  <span>{item.destinationName} → {nextItem.destinationName}</span>
                                </div>
                                <div className="text-green-800">
                                  {Math.round(item.travelHoursToNext * travelDetails?.speed || 60)} km
                                  <span className="text-green-600 ml-1">
                                    (~{Math.round(item.travelHoursToNext)}h)
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
                
                {travelDetails && (
                  <div className="mt-4 border-t border-green-100 pt-3">
                    <div className="text-sm font-medium text-green-800 mb-2">Transport Details</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-green-700">
                      <div>Average Speed:</div>
                      <div className="font-medium text-green-800">{travelDetails.speed} km/h</div>
                      
                      <div>Cost per km:</div>
                      <div className="font-medium text-green-800">₹{travelDetails.costPerKm}</div>
                      
                      <div>Best for:</div>
                      <div className="font-medium text-green-800">{travelDetails.bestFor}</div>
                      
                      <div>Overnight option:</div>
                      <div className="font-medium text-green-800">
                        {travelDetails.overnightOption ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isPremium && (
              <div className="mt-3 p-2 bg-purple-50 border border-purple-100 rounded text-purple-700 text-sm">
                <span className="font-medium">Premium benefits:</span> Optimized routing and crowd avoidance will save you up to 15% in travel time.
              </div>
            )}
          </div>
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
                  
                  // Get transport-specific styling
                  const getTransportColor = () => {
                    switch(transportType) {
                      case 'bus': return 'text-blue-700 bg-blue-50 border-blue-200';
                      case 'train': return 'text-purple-700 bg-purple-50 border-purple-200';
                      case 'flight': return 'text-sky-700 bg-sky-50 border-sky-200';
                      case 'car': return 'text-green-700 bg-green-50 border-green-200';
                      default: return 'text-amber-700 bg-amber-50 border-amber-200';
                    }
                  };
                  
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
                        <div className="flex items-center justify-center my-2 text-xs">
                          <div className="flex flex-col items-center">
                            <ArrowRight className="h-4 w-4 mb-1" />
                            <div className={`flex gap-1 items-center px-2 py-1 rounded ${getTransportColor()}`}>
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(item.travelHoursToNext * 10) / 10}h by {transportType}</span>
                            </div>
                            {item.travelDaysToNext > 0 && (
                              <Badge 
                                variant="outline" 
                                className={`mt-1 text-[10px] ${getTransportColor()}`}
                              >
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
              
              {totalDistance && totalTravelHours && transportType && travelDetails && (
                <div className="mt-4">
                  <div className="p-3 bg-amber-50/80 rounded-md border border-amber-100 text-amber-800 text-sm mb-3">
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
                  
                  {/* Transport-specific insights */}
                  <div className={`p-3 rounded-md text-sm grid grid-cols-2 gap-2 
                    ${transportType === 'bus' ? 'bg-blue-50/80 border border-blue-100 text-blue-800' : 
                     transportType === 'train' ? 'bg-purple-50/80 border border-purple-100 text-purple-800' : 
                     transportType === 'flight' ? 'bg-sky-50/80 border border-sky-100 text-sky-800' : 
                     'bg-green-50/80 border border-green-100 text-green-800'}`}>
                    <div className="col-span-2 font-medium mb-1">Transport Details</div>
                    <div>Average Speed:</div>
                    <div className="font-medium text-right">{travelDetails.speed} km/h</div>
                    <div>Cost per km:</div>
                    <div className="font-medium text-right">₹{travelDetails.costPerKm}</div>
                    <div>Overnight option:</div>
                    <div className="font-medium text-right">{travelDetails.overnightOption ? "Available" : "Unavailable"}</div>
                    <Separator className="col-span-2 my-1" />
                    <div className="col-span-2">
                      <span className="font-medium">Best for:</span> {travelDetails.bestFor}
                    </div>
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
