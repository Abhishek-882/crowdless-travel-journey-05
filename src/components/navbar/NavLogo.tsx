
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const NavLogo: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="flex items-center">
      <Link to="/" className="text-2xl font-bold text-primary flex items-center">
        TourGuide
        {currentUser?.isPremium && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Premium Active</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Link>
    </div>
  );
};

export default NavLogo;
