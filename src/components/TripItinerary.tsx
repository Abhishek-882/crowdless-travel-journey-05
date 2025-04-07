
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Clock, Car, Bus, Train, Plane } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TripItineraryDay } from '../types';

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
  if (!itinerary.length) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Itinerary will be generated once you've selected destinations and dates.</div>
      </div>
    );
  }

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
    <div className="space-y-4">
      <div className="mb-3 flex items-center">
        <h3 className="text-lg font-medium">Your Itinerary</h3>
        <Badge variant="outline" className="ml-2 bg-white">
          {itinerary.length} days
        </Badge>
      </div>
      
      <div className="relative pl-8 before:absolute before:left-3.5 before:top-0 before:h-full before:w-0.5 before:bg-slate-200">
        {itinerary.map((day, index) => (
          <div key={index} className="mb-6 relative">
            <div className="absolute -left-8 rounded-full w-6 h-6 bg-white border border-slate-200 flex items-center justify-center z-10">
              <span className="text-xs font-medium">{day.day}</span>
            </div>
            
            <Card className={`shadow-sm ${day.isTransitDay ? 'border-blue-100 bg-blue-50/50' : 'border-slate-100'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800 flex items-center">
                      {day.isTransitDay ? getTransportIcon() : <MapPin className="h-4 w-4 mr-2 text-red-500" />}
                      {day.destinationName}
                    </h4>
                    
                    <div className="flex items-center text-sm text-slate-500">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                      {format(new Date(day.date), 'E, MMM d, yyyy')}
                    </div>
                    
                    {day.isTransitDay ? (
                      <Badge className="mt-1" variant="secondary" className="border border-blue-200 bg-blue-100/60 text-blue-700">
                        Transit Day
                      </Badge>
                    ) : (
                      <ul className="mt-2 text-sm space-y-1.5">
                        {day.activities.map((activity, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-slate-400 mr-2">•</span>
                            <span className="text-slate-700">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {isPremium && !day.isTransitDay && (
                    <div className="bg-purple-50 border border-purple-100 rounded-md p-2 text-xs text-purple-700">
                      <div className="font-medium mb-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Premium Insights
                      </div>
                      <div className="space-y-1">
                        <div>• Best time: 9-10 AM (Low crowd)</div>
                        <div>• Avg visit: 3-4 hours</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripItinerary;
