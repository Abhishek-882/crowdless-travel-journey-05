import React from 'react';
import { Bus, Train, Plane, Car, Clock } from 'lucide-react';
import { TransportType } from '../types';
import { formatPrice } from '../utils/helpers';

interface ExtendedTransportType extends TransportType {
  busClass?: string;
  seatType?: string;
  class?: string;
  berthOption?: string;
  cabinClass?: string;
  baggageAllowance?: string;
  carType?: string;
  transmission?: string;
  operator?: string;
  airline?: string;
  rentalCompany?: string;
  estimatedDuration?: string;
}

interface TransportAmenities {
  wifi: boolean;
  chargingPorts: boolean;
  meals: boolean;
  entertainment: boolean;
  ac: boolean;
}

interface TransportOptionCardProps {
  transport: ExtendedTransportType;
  selected: boolean;
  onSelect: () => void;
  cost: number;
  isRecommended?: boolean;
}

const TransportOptionCard: React.FC<TransportOptionCardProps> = ({
  transport,
  selected,
  onSelect,
  cost,
  isRecommended
}) => {
  const renderTransportIcon = () => {
    const iconClass = `h-5 w-5 ${selected ? 'text-primary' : 'text-gray-500'}`;
    switch (transport.type) {
      case 'bus': return <Bus className={iconClass} />;
      case 'train': return <Train className={iconClass} />;
      case 'flight': return <Plane className={iconClass} />;
      case 'car': return <Car className={iconClass} />;
      default: return <Car className={iconClass} />;
    }
  };

  const renderTransportDetails = () => {
    switch (transport.type) {
      case 'bus':
        return (
          <>
            {transport.busClass && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                {transport.busClass}
              </span>
            )}
            {transport.seatType && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                {transport.seatType}
              </span>
            )}
          </>
        );
      case 'train':
        return (
          <>
            {transport.class && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                {transport.class}
              </span>
            )}
            {transport.berthOption && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                {transport.berthOption}
              </span>
            )}
          </>
        );
      case 'flight':
        return (
          <>
            {transport.cabinClass && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">
                {transport.cabinClass}
              </span>
            )}
            {transport.baggageAllowance && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                {transport.baggageAllowance}
              </span>
            )}
          </>
        );
      case 'car':
        return (
          <>
            {transport.carType && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize">
                {transport.carType}
              </span>
            )}
            {transport.transmission && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize">
                {transport.transmission}
              </span>
            )}
          </>
        );
      default:
        return null;
    }
  };

  // Simplified amenities rendering from string array
  const renderAmenityIcons = () => {
    return transport.amenities.map((amenity, index) => (
      <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
        {amenity}
      </span>
    ));
  };

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${selected ? 'bg-primary/10' : 'bg-gray-100'}`}>
            {renderTransportIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${selected ? 'text-primary' : ''}`}>
                {transport.name || `${transport.type.charAt(0).toUpperCase() + transport.type.slice(1)} Transport`}
              </h3>
              {isRecommended && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <div className="flex gap-1 mt-2">
              {renderTransportDetails()}
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {renderAmenityIcons()}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-medium ${selected ? 'text-primary' : ''}`}>
            {formatPrice(cost)}
          </div>
          <div className="flex items-center justify-end text-sm text-gray-500 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{transport.estimatedDuration || `${transport.travelTime}h`}</span>
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
