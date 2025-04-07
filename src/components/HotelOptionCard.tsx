
import React from 'react';
import { Star, Coffee, Wifi, Briefcase } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { HotelType } from '../types';

interface HotelOptionCardProps {
  type: 'budget' | 'standard' | 'luxury';
  hotels: HotelType[];
  totalCost: number;
  perPersonCost: number;
  numberOfDays: number;
  numberOfPeople: number;
  selected: boolean;
  onSelect: () => void;
}

const HotelOptionCard: React.FC<HotelOptionCardProps> = ({
  type,
  hotels,
  totalCost,
  perPersonCost,
  numberOfDays,
  numberOfPeople,
  selected,
  onSelect
}) => {
  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wifi')) return <Wifi className="h-3 w-3" />;
    if (amenity.toLowerCase().includes('breakfast') || amenity.toLowerCase().includes('coffee')) 
      return <Coffee className="h-3 w-3" />;
    if (amenity.toLowerCase().includes('business')) return <Briefcase className="h-3 w-3" />;
    return null;
  };
  
  const getRandomAmenities = (hotelType: string) => {
    const amenities = {
      budget: ['WiFi', 'AC', 'TV'],
      standard: ['Free WiFi', 'Breakfast', 'Gym', 'Pool'],
      luxury: ['Gourmet Meals', 'Spa', 'Premium WiFi', 'Concierge', 'Rooftop Bar']
    };
    
    return amenities[hotelType as keyof typeof amenities] || [];
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
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className={`font-semibold capitalize ${selected ? 'text-primary' : 'text-slate-800'}`}>
            {type} Hotels
            {type === 'budget' && ' (Affordable)'}
            {type === 'standard' && ' (Comfortable)'}
            {type === 'luxury' && ' (Premium)'}
          </h3>
          
          <div className="flex items-center">
            {Array(type === 'budget' ? 3 : type === 'standard' ? 4 : 5)
              .fill(0)
              .map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              ))
            }
            {Array(5 - (type === 'budget' ? 3 : type === 'standard' ? 4 : 5))
              .fill(0)
              .map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-gray-200" />
              ))
            }
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-1">
            {getRandomAmenities(type).map((amenity, i) => (
              <div key={i} className="flex items-center text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                {getAmenityIcon(amenity)}
                <span className="ml-1">{amenity}</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            {type === 'budget' && 'Basic accommodations with essential amenities at affordable prices.'}
            {type === 'standard' && 'Comfortable rooms with additional conveniences for a pleasant stay.'}
            {type === 'luxury' && 'Premium accommodations with exceptional service and exclusive amenities.'}
          </p>
          
          {hotels.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Example: {hotels[0].name} {hotels.length > 1 ? `+ ${hotels.length - 1} more` : ''}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className={`font-semibold ${selected ? 'text-primary' : ''}`}>
            {formatPrice(totalCost)}
          </div>
          <div className="text-xs text-gray-500">
            {formatPrice(perPersonCost)} per person
          </div>
          <div className="text-xs text-gray-500">
            For {numberOfDays} night{numberOfDays !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            ({numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'})
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

export default HotelOptionCard;
