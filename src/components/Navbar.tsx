
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, MapPin, Map, CreditCard, Star } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            TourGuide
          </Link>

          {/* Menu toggle button for mobile */}
          {isMobile && (
            <button
              onClick={toggleMenu}
              className="text-gray-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <div className="flex items-center space-x-6">
                <Link
                  to="/"
                  className={`font-medium ${
                    isActive('/') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/destinations"
                  className={`font-medium ${
                    isActive('/destinations') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  Destinations
                </Link>
                <Link
                  to="/trip-planner"
                  className={`font-medium ${
                    isActive('/trip-planner') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  Plan Trip
                </Link>
                <Link
                  to="/about"
                  className={`font-medium ${
                    isActive('/about') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  About
                </Link>
                {!currentUser?.isPremium && (
                  <Link
                    to="/premium"
                    className="font-medium text-primary flex items-center"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Premium
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {currentUser ? (
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
                      <DropdownMenuItem onClick={() => navigate('/bookings')}>
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>My Bookings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/trip-planner')}>
                        <Map className="h-4 w-4 mr-2" />
                        <span>Plan a Trip</span>
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
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                      Log In
                    </Button>
                    <Button size="sm" onClick={() => navigate('/signup')}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isOpen && (
          <div className="pt-2 pb-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`px-2 py-2 rounded-md ${
                  isActive('/') ? 'bg-primary/10 text-primary' : 'text-gray-700'
                }`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/destinations"
                className={`px-2 py-2 rounded-md ${
                  isActive('/destinations') ? 'bg-primary/10 text-primary' : 'text-gray-700'
                }`}
                onClick={toggleMenu}
              >
                Destinations
              </Link>
              <Link
                to="/trip-planner"
                className={`px-2 py-2 rounded-md ${
                  isActive('/trip-planner') ? 'bg-primary/10 text-primary' : 'text-gray-700'
                }`}
                onClick={toggleMenu}
              >
                Plan Trip
              </Link>
              <Link
                to="/about"
                className={`px-2 py-2 rounded-md ${
                  isActive('/about') ? 'bg-primary/10 text-primary' : 'text-gray-700'
                }`}
                onClick={toggleMenu}
              >
                About
              </Link>
              {!currentUser?.isPremium && (
                <Link
                  to="/premium"
                  className="px-2 py-2 rounded-md text-primary flex items-center"
                  onClick={toggleMenu}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Premium
                </Link>
              )}
              
              {currentUser ? (
                <>
                  <Link
                    to="/bookings"
                    className="px-2 py-2 rounded-md text-gray-700"
                    onClick={toggleMenu}
                  >
                    <MapPin className="h-4 w-4 inline mr-1" />
                    My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="px-2 py-2 text-left rounded-md text-gray-700"
                  >
                    <LogOut className="h-4 w-4 inline mr-1" />
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/login');
                      toggleMenu();
                    }}
                  >
                    Log In
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/signup');
                      toggleMenu();
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
