
import React from 'react';
import { Bus, Train, Plane, Car } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { TransportType } from '../types';

interface TransportOptionCardProps {
  type: 'bus' | 'train' | 'flight' | 'car';
  transport: TransportType;
  cost: number;
  selected: boolean;
  onSelect: () => void;
  isRecommended?: boolean;
}

const TransportOptionCard: React.FC<TransportOptionCardProps> = ({
  type,
  transport,
  cost,
  selected,
  onSelect,
  isRecommended
}) => {
  const getIcon = () => {
    switch(type) {
      case 'bus': return <Bus className={`h-6 w-6 ${selected ? 'text-primary' : 'text-gray-500'}`} />;
      case 'train': return <Train className={`h-6 w-6 ${selected ? 'text-primary' : 'text-gray-500'}`} />;
      case 'flight': return <Plane className={`h-6 w-6 ${selected ? 'text-primary' : 'text-gray-500'}`} />;
      case 'car': return <Car className={`h-6 w-6 ${selected ? 'text-primary' : 'text-gray-500'}`} />;
      default: return <Car className={`h-6 w-6 ${selected ? 'text-primary' : 'text-gray-500'}`} />;
    }
  };

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'hover:bg-gray-50 border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${
            selected ? 'bg-primary/20' : 'bg-gray-100'
          }`}>
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className={`font-semibold capitalize ${selected ? 'text-primary' : ''}`}>{type}</h3>
              {isRecommended && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {transport.amenities.slice(0, 3).join(', ')}
              {transport.amenities.length > 3 ? '...' : ''}
            </p>
            
            <div className="mt-1 flex flex-wrap gap-1">
              {type === 'flight' && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  Fastest
                </span>
              )}
              {type === 'train' && (
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                  Comfortable
                </span>
              )}
              {type === 'car' && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  Flexible
                </span>
              )}
              {type === 'bus' && (
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  Economical
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-semibold ${selected ? 'text-primary' : ''}`}>{formatPrice(cost)}</div>
          <div className="text-sm text-gray-500">
            Travel time: ~{Math.round(transport.travelTime)} hours
          </div>
          
          {selected && (
            <div className="mt-2">
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                Selected
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportOptionCard;
