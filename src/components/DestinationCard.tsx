
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users } from 'lucide-react';
import { Destination, CrowdLevel } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, getCrowdLevelBgClass, getCrowdLevelClass } from '../utils/helpers';
import { useDestinations } from '../context/DestinationContext';

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  const { getCurrentCrowdLevel, getBestTimeToVisit } = useDestinations();
  const crowdLevel = getCurrentCrowdLevel(destination.crowdData);
  const bestTimeToVisit = getBestTimeToVisit(destination.crowdData);
  
  const crowdLevelText = {
    low: 'Low Crowd',
    medium: 'Moderate Crowd',
    high: 'High Crowd',
  };

  return (
    <Link to={`/destinations/${destination.id}`} className="block">
      <Card className="destination-card h-full">
        <div className="relative overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-48 object-cover"
          />
          <Badge 
            className={`absolute top-3 right-3 ${getCrowdLevelBgClass(crowdLevel)}`}
          >
            <Users className="w-3 h-3 mr-1" />
            {crowdLevelText[crowdLevel]}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{destination.name}</h3>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="ml-1 text-sm">{destination.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-muted-foreground text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{destination.city}, {destination.state}</span>
          </div>
          
          <p className="mt-2 text-sm line-clamp-2 text-muted-foreground">{destination.description}</p>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Best time to visit</p>
              <p className="font-medium">{bestTimeToVisit}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="font-semibold">{formatPrice(destination.price)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default DestinationCard;
