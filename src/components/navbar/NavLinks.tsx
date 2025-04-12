
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';

interface NavLinksProps {
  isPremium?: boolean;
  isMobileView?: boolean;
  onItemClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ 
  isPremium = false, 
  isMobileView = false,
  onItemClick = () => {} 
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClasses = (path: string) => {
    if (isMobileView) {
      return `px-2 py-2 rounded-md ${
        isActive(path) ? 'bg-primary/10 text-primary' : 'text-gray-700'
      }`;
    }
    return `font-medium space-x-4 ${
      isActive(path) ? 'text-primary' : 'text-gray-700 hover:text-primary'
    }`;
  };

  return (
    <div className="flex items-center space-x-6"> {/* Added space-x-6 to create gaps */}
      <Link
        to="/"
        className={linkClasses('/')}
        onClick={onItemClick}
      >
        Home
      </Link>
      <Link
        to="/destinations"
        className={linkClasses('/destinations')}
        onClick={onItemClick}
      >
        Destinations
      </Link>
      <Link
        to="/trip-planner"
        className={linkClasses('/trip-planner')}
        onClick={onItemClick}
      >
        Plan Trip
      </Link>
      <Link
        to="/about"
        className={linkClasses('/about')}
        onClick={onItemClick}
      >
        About
      </Link>
      {!isPremium && (
        <Link
          to="/premium"
          className={isMobileView 
            ? "px-2 py-2 rounded-md text-primary flex items-center" 
            : "font-medium text-primary flex items-center"}
          onClick={onItemClick}
        >
          <Star className="h-4 w-4 mr-1" />
          Premium
        </Link>
      )}
    </div>
  );
};

export default NavLinks;
