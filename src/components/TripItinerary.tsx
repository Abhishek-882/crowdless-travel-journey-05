
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bus, Train, Plane, Car, ArrowRight, Info, MapPin, Hotel, Clock, AlertTriangle, Coffee } from 'lucide-react';
import { TripItineraryDay } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { findLastIndex } from '../utils/arrayUtils';

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

  const travelDetails = calculateTravelDetails(transportType);

  // Toggle day details expansion
  const toggleDayExpansion = (day: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Check if we have any transit days
  const hasTransitDays = itinerary.some(day => day.isTransitDay);

  // Find the last day for each destination to know when we're leaving
  const getLastDayAtDestination = (destId: string, currentDay: number) => {
    const nextDifferentDestIndex = itinerary.findIndex((day, index) => 
      index > currentDay - 1 && day.destinationId !== destId
    );
    
    return nextDifferentDestIndex !== -1 ? nextDifferentDestIndex : itinerary.length;
  };

  // Generate specialized activities for each destination
  const getSpecializedActivities = (destName: string, day: number, isLastDay: boolean) => {
    const activities = [];
    const destLower = destName.toLowerCase();
    
    // Morning activities
    if (destLower.includes('beach')) {
      activities.push(day === 1 ? '8:00 AM: Sunrise beach walk' : '9:00 AM: Beach yoga session');
    } else if (destLower.includes('palace') || destLower.includes('fort')) {
      activities.push(day === 1 ? '9:00 AM: Palace guided tour' : '8:30 AM: Photography at the royal courtyards');
    } else if (destLower.includes('temple')) {
      activities.push(day === 1 ? '7:00 AM: Morning prayer ceremony' : '8:00 AM: Meditation session');
    } else {
      activities.push(day === 1 ? '8:30 AM: Start exploring the city' : '9:00 AM: Visit local markets');
    }
    
    // Afternoon activities
    if (destLower.includes('beach')) {
      activities.push('1:00 PM: Beach volleyball & water sports');
    } else if (destLower.includes('palace') || destLower.includes('fort')) {
      activities.push('2:00 PM: Royal museum tour');
    } else if (destLower.includes('temple')) {
      activities.push('1:30 PM: Visit nearby shrines');
    } else {
      activities.push('1:00 PM: Lunch at local restaurant');
    }
    
    // Evening activities
    if (isLastDay) {
      activities.push('6:00 PM: Pack and prepare for tomorrow\'s departure');
    } else {
      if (destLower.includes('beach')) {
        activities.push('6:00 PM: Sunset beach dinner');
      } else if (destLower.includes('palace') || destLower.includes('fort')) {
        activities.push('7:00 PM: Light & sound show');
      } else if (destLower.includes('temple')) {
        activities.push('6:30 PM: Evening aarti ceremony');
      } else {
        activities.push('7:00 PM: Explore nightlife');
      }
    }
    
    return activities;
  };

  // Get the next destination for transition information
  const getNextDestination = (currentIndex: number) => {
    for (let i = currentIndex + 1; i < itinerary.length; i++) {
      if (itinerary[i].destinationId !== itinerary[currentIndex].destinationId) {
        return itinerary[i];
      }
    }
    return null;
  };

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No itinerary available for this trip.</p>
      </div>
    );
  }

  // Calculate destination clusters (consecutive days at the same place)
  const getDestinationClusters = () => {
    const clusters: {destinationId: string, startDay: number, endDay: number}[] = [];
    let currentCluster = {
      destinationId: itinerary[0].destinationId,
      startDay: itinerary[0].day,
      endDay: itinerary[0].day
    };
    
    for (let i = 1; i < itinerary.length; i++) {
      const day = itinerary[i];
      if (day.destinationId === currentCluster.destinationId && !day.isTransitDay) {
        currentCluster.endDay = day.day;
      } else {
        clusters.push({...currentCluster});
        currentCluster = {
          destinationId: day.destinationId,
          startDay: day.day,
          endDay: day.day
        };
      }
    }
    
    clusters.push({...currentCluster});
    return clusters;
  };

  const destinationClusters = getDestinationClusters();

  // Find the base hotel (location where you spend the most days)
  const findBaseHotel = () => {
    if (destinationClusters.length <= 1) return null;
    
    let maxDays = 0;
    let baseDestId = '';
    
    destinationClusters.forEach(cluster => {
      const daysCount = cluster.endDay - cluster.startDay + 1;
      if (daysCount > maxDays) {
        maxDays = daysCount;
        baseDestId = cluster.destinationId;
      }
    });
    
    if (maxDays <= 1) return null;
    
    const baseDest = itinerary.find(day => day.destinationId === baseDestId);
    return baseDest ? baseDest.destinationName : null;
  };

  const baseHotel = findBaseHotel();

  // Create a map of destination IDs to the last day at that destination
  const lastDaysByDestination: Record<string, number> = {};
  itinerary.forEach((day, index) => {
    const nextDifferentDestIndex = findLastIndex(itinerary, (d, i) => 
      i >= index && d.destinationId === day.destinationId
    );
    
    if (nextDifferentDestIndex !== -1) {
      lastDaysByDestination[day.destinationId] = itinerary[nextDifferentDestIndex].day;
    }
  });

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
                  <span className="text-gray-500">Overnight option:</span>
                  <span>{travelDetails.overnight.includes('available') ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            
            {hasTransitDays && (
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-xs uppercase text-gray-500 font-semibold">Travel Tips</h4>
                <ul className="mt-1 text-xs space-y-1 text-gray-600">
                  {transportType === 'train' && (
                    <>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Book window seats for scenic views</li>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Carry snacks and water</li>
                    </>
                  )}
                  {transportType === 'flight' && (
                    <>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Check in online 24h before flight</li>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Arrive at airport 2h before departure</li>
                    </>
                  )}
                  {transportType === 'bus' && (
                    <>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Choose seats in the middle for stability</li>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Pack motion sickness medicine</li>
                    </>
                  )}
                  {transportType === 'car' && (
                    <>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Check for tolls on your route</li>
                      <li className="flex items-center gap-1"><Info className="h-3 w-3 text-blue-500" /> Download offline maps before leaving</li>
                    </>
                  )}
                </ul>
              </div>
            )}
            
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
          const isLastDayAtDestination = lastDaysByDestination[day.destinationId] === day.day;
          const nextDest = getNextDestination(index);
          const specializedActivities = getSpecializedActivities(
            day.destinationName, 
            day.day, 
            isLastDayAtDestination
          );
          
          // Transit details
          const transitDetails = day.isTransitDay ? {
            from: itinerary[index - 1]?.destinationName || 'Previous location',
            to: day.destinationName,
            departureTime: day.departureTime || '8:00 AM',
            arrivalTime: day.arrivalTime || '4:00 PM',
            restStops: day.freshUpStops || [
              { time: '10:30 AM', location: 'Coffee break' },
              { time: '1:00 PM', location: 'Lunch stop' }
            ]
          } : null;
          
          return (
            <Card 
              key={day.day} 
              className={`overflow-hidden ${day.isTransitDay ? 'border-blue-200 bg-blue-50' : ''}`}
            >
              <CardContent className="p-0">
                {/* Day Header */}
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer ${day.isTransitDay ? 'bg-blue-100/50' : 'bg-gray-50'}`}
                  onClick={() => toggleDayExpansion(day.day)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Day {day.day}: {day.destinationName}</h3>
                      {day.isTransitDay && <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Transit</Badge>}
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
                                  {transitDetails?.from} to {transitDetails?.to}
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
                                <span className="font-medium">{transitDetails?.departureTime}:</span> Depart from {transitDetails?.from}
                              </p>
                            </div>
                            
                            {transitDetails?.restStops.map((stop, i) => (
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
                                <span className="font-medium">{transitDetails?.arrivalTime}:</span> Arrive at {transitDetails?.to}
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
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Daily Itinerary:</h4>
                        <ul className="space-y-2 text-sm">
                          {isPremium ? (
                            // Premium users get detailed hourly schedule
                            specializedActivities.map((activity, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-gray-500 min-w-[80px]">{activity.split(':')[0]}:</span>
                                <span>{activity.split(':').slice(1).join(':').trim()}</span>
                              </li>
                            ))
                          ) : (
                            // Free users get basic activities
                            day.activities.map((activity, i) => (
                              <li key={i} className="flex items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-2"></span>
                                <span>{activity}</span>
                              </li>
                            ))
                          )}
                        </ul>
                        
                        {isLastDayAtDestination && nextDest && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mt-3">
                            <p className="text-sm font-medium text-blue-800">Next Destination</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Tomorrow you'll be heading to {nextDest.destinationName}. 
                              {isPremium ? ` Prepare for a ${calculateTravelDetails(transportType).speed.includes('500') ? 'quick' : 'scenic'} journey!` : ''}
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
