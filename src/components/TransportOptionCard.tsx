import React from 'react';
import { Bus, Train, Plane, Car, Clock, Wifi, Utensils, Droplet, Tv, Plug } from 'lucide-react';
import { TransportType } from '../types';
import { formatPrice } from '../utils/helpers';

interface TransportOptionCardProps {
  transport: TransportType;
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
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {transport.busClass}
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {transport.seatType}
            </span>
          </>
        );
      case 'train':
        return (
          <>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
              {transport.class}
            </span>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full capitalize">
              {transport.berthOption}
            </span>
          </>
        );
      case 'flight':
        return (
          <>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">
              {transport.cabinClass}
            </span>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
              {transport.baggageAllowance}
            </span>
          </>
        );
      case 'car':
        return (
          <>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize">
              {transport.carType}
            </span>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize">
              {transport.transmission}
            </span>
          </>
        );
      default:
        return null;
    }
  };

  const renderAmenityIcons = () => {
    const amenities = [];
    if (transport.amenities.wifi) amenities.push(<Wifi key="wifi" className="h-4 w-4" />);
    if (transport.amenities.chargingPorts) amenities.push(<Plug key="charging" className="h-4 w-4" />);
    if (transport.amenities.meals) amenities.push(<Utensils key="meals" className="h-4 w-4" />);
    if (transport.amenities.entertainment) amenities.push(<Tv key="entertainment" className="h-4 w-4" />);
    if (transport.amenities.ac) amenities.push(<Droplet key="ac" className="h-4 w-4" />);
    return amenities;
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
                {transport.type === 'bus' ? transport.operator :
                 transport.type === 'train' ? `${transport.operator} Train` :
                 transport.type === 'flight' ? transport.airline :
                 `${transport.rentalCompany} Rental`}
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
            <div className="flex gap-2 mt-2">
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
            <span>{transport.estimatedDuration}</span>
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
