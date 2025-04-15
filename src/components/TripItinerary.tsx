import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Bus, 
  Train, 
  Plane, 
  Car, 
  ArrowRight, 
  Info, 
  MapPin, 
  Hotel, 
  Clock, 
  AlertTriangle, 
  Coffee,
  Wifi,
  Utensils,
  Droplet,
  Tv,
  Plug,
  Star,
  Sun,
  Moon,
  Cloud,
  Umbrella
} from 'lucide-react';
import { TripItineraryDay, HotelType } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTripPlanning } from '../context/TripPlanningContext';

interface TripItineraryProps {
  itinerary: TripItineraryDay[];
  transportType: 'bus' | 'train' | 'flight' | 'car';
  isPremium?: boolean;
}

const TripItinerary: React.FC<TripItineraryProps> = ({ 
  itinerary, 
  transportType = 'car',
  isPremium = false
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const { getTransportAmenities } = useTripPlanning();

  // Calculate travel details based on the transport type
  const calculateTravelDetails = (type: string) => {
    switch(type) {
      case 'bus':
        return {
          speed: '50 km/h',
          cost: '₹1.5/km',
          advantages: ['Economical', 'Multiple stops', 'No parking needed'],
          overnight: 'Sleeper available for long routes',
          icon: <Bus className="h-5 w-5" />
        };
      case 'train':
        return {
          speed: '80 km/h',
          cost: '₹2/km',
          advantages: ['Comfortable', 'Scenic views', 'No traffic'],
          overnight: 'Sleeper/AC options available',
          icon: <Train className="h-5 w-5" />
        };
      case 'flight':
        return {
          speed: '500 km/h',
          cost: '₹8/km',
          advantages: ['Fastest option', 'Best for long distances', 'Time-saving'],
          overnight: 'Red-eye flights available',
          icon: <Plane className="h-5 w-5" />
        };
      case 'car':
        return {
          speed: '60 km/h',
          cost: '₹3/km',
          advantages: ['Flexible schedule', 'Door-to-door convenience', 'Privacy'],
          overnight: 'Not recommended, find hotels',
          icon: <Car className="h-5 w-5" />
        };
      default:
        return {
          speed: '60 km/h',
          cost: '₹3/km',
          advantages: ['Flexible schedule', 'Door-to-door convenience', 'Privacy'],
          overnight: 'Not recommended, find hotels',
          icon: <Car className="h-5 w-5" />
        };
    }
  };

  // Generate premium insights for each day
  const generateDailyPremiumInsights = (destinationName: string, day: number) => {
    const hash = destinationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + day;
    const crowdPercent = 20 + (hash % 60);
    const bestTime = `${8 + (hash % 4)}:${hash % 2 === 0 ? '00' : '30'} AM`;
    
    const secretTips = [
      `Ask for the ${destinationName.split(' ')[0]} special at local cafes`,
      `The ${['north', 'south', 'east', 'west'][hash % 4]} entrance has shorter lines`,
      `Free ${['guided tour', 'wifi', 'map', 'snack'][hash % 4]} available near main gate`,
      `Best photo spot: ${['sunrise', 'sunset', 'golden hour', 'blue hour'][hash % 4]} at ${['main gate', 'east side', 'west garden', 'viewpoint'][hash % 4]}`,
      `${['Local guide', 'Hotel concierge', 'Tourist info', 'Park ranger'][hash % 4]} knows hidden gems`
    ];
    
    return {
      bestTime: `Best visit time: ${bestTime} (${crowdPercent}% crowd)`,
      secretTip: secretTips[hash % secretTips.length],
      crowdPrediction: Array.from({ length: 4 }).map((_, i) => ({
        time: `${9 + i * 3}:00 ${i < 2 ? 'AM' : 'PM'}`,
        level: ['low', 'medium', 'high', 'peak'][(hash + i) % 4] as 'low' | 'medium' | 'high',
        percentage: 20 + (hash + i * 10) % 60
      }))
    };
  };

  // Render hotel information
  const renderHotelInfo = (hotel: HotelType) => (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{hotel.name}</p>
          <div className="flex items-center mt-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{hotel.location.distanceFromCenter.toFixed(1)} km from center</span>
          </div>
          <div className="flex items-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < hotel.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            ₹{hotel.pricePerPerson}/person
          </div>
          {hotel.checkInTime && (
            <div className="text-xs text-gray-500 mt-1">
              {hotel.checkInTime} - {hotel.checkOutTime}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {hotel.amenities.slice(0, 4).map((amenity, i) => (
          <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {amenity}
          </span>
        ))}
      </div>
    </div>
  );

  // Render crowd level indicator
  const renderCrowdLevel = (level: string, percentage: number) => {
    let color = 'text-green-600';
    let icon = <Sun className="h-4 w-4" />;
    
    if (percentage > 60) {
      color = 'text-red-600';
      icon = <Umbrella className="h-4 w-4" />;
    } else if (percentage > 30) {
      color = 'text-amber-600';
      icon = <Cloud className="h-4 w-4" />;
    }
    
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{level} ({percentage}%)</span>
      </span>
    );
  };

  // Check if we have any transit days
  const hasTransitDays = itinerary.some(day => day.isTransitDay);

  // Find the base hotel (location where you spend the most days)
  const findBaseHotel = () => {
    const daysByDestination: Record<string, number> = {};
    
    itinerary.forEach(day => {
      if (!day.isTransitDay) {
        daysByDestination[day.destinationId] = (daysByDestination[day.destinationId] || 0) + 1;
      }
    });
    
    const maxDays = Math.max(...Object.values(daysByDestination));
    if (maxDays <= 1) return null;
    
    const baseDestId = Object.keys(daysByDestination).find(
      id => daysByDestination[id] === maxDays
    );
    
    return itinerary.find(day => day.destinationId === baseDestId)?.destinationName;
  };

  const baseHotel = findBaseHotel();
  const travelDetails = calculateTravelDetails(transportType);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No itinerary available for this trip.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip Overview Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Trip Overview</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{itinerary.length} days</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm">
              {new Set(itinerary.map(day => day.destinationId)).size} destinations
            </span>
          </div>
          <div className="flex items-center gap-1">
            {travelDetails.icon}
            <span className="text-sm capitalize">{transportType} travel</span>
          </div>
          
          {baseHotel && (
            <div className="flex items-center gap-1">
              <Hotel className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Base: {baseHotel}</span>
            </div>
          )}
        </div>

        {/* Transport Details */}
        <div className="mt-4 pt-3 border-t border-blue-100">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <h4 className="text-xs uppercase text-gray-500 font-semibold">Transport Details</h4>
              <div className="mt-1 flex items-center gap-2">
                {travelDetails.icon}
                <span className="text-sm capitalize font-medium">{transportType}</span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                <div className="grid grid-cols-[80px_1fr] gap-1 text-xs">
                  <span className="text-gray-500">Average Speed:</span>
                  <span>{travelDetails.speed}</span>
                  <span className="text-gray-500">Cost per km:</span>
                  <span>{travelDetails.cost}</span>
                  <span className="text-gray-500">Best for:</span>
                  <span>{travelDetails.advantages[0]}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <h4 className="text-xs uppercase text-gray-500 font-semibold">Amenities</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {getTransportAmenities(transportType, hasTransitDays).map((amenity, i) => (
                  <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            
            {isPremium && (
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-xs uppercase text-gray-500 font-semibold">Premium Insights</h4>
                <ul className="mt-1 text-xs space-y-1 text-gray-600">
                  <li className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" /> 
                    Best time to travel: Off-peak hours
                  </li>
                  <li className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" /> 
                    Crowd prediction: Moderate
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itinerary Days */}
      <div className="space-y-4">
        {itinerary.map((day, index) => {
          const isLastDayAtDestination = itinerary.slice(index + 1).every(
            d => d.destinationId !== day.destinationId
          );
          
          const nextDest = itinerary.find(
            (d, i) => i > index && d.destinationId !== day.destinationId
          );
          
          const premiumInsights = isPremium ? generateDailyPremiumInsights(day.destinationName, day.day) : null;
          
          return (
            <Card 
              key={day.day} 
              className={`overflow-hidden ${day.isTransitDay ? 'border-blue-200 bg-blue-50' : ''}`}
            >
              <CardContent className="p-0">
                {/* Day Header */}
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer ${day.isTransitDay ? 'bg-blue-100/50' : 'bg-gray-50'}`}
                  onClick={() => setExpandedDays(prev => ({
                    ...prev,
                    [day.day]: !prev[day.day]
                  }))}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Day {day.day}: {day.destinationName}</h3>
                      {day.isTransitDay && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                          Transit
                        </Badge>
                      )}
                      {isLastDayAtDestination && nextDest && !day.isTransitDay && (
                        <div className="flex items-center text-xs text-gray-500">
                          <ArrowRight className="h-3 w-3 mx-1" />
                          <span>Next: {nextDest.destinationName}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(day.date), 'PPP')}
                    </p>
                  </div>
                  <div>
                    {expandedDays[day.day] ? (
                      <span className="text-xs rounded-full bg-gray-200 px-2 py-1">Hide Details</span>
                    ) : (
                      <span className="text-xs rounded-full bg-gray-200 px-2 py-1">Show Details</span>
                    )}
                  </div>
                </div>
                
                {/* Day Details (Expanded) */}
                {expandedDays[day.day] && (
                  <div className="p-4 border-t">
                    {day.isTransitDay ? (
                      <div className="space-y-3">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                {travelDetails.icon}
                              </div>
                              <div>
                                <p className="font-medium">Transit Journey</p>
                                <p className="text-sm text-gray-500">
                                  {day.destinationName}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50">
                              ~{day.transportDetails?.duration || '8 hours'}
                            </Badge>
                          </div>
                          
                          <div className="ml-4 pl-7 border-l-2 border-dashed border-blue-200 space-y-3">
                            <div className="relative">
                              <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                <MapPin className="h-3 w-3 text-green-600" />
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Departure:</span> {day.departureTime}
                              </p>
                            </div>
                            
                            {day.freshUpStops?.map((stop, i) => (
                              <div key={i} className="relative">
                                <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                                  <Coffee className="h-3 w-3 text-amber-600" />
                                </div>
                                <p className="text-sm">
                                  <span className="font-medium">{stop.time}:</span> {stop.location}
                                </p>
                              </div>
                            ))}
                            
                            <div className="relative">
                              <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                                <MapPin className="h-3 w-3 text-red-600" />
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Arrival:</span> {day.arrivalTime}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {isPremium && (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-3">
                            <p className="text-sm font-medium text-amber-800">Premium Travel Advice</p>
                            <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc pl-4">
                              <li>Recommended rest stops marked with local attractions</li>
                              <li>Best photo opportunities along the route</li>
                              <li>Traffic prediction: Light traffic expected</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Daily Itinerary</h4>
                          <ul className="space-y-3">
                            {day.detailedSchedule?.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[60px]">{item.time}</span>
                                <div>
                                  <p>{item.activity}</p>
                                  {item.notes && (
                                    <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {day.hotels && day.hotels.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Recommended Hotel</h4>
                            {renderHotelInfo(day.hotels[0])}
                          </div>
                        )}
                        
                        {isPremium && premiumInsights && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                              Premium Insights for {day.destinationName}
                            </h4>
                            <p className="text-xs text-blue-700 mb-2">{premiumInsights.secretTip}</p>
                            
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-blue-700">Crowd Prediction:</p>
                              {premiumInsights.crowdPrediction.map((pred, i) => (
                                <div key={i} className="flex justify-between text-xs text-blue-600">
                                  <span>{pred.time}</span>
                                  {renderCrowdLevel(pred.level, pred.percentage)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {isLastDayAtDestination && nextDest && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mt-3">
                            <p className="text-sm font-medium text-blue-800">Next Destination</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Tomorrow you'll be heading to {nextDest.destinationName}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TripItinerary;
