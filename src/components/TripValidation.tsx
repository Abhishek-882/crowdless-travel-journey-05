
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TripValidationProps {
  feasible: boolean;
  daysNeeded?: number;
  daysShort?: number;
  onAdjustDays: () => void;
  onContinue: () => void;
  isPremium?: boolean;
}

const TripValidation: React.FC<TripValidationProps> = ({ 
  feasible, 
  daysNeeded, 
  daysShort, 
  onAdjustDays, 
  onContinue,
  isPremium
}) => {
  const navigate = useNavigate();

  if (feasible) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <Clock className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Trip plan is feasible!</AlertTitle>
        <AlertDescription className="text-green-600">
          Your destinations can be comfortably visited within your selected timeframe.
          {isPremium && " As a premium member, you'll get optimized routing and crowd avoidance."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700">Trip needs more days</AlertTitle>
      <AlertDescription className="text-amber-600">
        <p className="mb-3">
          Your selected destinations require at least <strong>{daysNeeded}</strong> days to visit comfortably 
          ({daysShort && <span>{daysShort} more {daysShort === 1 ? 'day' : 'days'} needed</span>}).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            onClick={onAdjustDays} 
            variant="default"
          >
            Adjust Trip Length
          </Button>
          <Button 
            size="sm" 
            onClick={onContinue} 
            variant="outline"
          >
            Continue Anyway
          </Button>
          {!isPremium && (
            <Button 
              size="sm" 
              onClick={() => navigate('/premium')} 
              variant="outline" 
              className="border-amber-500 text-amber-700 hover:bg-amber-100"
            >
              Get Premium for Smart Routing
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default TripValidation;
