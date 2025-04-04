
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, MapPin, Map, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavUserMenuProps {
  isMobileView?: boolean;
  onItemClick?: () => void;
}

const NavUserMenu: React.FC<NavUserMenuProps> = ({ 
  isMobileView = false,
  onItemClick = () => {}
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    if (onItemClick) onItemClick();
  };

  if (isMobileView) {
    if (currentUser) {
      return (
        <>
          <Link
            to="/trip-planner"
            className="px-2 py-2 rounded-md text-gray-700"
            onClick={onItemClick}
          >
            <Map className="h-4 w-4 inline mr-1" />
            Plan Your Trip
          </Link>
          <Link
            to="/bookings"
            className="px-2 py-2 rounded-md text-gray-700"
            onClick={onItemClick}
          >
            <MapPin className="h-4 w-4 inline mr-1" />
            My Bookings
          </Link>
          <button
            onClick={() => {
              handleLogout();
            }}
            className="px-2 py-2 text-left rounded-md text-gray-700 w-full"
          >
            <LogOut className="h-4 w-4 inline mr-1" />
            Log Out
          </button>
        </>
      );
    }
    
    return (
      <div className="flex flex-col space-y-2 pt-2">
        <Button 
          variant="outline" 
          onClick={() => {
            navigate('/login');
            onItemClick();
          }}
        >
          Log In
        </Button>
        <Button 
          onClick={() => {
            navigate('/signup');
            onItemClick();
          }}
        >
          Sign Up
        </Button>
      </div>
    );
  }
  
  // Desktop view
  if (currentUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {currentUser.fullName.split(' ')[0]}
            {currentUser.isPremium && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                Premium
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/trip-planner')}>
            <Map className="h-4 w-4 mr-2" />
            <span>Plan Your Trip</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/bookings')}>
            <MapPin className="h-4 w-4 mr-2" />
            <span>My Bookings</span>
          </DropdownMenuItem>
          {!currentUser.isPremium && (
            <DropdownMenuItem onClick={() => navigate('/premium')}>
              <Star className="h-4 w-4 mr-2" />
              <span>Upgrade to Premium</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <div className="flex items-center space-x-4">
      <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
        Log In
      </Button>
      <Button size="sm" onClick={() => navigate('/signup')}>
        Sign Up
      </Button>
    </div>
  );
};

export default NavUserMenu;
