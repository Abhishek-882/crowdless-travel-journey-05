
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
import { getTransportAmenities } from '../utils/tripPlanningUtils';
import { calculateTravelDetails } from '../utils/travelCalculator';

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
  
  // Calculate travel details based on the transport type
  const getTravelDetails = (type: string) => {
    // Use updated calculateTravelDetails function with transport types
    const details = calculateTravelDetails(100, type as 'bus' | 'train' | 'flight' | 'car');
    
    switch(type) {
      case 'bus':
        return {
          advantages: ['Economical', 'Multiple stops', 'No parking needed'],
          overnight: 'Sleeper available for long routes',
          icon: <Bus className="h-5 w-5" />,
          transportTypes: details.transportTypes
        };
      case 'train':
        return {
          advantages: ['Comfortable', 'Scenic views', 'No traffic'],
          overnight: 'Sleeper/AC options available',
          icon: <Train className="h-5 w-5" />,
          transportTypes: details.transportTypes
        };
      case 'flight':
        return {
          advantages: ['Fastest option', 'Best for long distances', 'Time-saving'],
          overnight: 'Red-eye flights available',
          icon: <Plane className="h-5 w-5" />,
          transportTypes: details.transportTypes
        };
      case 'car':
        return {
          advantages: ['Flexible schedule', 'Door-to-door convenience', 'Privacy'],
          overnight: 'Not recommended, find hotels',
          icon: <Car className="h-5 w-5" />,
          transportTypes: details.transportTypes
        };
      default:
        return {
          advantages: ['Flexible schedule', 'Door-to-door convenience', 'Privacy'],
          overnight: 'Not recommended, find hotels',
          icon: <Car className="h-5 w-5" />,
          transportTypes: ['Standard']
        };
    }
  };

  // Render hotel information
  const renderHotelInfo = (hotelData: any) => {
    // If it's already a string or undefined/null, just return a placeholder
    if (typeof hotelData === 'string' || !hotelData) {
      return (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Hotel info unavailable</p>
            </div>
          </div>
        </div>
      );
    }
    
    // If it's a hotel object, render its details
    const hotel = hotelData as HotelType;
    return (
      <div className="border rounded-lg p-3 bg-gray-50">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">{hotel.name}</p>
            {hotel.location && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{hotel.location.distanceFromCenter.toFixed(1)} km from center</span>
              </div>
            )}
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
  const travelDetails = getTravelDetails(transportType);

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
                  <span className="text-gray-500">Best for:</span>
                  <span>{travelDetails.advantages[0]}</span>
                  <span className="text-gray-500">Types:</span>
                  <span>{travelDetails.transportTypes.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <h4 className="text-xs uppercase text-gray-500 font-semibold">Transport Types</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {travelDetails.transportTypes.map((type, i) => (
                  <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {type}
                  </span>
                ))}
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
                                  {day.transportDetails?.fromDestination || ''} → {day.destinationName}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Badge variant="outline" className="bg-blue-50">
                                {day.transportDetails?.distance ? `${day.transportDetails.distance} km` : ''}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="ml-4 pl-7 border-l-2 border-dashed border-blue-200 space-y-3">
                            <div className="relative">
                              <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                <MapPin className="h-3 w-3 text-green-600" />
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Departure:</span> {day.transportDetails?.departureTime || '09:00 AM'}
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
                                <span className="font-medium">Arrival:</span> {day.transportDetails?.arrivalTime || '05:00 PM'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-2">Transport Types</h4>
                          <div className="flex flex-wrap gap-2">
                            {travelDetails.transportTypes.map((type, i) => (
                              <div key={i} className="border rounded-md p-2 text-sm flex-1 min-w-[120px] bg-white">
                                <p className="font-medium">{type}</p>
                              </div>
                            ))}
                          </div>
                        </div>
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
