import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const NavLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <MapPin className="h-6 w-6 text-primary" />
      <span className="font-semibold">CrowdLess</span>
    </Link>
  );
};

export default NavLogo;
