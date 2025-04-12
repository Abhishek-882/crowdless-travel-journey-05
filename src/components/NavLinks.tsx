
import React from 'react';
import { Link } from 'react-router-dom';

export const NavLinks = () => {
  return (
    <nav className="flex items-center space-x-6">
      <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
        Home
      </Link>
      <Link to="/destinations" className="text-sm font-medium transition-colors hover:text-primary">
        Destinations
      </Link>
      <Link to="/trip-planner" className="text-sm font-medium transition-colors hover:text-primary">
        Plan Trip
      </Link>
      <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
        About
      </Link>
      <Link to="/premium" className="text-sm font-medium transition-colors hover:text-primary">
        Premium
      </Link>
    </nav>
  );
};
