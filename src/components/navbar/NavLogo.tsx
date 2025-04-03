
import React from 'react';
import { Link } from 'react-router-dom';

const NavLogo: React.FC = () => {
  return (
    <Link to="/" className="text-2xl font-bold text-primary">
      TourGuide
    </Link>
  );
};

export default NavLogo;
