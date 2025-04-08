
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
  Coffee,
  AlertCircle
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

  // Get transport details for the current selection
  const transportDetails = calculateTravelDetails(0, transportType);

  // Calculate transport-specific insights
  const getTransportSpecificInsights = () => {
    switch(transportType) {
      case 'bus':
        return {
          speed: '45-50 km/h',
          travelTip: 'Consider overnight buses for long distances to save daylight hours',
          transitAlert: 'Bus travel can be tiring for journeys over 8 hours',
          transitDayNeeded: 300 // km threshold for needing a transit day
        };
      case 'train':
        return {
          speed: '60-80 km/h',
          travelTip: 'Book sleeper class for overnight journeys',
          transitAlert: 'Check for direct trains to avoid multiple connections',
          transitDayNeeded: 400
        };
      case 'flight':
        return {
          speed: '500-800 km/h',
          travelTip: 'Allow 2-3 hours for airport procedures',
          transitAlert: 'Consider flight timing to maximize destination time',
          transitDayNeeded: 1500
        };
      case 'car':
        return {
          speed: '50-60 km/h',
          travelTip: 'Plan for regular breaks every 2-3 hours',
          transitAlert: 'Long drives may require overnight stops',
          transitDayNeeded: 250
        };
      default:
        return {
          speed: '50-60 km/h',
          travelTip: 'Plan your journey in advance',
          transitAlert: 'Long travel may be tiring',
          transitDayNeeded: 300
        };
    }
  };

  const transportInsights = getTransportSpecificInsights();

  // Check for potential travel issues based on transport type
  const hasLongDistanceTravel = itinerary.some(day => 
    day.isTransitDay && day.activities && 
    day.activities.some(activity => {
      const kmMatch = activity.match(/(\d+)\s*km/);
      if (kmMatch) {
        const distance = parseInt(kmMatch[1], 10);
        return distance > transportInsights.transitDayNeeded;
      }
      return false;
    })
  );

  // Get transport icon based on current selection
  const getTransportIcon = () => {
    switch(transportType) {
      case 'bus': return <Bus className="h-4 w-4 mr-2 text-blue-500" />;
      case 'train': return <Train className="h-4 w-4 mr-2 text-purple-500" />;
      case 'flight': return <Plane className="h-4 w-4 mr-2 text-sky-500" />;
      case 'car': return <Car className="h-4 w-4 mr-2 text-green-500" />;
      default: return <Car className="h-4 w-4 mr-2 text-green-500" />;
    }
  };

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

  // Calculate if there are geographical anomalies in the plan
  const destinationSequence = itinerary
    .filter((day, index, arr) => 
      index === 0 || day.destinationName !== arr[index-1].destinationName
    )
    .map(day => day.destinationName);
  
  const hasGeographicalAnomaly = destinationSequence.length > 2 && hasLongDistanceTravel;

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
          <div className="flex flex-wrap items-center gap-4 mb-4 bg-slate-50 p-3 rounded-md">
            <div className="flex items-center">
              {getTransportIcon()}
              <span className="font-medium capitalize">{transportType} travel</span>
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium">{transportDetails.bestFor}</span>
            </div>
            <div className="w-full mt-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Average speed:</span>
                <span className="font-medium">{transportInsights.speed}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Travel tip:</span>
                <span className="font-medium">{transportInsights.travelTip}</span>
              </div>
            </div>
          </div>
          
          {hasLongDistanceTravel && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Travel Alert:</p>
                <p>{transportInsights.transitAlert}</p>
                {transportType === 'car' && <p className="mt-1">Consider breaking long drives (300+ km) into multiple days.</p>}
                {transportType === 'bus' && <p className="mt-1">Overnight buses are recommended for journeys over 8 hours.</p>}
                {transportType === 'train' && <p className="mt-1">Check for direct trains or comfortable sleeper options.</p>}
                {transportType === 'flight' && <p className="mt-1">Book flights at convenient times to maximize destination time.</p>}
              </div>
            </div>
          )}

          {hasGeographicalAnomaly && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Geographical Anomaly Detected:</p>
                <p>Your trip covers significant distances that may be impractical with {transportType} transport.</p>
                <p className="mt-1">Consider:
                  {transportType !== 'flight' && " Changing to flights for long distances or"}
                  {" adding more transit days between destinations."}
                </p>
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
          
          // Determine if this is a new destination
          const isNewDestination = index === 0 || 
            day.destinationName !== itinerary[index - 1].destinationName;

          return (
            <div key={index} className="mb-6 relative">
              <div className={`absolute -left-8 rounded-full w-6 h-6 flex items-center justify-center z-10 
                ${day.isTransitDay 
                  ? 'bg-blue-100 border border-blue-300 text-blue-700' 
                  : isNewDestination
                    ? 'bg-purple-100 border border-purple-300 text-purple-700'
                    : 'bg-white border border-slate-200 text-slate-700'}`}>
                <span className="text-xs font-medium">{day.day}</span>
              </div>
              
              <Card className={`
                transition-all duration-300 hover:shadow-md 
                ${day.isTransitDay 
                  ? 'border-blue-100 bg-gradient-to-r from-blue-50/90 to-blue-50/20' 
                  : isNewDestination
                    ? 'border-purple-100 bg-gradient-to-r from-purple-50/90 to-purple-50/20'
                    : 'border-slate-100 hover:border-slate-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-grow">
                      <h4 className="font-medium text-slate-800 flex items-center">
                        {day.isTransitDay 
                          ? getTransportIcon() 
                          : <MapPin className="h-4 w-4 mr-2 text-red-500" />}
                        {day.destinationName}
                        {isNewDestination && !day.isTransitDay && (
                          <Badge variant="outline" className="ml-2 border-purple-200 bg-purple-50 text-purple-700">
                            New Destination
                          </Badge>
                        )}
                      </h4>
                      
                      <div className="flex items-center text-sm text-slate-500">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                        {format(new Date(day.date), 'E, MMM d, yyyy')}
                      </div>
                      
                      {day.isTransitDay ? (
                        <Badge variant="secondary" className="mt-1 border border-blue-200 bg-blue-100/60 text-blue-700">
                          Transit Day ({transportType})
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
                            
                            {/* Show transport-specific travel time estimate */}
                            <span className="ml-1 text-slate-400">
                              (Approx. {transportType === 'flight' ? '2-3h' : 
                                        transportType === 'train' ? '16-20h' : 
                                        transportType === 'bus' ? '24-30h' : '20-25h'} by {transportType})
                            </span>
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
      
      {/* Transport-specific recommendations */}
      <Card className="border border-slate-200 shadow-sm bg-slate-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-slate-800">{transportType.charAt(0).toUpperCase() + transportType.slice(1)} Travel Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {transportType === 'car' && (
              <>
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>For long drives, plan for a break every 2-3 hours</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>Check road conditions before traveling during monsoon season</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>Consider overnight stops for journeys over 500km</span>
                </li>
              </>
            )}
            
            {transportType === 'bus' && (
              <>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Book sleeper buses for overnight journeys</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Choose AC buses during summer months</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Carry motion sickness medication for hilly routes</span>
                </li>
              </>
            )}
            
            {transportType === 'train' && (
              <>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Book tickets at least 2 weeks in advance for reserved seating</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Consider AC classes during summer months</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Sleeper class is comfortable for overnight journeys</span>
                </li>
              </>
            )}
            
            {transportType === 'flight' && (
              <>
                <li className="flex gap-2">
                  <span className="text-sky-600">•</span>
                  <span>Arrive at least 2 hours before domestic flights</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-600">•</span>
                  <span>Consider morning flights to avoid weather delays</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-600">•</span>
                  <span>Web check-in opens 24-48 hours before departure</span>
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripItinerary;
