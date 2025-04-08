
import React from 'react';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  MapPin, 
  Clock, 
  Car, 
  Bus, 
  Train, 
  Plane, 
  AlertTriangle, 
  ArrowRight,
  Sun,
  Palmtree,
  Landmark,
  Coffee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TripItineraryDay } from '../types';
import { calculateTravelDetails } from '../utils/travelCalculator';

interface TripItineraryProps {
  itinerary: TripItineraryDay[];
  transportType: 'bus' | 'train' | 'flight' | 'car';
  isPremium?: boolean;
}

const TripItinerary: React.FC<TripItineraryProps> = ({ 
  itinerary, 
  transportType,
  isPremium
}) => {
  if (!itinerary || !itinerary.length) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Itinerary will be generated once you've selected destinations and dates.</div>
      </div>
    );
  }

  // Check for potential travel issues
  const hasLongDistanceTravel = itinerary.some(day => 
    day.isTransitDay && day.activities && 
    day.activities.some(activity => activity.includes('km') && parseInt(activity.match(/\d+/)?.[0] || '0', 10) > 500)
  );
  
  // Get transport details
  const transportDetails = calculateTravelDetails(0, transportType);

  // Get activity icon based on activity description
  const getActivityIcon = (activity: string) => {
    if (activity.toLowerCase().includes('explore')) {
      return <Landmark className="h-4 w-4 mr-2 text-indigo-500" />;
    } else if (activity.toLowerCase().includes('beach') || activity.toLowerCase().includes('ocean')) {
      return <Palmtree className="h-4 w-4 mr-2 text-emerald-500" />;
    } else if (activity.toLowerCase().includes('relax') || activity.toLowerCase().includes('rest')) {
      return <Coffee className="h-4 w-4 mr-2 text-amber-500" />;
    } else if (activity.toLowerCase().includes('travel')) {
      return getTransportIcon();
    } else {
      return <Sun className="h-4 w-4 mr-2 text-amber-500" />;
    }
  };

  const getTransportIcon = () => {
    switch(transportType) {
      case 'bus': return <Bus className="h-4 w-4 mr-2 text-blue-500" />;
      case 'train': return <Train className="h-4 w-4 mr-2 text-purple-500" />;
      case 'flight': return <Plane className="h-4 w-4 mr-2 text-sky-500" />;
      case 'car': return <Car className="h-4 w-4 mr-2 text-green-500" />;
      default: return <Car className="h-4 w-4 mr-2 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-800">Your Journey Overview</CardTitle>
            <Badge variant="outline" className="bg-white border-slate-200">
              {itinerary.length} days
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 bg-slate-50 p-3 rounded-md">
            <div className="flex items-center">
              {getTransportIcon()}
              <span className="font-medium capitalize">{transportType} travel</span>
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium">{transportDetails.bestFor}</span>
            </div>
          </div>
          
          {hasLongDistanceTravel && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Travel Alert:</p>
                <p>Your plan includes long-distance travel segments that may be tiring. Consider adding rest days or adjusting transport type.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="relative pl-8 before:absolute before:left-3.5 before:top-0 before:h-full before:w-0.5 before:bg-slate-200">
        {itinerary.map((day, index) => {
          const isLastDestinationInTrip = index === itinerary.length - 1;
          const nextDay = !isLastDestinationInTrip ? itinerary[index + 1] : null;
          const showDistanceToNext = !isLastDestinationInTrip && nextDay && 
            day.destinationName !== nextDay.destinationName;

          return (
            <div key={index} className="mb-6 relative">
              <div className={`absolute -left-8 rounded-full w-6 h-6 flex items-center justify-center z-10 
                ${day.isTransitDay 
                  ? 'bg-blue-100 border border-blue-300 text-blue-700' 
                  : 'bg-white border border-slate-200 text-slate-700'}`}>
                <span className="text-xs font-medium">{day.day}</span>
              </div>
              
              <Card className={`
                transition-all duration-300 hover:shadow-md 
                ${day.isTransitDay 
                  ? 'border-blue-100 bg-gradient-to-r from-blue-50/90 to-blue-50/20' 
                  : 'border-slate-100 hover:border-slate-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-grow">
                      <h4 className="font-medium text-slate-800 flex items-center">
                        {day.isTransitDay ? getTransportIcon() : <MapPin className="h-4 w-4 mr-2 text-red-500" />}
                        {day.destinationName}
                      </h4>
                      
                      <div className="flex items-center text-sm text-slate-500">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                        {format(new Date(day.date), 'E, MMM d, yyyy')}
                      </div>
                      
                      {day.isTransitDay ? (
                        <Badge variant="secondary" className="mt-1 border border-blue-200 bg-blue-100/60 text-blue-700">
                          Transit Day
                        </Badge>
                      ) : (
                        <ul className="mt-2 text-sm space-y-2.5">
                          {day.activities && day.activities.map((activity, i) => (
                            <li key={i} className="flex items-start bg-slate-50/80 p-2 rounded-sm">
                              {getActivityIcon(activity)}
                              <span className="text-slate-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {showDistanceToNext && (
                        <div className="flex items-center mt-3 pt-2 border-t border-dashed border-slate-200">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <ArrowRight className="h-3 w-3" />
                            <span>Next: {nextDay?.destinationName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isPremium && !day.isTransitDay && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-md p-3 ml-2 text-xs min-w-[150px]">
                        <div className="font-medium mb-2 flex items-center text-purple-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Premium Insights
                        </div>
                        <div className="space-y-1.5 text-indigo-700">
                          <div className="flex gap-1.5 items-center">
                            <span className="bg-indigo-100 p-1 rounded-full w-4 h-4 flex items-center justify-center">•</span>
                            <span>Best time: 9-10 AM</span>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <span className="bg-indigo-100 p-1 rounded-full w-4 h-4 flex items-center justify-center">•</span>
                            <span>Avg visit: 3-4 hours</span>
                          </div>
                          {isPremium && (
                            <div className="flex gap-1.5 items-center">
                              <span className="bg-indigo-100 p-1 rounded-full w-4 h-4 flex items-center justify-center">•</span>
                              <span>Crowd level: Low</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripItinerary;
