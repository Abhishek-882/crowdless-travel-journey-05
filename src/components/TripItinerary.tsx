
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
  AlertCircle,
  Hotel,
  Sunrise,
  Sunset,
  Utensils,
  Camera,
  Moon
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
          transitDayNeeded: 300, // km threshold for needing a transit day
          morningDeparture: '6:00 AM',
          afternoonDeparture: '2:00 PM',
          eveningDeparture: '9:00 PM',
          breakStops: ['Short rest stops every 2-3 hours', 'Meal stop after 4-5 hours']
        };
      case 'train':
        return {
          speed: '60-80 km/h',
          travelTip: 'Book sleeper class for overnight journeys',
          transitAlert: 'Check for direct trains to avoid multiple connections',
          transitDayNeeded: 400,
          morningDeparture: '7:30 AM',
          afternoonDeparture: '1:30 PM',
          eveningDeparture: '8:00 PM',
          breakStops: ['Food vendors available on train', 'Major stations have 5-10 minute stops']
        };
      case 'flight':
        return {
          speed: '500-800 km/h',
          travelTip: 'Allow 2-3 hours for airport procedures',
          transitAlert: 'Consider flight timing to maximize destination time',
          transitDayNeeded: 1500,
          morningDeparture: '9:00 AM',
          afternoonDeparture: '2:30 PM',
          eveningDeparture: '7:00 PM',
          breakStops: ['Airport arrival 2 hours before departure', 'Security and boarding procedures']
        };
      case 'car':
        return {
          speed: '50-60 km/h',
          travelTip: 'Plan for regular breaks every 2-3 hours',
          transitAlert: 'Long drives may require overnight stops',
          transitDayNeeded: 250,
          morningDeparture: '7:00 AM',
          afternoonDeparture: '12:00 PM',
          eveningDeparture: '4:00 PM',
          breakStops: ['Rest stops every 2 hours', 'Meal breaks', 'Scenic viewpoints']
        };
      default:
        return {
          speed: '50-60 km/h',
          travelTip: 'Plan your journey in advance',
          transitAlert: 'Long travel may be tiring',
          transitDayNeeded: 300,
          morningDeparture: '8:00 AM',
          afternoonDeparture: '1:00 PM',
          eveningDeparture: '6:00 PM',
          breakStops: ['Regular breaks recommended']
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
    const lowerActivity = activity.toLowerCase();
    
    if (lowerActivity.includes('explore') || lowerActivity.includes('visit')) {
      return <Landmark className="h-4 w-4 mr-2 text-indigo-500" />;
    } else if (lowerActivity.includes('beach') || lowerActivity.includes('ocean')) {
      return <Palmtree className="h-4 w-4 mr-2 text-emerald-500" />;
    } else if (lowerActivity.includes('relax') || lowerActivity.includes('rest')) {
      return <Coffee className="h-4 w-4 mr-2 text-amber-500" />;
    } else if (lowerActivity.includes('travel') || lowerActivity.includes('journey')) {
      return getTransportIcon();
    } else if (lowerActivity.includes('check-in') || lowerActivity.includes('hotel')) {
      return <Hotel className="h-4 w-4 mr-2 text-slate-500" />;
    } else if (lowerActivity.includes('sunrise') || lowerActivity.includes('morning')) {
      return <Sunrise className="h-4 w-4 mr-2 text-amber-500" />;
    } else if (lowerActivity.includes('sunset') || lowerActivity.includes('evening')) {
      return <Sunset className="h-4 w-4 mr-2 text-orange-500" />;
    } else if (lowerActivity.includes('dinner') || lowerActivity.includes('lunch') || lowerActivity.includes('breakfast')) {
      return <Utensils className="h-4 w-4 mr-2 text-red-500" />;
    } else if (lowerActivity.includes('night') || lowerActivity.includes('evening')) {
      return <Moon className="h-4 w-4 mr-2 text-indigo-400" />;
    } else if (lowerActivity.includes('photo') || lowerActivity.includes('view')) {
      return <Camera className="h-4 w-4 mr-2 text-blue-500" />;
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

  // Generate more detailed activities for each day
  const enrichItinerary = (originalItinerary: TripItineraryDay[]): TripItineraryDay[] => {
    return originalItinerary.map(day => {
      const isFirstDayAtDestination = originalItinerary.findIndex(d => 
        d.destinationName === day.destinationName) === originalItinerary.indexOf(day);
      
      const isLastDayAtDestination = originalItinerary.findLastIndex(d => 
        d.destinationName === day.destinationName) === originalItinerary.indexOf(day);
      
      const isTransitDayToNext = day.isTransitDay;
      
      let enrichedActivities: string[] = [];
      
      if (isTransitDayToNext) {
        const nextDay = originalItinerary[originalItinerary.indexOf(day) + 1];
        const prevDay = originalItinerary[originalItinerary.indexOf(day) - 1];
        const fromDestination = prevDay?.destinationName || 'your starting point';
        const toDestination = nextDay?.destinationName || day.destinationName;
        
        // Early morning departure
        if (day.activities && day.activities.length > 0) {
          enrichedActivities = [day.activities[0]]; // Keep the original travel description
          
          // Add more transit details
          enrichedActivities.push(`${transportInsights.morningDeparture} - Depart from ${fromDestination}`);
          
          // Add transportation-specific details  
          if (transportType === 'car') {
            enrichedActivities.push('Stops at scenic viewpoints along the route');
          } else if (transportType === 'train') {
            enrichedActivities.push('Enjoy the passing landscapes through the train window');
          } else if (transportType === 'bus') {
            enrichedActivities.push('Rest stops at major towns along the route');
          } else if (transportType === 'flight') {
            enrichedActivities.push('Airport procedures and security checks');
            enrichedActivities.push('Flight to ' + toDestination);
          }
          
          enrichedActivities.push(`Evening - Arrive at ${toDestination}`);
          enrichedActivities.push('Check-in to accommodation and rest');
        }
      } else {
        if (isFirstDayAtDestination) {
          // First day at a new destination
          enrichedActivities = [
            `Morning - Begin exploring ${day.destinationName}`,
            `Afternoon - Visit major attractions`,
            `Evening - Explore local cuisine`,
          ];
        } else if (isLastDayAtDestination) {
          // Last day at this destination
          enrichedActivities = [
            `Morning - Visit remaining must-see spots in ${day.destinationName}`,
            `Afternoon - Shopping for souvenirs`,
            `Evening - Final dinner in ${day.destinationName}`,
          ];
        } else {
          // Middle day at a destination
          enrichedActivities = [
            `Morning - Sunrise views and early exploration`,
            `Afternoon - Off-the-beaten-path experiences`,
            `Evening - Enjoy local entertainment`,
          ];
        }
        
        // Add specific activities based on destination type
        if (day.destinationName.toLowerCase().includes('beach') || 
            day.destinationName.toLowerCase().includes('goa')) {
          enrichedActivities = [
            'Morning - Beach walk and breakfast by the sea',
            'Afternoon - Water activities and sunbathing',
            'Evening - Sunset views and seafood dinner',
          ];
        } else if (day.destinationName.toLowerCase().includes('temple') || 
                   day.destinationName.toLowerCase().includes('amritsar')) {
          enrichedActivities = [
            'Morning - Visit the Golden Temple during peaceful hours',
            'Afternoon - Explore the surrounding historic sites',
            'Evening - Attend the evening ceremony',
          ];
        } else if (day.destinationName.toLowerCase().includes('palace') || 
                   day.destinationName.toLowerCase().includes('jaipur')) {
          enrichedActivities = [
            'Morning - Visit the City Palace and nearby attractions',
            'Afternoon - Explore local markets and handicraft shops',
            'Evening - Light and sound show at a historic venue',
          ];
        } else if (day.destinationName.toLowerCase().includes('taj') || 
                   day.destinationName.toLowerCase().includes('agra')) {
          enrichedActivities = [
            'Early morning - Taj Mahal at sunrise (best lighting)',
            'Afternoon - Agra Fort and other historical sites',
            'Evening - Mehtab Bagh gardens for sunset views of Taj Mahal',
          ];
        }
      }
      
      return {
        ...day,
        activities: enrichedActivities
      };
    });
  };

  // Enrich the itinerary with more detailed activities
  const detailedItinerary = enrichItinerary(itinerary);

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
        {detailedItinerary.map((day, index) => {
          const isLastDestinationInTrip = index === detailedItinerary.length - 1;
          const nextDay = !isLastDestinationInTrip ? detailedItinerary[index + 1] : null;
          const showDistanceToNext = !isLastDestinationInTrip && nextDay && 
            day.destinationName !== nextDay.destinationName;
          
          // Determine if this is a new destination
          const isNewDestination = index === 0 || 
            day.destinationName !== detailedItinerary[index - 1].destinationName;
            
          // Determine if this is first/last day at destination
          const isFirstDayAtDestination = detailedItinerary.findIndex(d => 
            d.destinationName === day.destinationName) === index;
          const isLastDayAtDestination = detailedItinerary.findLastIndex(d => 
            d.destinationName === day.destinationName) === index;

          // Determine time spent at this destination
          const daysAtThisDestination = detailedItinerary.filter(d => 
            d.destinationName === day.destinationName && !d.isTransitDay).length;

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
                        {day.isTransitDay && (
                          <Badge variant="outline" className="ml-2 border-blue-200 bg-blue-50 text-blue-700">
                            Travel Day
                          </Badge>
                        )}
                        {!day.isTransitDay && isFirstDayAtDestination && daysAtThisDestination > 1 && (
                          <Badge variant="outline" className="ml-2 border-green-200 bg-green-50 text-green-700">
                            Arrival Day
                          </Badge>
                        )}
                        {!day.isTransitDay && isLastDayAtDestination && daysAtThisDestination > 1 && !isFirstDayAtDestination && (
                          <Badge variant="outline" className="ml-2 border-amber-200 bg-amber-50 text-amber-700">
                            Departure Day
                          </Badge>
                        )}
                      </h4>
                      
                      <div className="flex items-center text-sm text-slate-500">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                        {format(new Date(day.date), 'E, MMM d, yyyy')}
                      </div>
                      
                      {day.isTransitDay ? (
                        <div className="mt-2">
                          <Badge variant="secondary" className="mb-3 border border-blue-200 bg-blue-100/60 text-blue-700">
                            Transit Day via {transportType}
                          </Badge>
                          
                          <ul className="mt-2 text-sm space-y-2.5">
                            {day.activities && day.activities.map((activity, i) => (
                              <li key={i} className="flex items-start bg-slate-50/80 p-2 rounded-sm">
                                {i === 0 ? getTransportIcon() : getActivityIcon(activity)}
                                <span className="text-slate-700">{activity}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-3 p-2 bg-blue-50/50 rounded-sm border border-blue-100 text-sm">
                            <div className="font-medium text-blue-700 mb-1">{transportType} Details:</div>
                            <ul className="space-y-1 text-xs text-blue-700">
                              {transportInsights.breakStops.map((stop, i) => (
                                <li key={i} className="flex items-center">
                                  <span className="bg-blue-100 rounded-full w-1.5 h-1.5 mr-1.5"></span>
                                  {stop}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
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
                          <div className="flex items-center gap-1 text-xs text-slate-500 w-full">
                            <div className="flex items-center">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              <span>Next: {nextDay?.destinationName}</span>
                            </div>
                            
                            <div className="ml-auto flex items-center gap-1.5">
                              {getTransportIcon()}
                              <span className="text-slate-600 font-medium">
                                {transportType === 'flight' ? '2-3h flight' : 
                                transportType === 'train' ? '~8h by train' : 
                                transportType === 'bus' ? '~10h by bus' : '~9h drive'}
                              </span>
                            </div>
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
